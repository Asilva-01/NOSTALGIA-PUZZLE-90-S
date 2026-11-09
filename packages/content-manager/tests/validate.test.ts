import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateCatalogJson } from '../src/validate.ts';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function hash(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

const license = {
  author: 'Puzzle Universe',
  license: 'CC-BY-4.0',
  source: 'original-svg',
  date: '2026-11-08',
  type: 'original',
};

function puzzle(id: string) {
  return {
    id,
    name: id,
    collection: 'Demo',
    description: 'Imagem de teste',
    recommendedLevel: 1,
    difficulty: 'easy',
    defaultPieceCount: 12,
    unlock: { type: 'free' },
    license,
    image: {
      src: 'a.png',
      thumbnail: 'a-thumb.png',
      width: 1,
      height: 1,
      hash: hash(PNG),
    },
  };
}

function writeCatalog(puzzles: unknown[]) {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-'));
  writeFileSync(join(dir, 'a.png'), PNG);
  writeFileSync(join(dir, 'a-thumb.png'), PNG);
  const catalogPath = join(dir, 'catalog.json');
  writeFileSync(
    catalogPath,
    JSON.stringify({
      appId: 'test',
      title: 'Teste',
      locale: 'pt-BR',
      puzzles,
    }),
  );
  return catalogPath;
}

describe('validador de catálogo', () => {
  it('aceita um registro válido e avisa abaixo de 200', () => {
    const catalogPath = writeCatalog([puzzle('one')]);
    const result = validateCatalogJson(JSON.parse(readFileSync(catalogPath, 'utf8')), {
      minEntries: 1,
      warnBelow: 200,
      catalogPath,
    });
    expect(result.ok).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'min.warn')).toBe(true);
  });

  it('reprova imagens duplicadas pelo hash', () => {
    const catalogPath = writeCatalog([puzzle('one'), puzzle('two')]);
    const result = validateCatalogJson(JSON.parse(readFileSync(catalogPath, 'utf8')), {
      minEntries: 1,
      warnBelow: 200,
      catalogPath,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'image.duplicate')).toBe(true);
  });

  it('falha se o mínimo estrito da etapa 8 não for atingido', () => {
    const catalogPath = writeCatalog([puzzle('one')]);
    const result = validateCatalogJson(JSON.parse(readFileSync(catalogPath, 'utf8')), {
      minEntries: 200,
      warnBelow: 200,
      catalogPath,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'min')).toBe(true);
  });
});
