import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LICENSE_DATE, LICENSE_ORIGIN, LOTE2_ENTRIES, type Lote2Entry } from './lote2-entries.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceRoot = resolve(process.env.LOTE2_SRC ?? '/tmp/arte-lote2');
const MAX_LARGE_BYTES = 350 * 1024;

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

async function encodeWebp(input: string, width: number, quality: number): Promise<Buffer> {
  return sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();
}

async function encodeLarge(input: string): Promise<{ buffer: Buffer; quality: number }> {
  let quality = 82;
  let buffer = await encodeWebp(input, 1600, quality);
  while (buffer.length > MAX_LARGE_BYTES && quality > 68) {
    quality -= 4;
    buffer = await encodeWebp(input, 1600, quality);
  }
  return { buffer, quality };
}

function writeFile(path: string, buffer: Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
}

type VariantPaths = {
  src: string;
  srcMedium: string;
  thumbnail: string;
  width: number;
  height: number;
  hash: string;
  bytes: { large: number; medium: number; thumb: number };
  quality: number;
};

async function processEntry(entry: Lote2Entry): Promise<VariantPaths> {
  const input = resolve(sourceRoot, entry.file);
  const outDir = resolve(root, 'assets', entry.app, 'images');
  const largePath = resolve(outDir, `${entry.slug}.webp`);
  const mediumPath = resolve(outDir, `${entry.slug}-800.webp`);
  const thumbPath = resolve(outDir, `${entry.slug}-thumb.webp`);

  const { buffer: large, quality } = await encodeLarge(input);
  const medium = await encodeWebp(input, 800, 82);
  const thumb = await encodeWebp(input, 320, 82);
  const meta = await sharp(large).metadata();

  writeFile(largePath, large);
  writeFile(mediumPath, medium);
  writeFile(thumbPath, thumb);

  return {
    src: `images/${entry.slug}.webp`,
    srcMedium: `images/${entry.slug}-800.webp`,
    thumbnail: `images/${entry.slug}-thumb.webp`,
    width: meta.width ?? 1600,
    height: meta.height ?? 1200,
    hash: sha256(large),
    bytes: { large: large.length, medium: medium.length, thumb: thumb.length },
    quality,
  };
}

function toPuzzle(entry: Lote2Entry, image: VariantPaths) {
  return {
    id: entry.id,
    name: entry.name,
    collection: entry.collection,
    description: entry.description,
    recommendedLevel: entry.recommendedLevel,
    difficulty: entry.difficulty,
    defaultPieceCount: entry.defaultPieceCount,
    unlock: entry.unlock,
    license: {
      author: 'Puzzle Universe',
      license: 'CC BY 4.0',
      source: LICENSE_ORIGIN,
      date: LICENSE_DATE,
      type: 'original',
    },
    ...(entry.story ? { story: entry.story } : {}),
    image: {
      src: image.src,
      srcMedium: image.srcMedium,
      thumbnail: image.thumbnail,
      width: image.width,
      height: image.height,
      hash: image.hash,
    },
  };
}

type CatalogJson = {
  appId: string;
  title: string;
  locale: 'pt-BR';
  puzzles: Array<ReturnType<typeof toPuzzle> & { id: string }>;
};

const LOTE2_IDS = new Set(LOTE2_ENTRIES.map((entry) => entry.id));

function mergeCatalog(app: 'nostalgia' | 'bible', incoming: ReturnType<typeof toPuzzle>[]): void {
  const catalogPath = resolve(root, 'assets', app, 'catalog.json');
  const current = JSON.parse(readFileSync(catalogPath, 'utf8')) as CatalogJson;
  for (const puzzle of incoming) {
    const existing = current.puzzles.find((item) => item.id === puzzle.id);
    if (existing && !LOTE2_IDS.has(existing.id)) {
      throw new Error(`Recusa: ${puzzle.id} já existe no lote anterior e não pode ser substituído`);
    }
  }
  const byId = new Map(current.puzzles.map((puzzle) => [puzzle.id, puzzle]));
  for (const puzzle of incoming) {
    byId.set(puzzle.id, puzzle);
  }
  const kept = current.puzzles.map((puzzle) => byId.get(puzzle.id) ?? puzzle);
  const existingIds = new Set(current.puzzles.map((puzzle) => puzzle.id));
  const appended = incoming.filter((puzzle) => !existingIds.has(puzzle.id));
  current.puzzles = [...kept, ...appended];
  writeFileSync(catalogPath, `${JSON.stringify(current, null, 2)}\n`);
}

const results: Array<{ entry: Lote2Entry; image: VariantPaths }> = [];
for (const entry of LOTE2_ENTRIES) {
  const image = await processEntry(entry);
  results.push({ entry, image });
  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log(
    `${entry.app}/${entry.slug} q=${image.quality} ${image.width}x${image.height} large=${kb(image.bytes.large)} medium=${kb(image.bytes.medium)} thumb=${kb(image.bytes.thumb)}`,
  );
}

mergeCatalog(
  'nostalgia',
  results.filter((item) => item.entry.app === 'nostalgia').map((item) => toPuzzle(item.entry, item.image)),
);
mergeCatalog(
  'bible',
  results.filter((item) => item.entry.app === 'bible').map((item) => toPuzzle(item.entry, item.image)),
);
console.log('catálogos atualizados (lote 2 anexado; lote 1 preservado)');
