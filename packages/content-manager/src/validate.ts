import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  DIFFICULTIES,
  LICENSE_TYPES,
  isPieceCount,
  type Catalog,
  type CatalogEntry,
} from './schema.ts';

export type ValidationIssue = {
  level: 'error' | 'warn';
  code: string;
  message: string;
  puzzleId?: string;
};

export type ValidationResult = {
  ok: boolean;
  catalog: Catalog | null;
  issues: ValidationIssue[];
  validIds: string[];
};

export type ValidateOptions = {
  minEntries: number;
  warnBelow: number;
  catalogPath: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function validateLicense(raw: unknown, id: string, issues: ValidationIssue[]): void {
  if (!isRecord(raw)) {
    issues.push({
      level: 'error',
      code: 'license.missing',
      message: 'Metadados de licença ausentes',
      puzzleId: id,
    });
    return;
  }
  for (const key of ['author', 'license', 'source', 'date'] as const) {
    if (!asString(raw[key])) {
      issues.push({
        level: 'error',
        code: `license.${key}`,
        message: `Campo de licença "${key}" obrigatório`,
        puzzleId: id,
      });
    }
  }
  if (!LICENSE_TYPES.includes(raw.type as never)) {
    issues.push({
      level: 'error',
      code: 'license.type',
      message: 'Tipo de licença inválido (original | licensed | authorized)',
      puzzleId: id,
    });
  }
}

function validateEntry(
  raw: unknown,
  catalogDir: string,
  issues: ValidationIssue[],
  hashes: Map<string, string>,
): CatalogEntry | null {
  if (!isRecord(raw)) {
    issues.push({ level: 'error', code: 'entry', message: 'Entrada de catálogo inválida' });
    return null;
  }
  const id = asString(raw.id);
  if (!id) {
    issues.push({ level: 'error', code: 'id', message: 'Puzzle sem id' });
    return null;
  }
  const name = asString(raw.name);
  const collection = asString(raw.collection);
  const description = asString(raw.description);
  if (!name || !collection || !description) {
    issues.push({
      level: 'error',
      code: 'meta',
      message: 'Nome, coleção e descrição são obrigatórios',
      puzzleId: id,
    });
  }
  if (!isPieceCount(raw.defaultPieceCount)) {
    issues.push({
      level: 'error',
      code: 'pieces',
      message: 'defaultPieceCount fora da tabela (12, 24, 48, 72, 96, 150, 200)',
      puzzleId: id,
    });
  }
  if (!DIFFICULTIES.includes(raw.difficulty as never)) {
    issues.push({
      level: 'error',
      code: 'difficulty',
      message: 'Dificuldade inválida',
      puzzleId: id,
    });
  }
  if (typeof raw.recommendedLevel !== 'number') {
    issues.push({
      level: 'error',
      code: 'level',
      message: 'recommendedLevel deve ser número',
      puzzleId: id,
    });
  }
  if (!isRecord(raw.unlock) || (raw.unlock.type !== 'free' && raw.unlock.type !== 'phase')) {
    issues.push({
      level: 'error',
      code: 'unlock',
      message: 'unlock.type deve ser free ou phase',
      puzzleId: id,
    });
  }
  validateLicense(raw.license, id, issues);

  if (!isRecord(raw.image)) {
    issues.push({
      level: 'error',
      code: 'image',
      message: 'Imagem ausente',
      puzzleId: id,
    });
    return null;
  }
  const src = asString(raw.image.src);
  const srcMedium = asString(raw.image.srcMedium);
  const thumbnail = asString(raw.image.thumbnail);
  const hash = asString(raw.image.hash);
  if (!src || !srcMedium || !thumbnail || !hash) {
    issues.push({
      level: 'error',
      code: 'image.meta',
      message: 'src, srcMedium, thumbnail e hash da imagem são obrigatórios',
      puzzleId: id,
    });
    return null;
  }
  const srcPath = resolve(catalogDir, src);
  const mediumPath = resolve(catalogDir, srcMedium);
  const thumbPath = resolve(catalogDir, thumbnail);
  if (!existsSync(srcPath)) {
    issues.push({
      level: 'error',
      code: 'image.missing',
      message: `Arquivo de imagem não encontrado: ${src}`,
      puzzleId: id,
    });
    return null;
  }
  if (!existsSync(mediumPath)) {
    issues.push({
      level: 'error',
      code: 'image.medium.missing',
      message: `Variante média não encontrada: ${srcMedium}`,
      puzzleId: id,
    });
  }
  if (!existsSync(thumbPath)) {
    issues.push({
      level: 'error',
      code: 'thumb.missing',
      message: `Thumbnail não encontrado: ${thumbnail}`,
      puzzleId: id,
    });
  }
  const largeBytes = statSync(srcPath).size;
  if (largeBytes > 350 * 1024) {
    issues.push({
      level: 'warn',
      code: 'image.size',
      message: `Versão grande com ${(largeBytes / 1024).toFixed(0)} KB (meta: 350 KB)`,
      puzzleId: id,
    });
  }
  const fileHash = sha256(readFileSync(srcPath));
  if (fileHash !== hash) {
    issues.push({
      level: 'error',
      code: 'image.hash',
      message: `Hash da imagem não confere (esperado ${hash.slice(0, 12)}…, obtido ${fileHash.slice(0, 12)}…)`,
      puzzleId: id,
    });
  }
  const previous = hashes.get(fileHash);
  if (previous && previous !== id) {
    issues.push({
      level: 'error',
      code: 'image.duplicate',
      message: `Imagem duplicada: ${id} e ${previous} compartilham o mesmo hash e não contam como desafios diferentes`,
      puzzleId: id,
    });
  } else {
    hashes.set(fileHash, id);
  }

  if (
    !name ||
    !collection ||
    !description ||
    !isPieceCount(raw.defaultPieceCount) ||
    !DIFFICULTIES.includes(raw.difficulty as never) ||
    typeof raw.recommendedLevel !== 'number'
  ) {
    return null;
  }

  const entry: CatalogEntry = {
    id,
    name,
    collection,
    description,
    recommendedLevel: raw.recommendedLevel,
    difficulty: raw.difficulty as CatalogEntry['difficulty'],
    defaultPieceCount: raw.defaultPieceCount,
    unlock:
      isRecord(raw.unlock) && raw.unlock.type === 'phase'
        ? { type: 'phase', phase: Number(raw.unlock.phase) }
        : { type: 'free' },
    license: raw.license as CatalogEntry['license'],
    image: {
      src,
      srcMedium,
      thumbnail,
      width: Number(raw.image.width) || 0,
      height: Number(raw.image.height) || 0,
      hash,
    },
  };
  if (isRecord(raw.story)) {
    const storyKeys = ['title', 'summary', 'reference', 'message', 'curiosity'] as const;
    const story: CatalogEntry['story'] = {
      title: asString(raw.story.title) ?? '',
      summary: asString(raw.story.summary) ?? '',
      reference: asString(raw.story.reference) ?? '',
      message: asString(raw.story.message) ?? '',
      curiosity: asString(raw.story.curiosity) ?? '',
    };
    for (const key of storyKeys) {
      if (!story[key]) {
        issues.push({
          level: 'error',
          code: `story.${key}`,
          message: `Campo de história "${key}" obrigatório quando story existe`,
          puzzleId: id,
        });
      }
    }
    entry.story = story;
  }
  return entry;
}

export function validateCatalogJson(
  raw: unknown,
  options: ValidateOptions,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const catalogDir = dirname(options.catalogPath);
  if (!isRecord(raw)) {
    return {
      ok: false,
      catalog: null,
      issues: [{ level: 'error', code: 'json', message: 'JSON raiz inválido' }],
      validIds: [],
    };
  }
  const appId = asString(raw.appId);
  const title = asString(raw.title);
  if (!appId || !title) {
    issues.push({
      level: 'error',
      code: 'catalog.meta',
      message: 'appId e title são obrigatórios',
    });
  }
  if (raw.locale !== 'pt-BR') {
    issues.push({
      level: 'error',
      code: 'locale',
      message: 'locale deve ser pt-BR',
    });
  }
  if (!Array.isArray(raw.puzzles)) {
    issues.push({
      level: 'error',
      code: 'puzzles',
      message: 'puzzles deve ser um array',
    });
    return { ok: false, catalog: null, issues, validIds: [] };
  }

  const hashes = new Map<string, string>();
  const ids = new Set<string>();
  const puzzles: CatalogEntry[] = [];
  for (const item of raw.puzzles) {
    const entry = validateEntry(item, catalogDir, issues, hashes);
    if (!entry) continue;
    if (ids.has(entry.id)) {
      issues.push({
        level: 'error',
        code: 'id.duplicate',
        message: `Id duplicado: ${entry.id}`,
        puzzleId: entry.id,
      });
      continue;
    }
    ids.add(entry.id);
    puzzles.push(entry);
  }

  if (appId === 'bible-puzzle') {
    for (const entry of puzzles) {
      if (!entry.story) {
        issues.push({
          level: 'error',
          code: 'story.missing',
          message: 'Entradas do Bible Puzzle precisam da história (story)',
          puzzleId: entry.id,
        });
      }
    }
  }

  if (puzzles.length < options.minEntries) {
    issues.push({
      level: 'error',
      code: 'min',
      message: `Catálogo ${appId ?? '?'} tem ${puzzles.length} registro(s) válido(s); mínimo atual é ${options.minEntries}`,
    });
  } else if (puzzles.length < options.warnBelow) {
    issues.push({
      level: 'warn',
      code: 'min.warn',
      message: `Catálogo ${appId} tem ${puzzles.length} registro(s); a meta da etapa 8 é ${options.warnBelow} imagens distintas (hash). Rode o validador com --min ${options.warnBelow} para falhar o CI.`,
    });
  }

  const hasError = issues.some((issue) => issue.level === 'error');
  const catalog: Catalog | null =
    appId && title
      ? { appId, title, locale: 'pt-BR', puzzles }
      : null;
  return {
    ok: !hasError && catalog !== null,
    catalog,
    issues,
    validIds: puzzles.map((item) => item.id),
  };
}

export function loadCatalogFile(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}
