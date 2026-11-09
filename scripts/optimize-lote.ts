import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LICENSE_DATE, LICENSE_ORIGIN, LOTE1_ENTRIES, type Lote1Entry } from './lote1-entries.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceRoot = resolve(process.env.LOTE1_SRC ?? '/tmp/arte-lote1/arte-lote1');
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

async function processEntry(entry: Lote1Entry): Promise<VariantPaths> {
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

function toPuzzle(entry: Lote1Entry, image: VariantPaths) {
  return {
    id: entry.id,
    name: entry.name,
    collection: entry.collection,
    description: entry.description,
    recommendedLevel: entry.recommendedLevel,
    difficulty: 'easy',
    defaultPieceCount: 12,
    unlock: { type: 'free' },
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

const results: Array<{ entry: Lote1Entry; image: VariantPaths }> = [];
for (const entry of LOTE1_ENTRIES) {
  const image = await processEntry(entry);
  results.push({ entry, image });
  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log(
    `${entry.app}/${entry.slug} q=${image.quality} ${image.width}x${image.height} large=${kb(image.bytes.large)} medium=${kb(image.bytes.medium)} thumb=${kb(image.bytes.thumb)}`,
  );
}

function writeCatalog(app: 'nostalgia' | 'bible', appId: string, title: string): void {
  const puzzles = results.filter((item) => item.entry.app === app).map((item) => toPuzzle(item.entry, item.image));
  const catalog = {
    appId,
    title,
    locale: 'pt-BR',
    puzzles,
  };
  writeFileSync(resolve(root, 'assets', app, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
}

writeCatalog('nostalgia', 'nostalgia-90', "Nostalgia Puzzle 90's");
writeCatalog('bible', 'bible-puzzle', 'Bible Puzzle Adventures');
console.log('catálogos atualizados');
