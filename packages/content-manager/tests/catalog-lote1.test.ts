import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LICENSE_ORIGIN_PHRASE } from '../src/schema.ts';
import { loadCatalogFile, validateCatalogJson } from '../src/validate.ts';

const root = resolve(fileURLToPath(new URL('../../..', import.meta.url)));

const CATALOGS = [
  resolve(root, 'assets/nostalgia/catalog.json'),
  resolve(root, 'assets/bible/catalog.json'),
] as const;

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

describe('catálogo lote 1', () => {
  it('tem 20 entradas reais, arquivos no disco e metadados completos', () => {
    const ids = new Set<string>();
    let total = 0;

    for (const catalogPath of CATALOGS) {
      const raw = loadCatalogFile(catalogPath);
      const result = validateCatalogJson(raw, {
        minEntries: 10,
        warnBelow: 200,
        catalogPath,
      });
      expect(result.ok, result.issues.map((issue) => issue.message).join('\n')).toBe(true);
      expect(result.catalog).not.toBeNull();
      expect(result.validIds).toHaveLength(10);
      expect(result.issues.some((issue) => issue.code === 'min.warn')).toBe(true);
      expect(result.issues.some((issue) => issue.level === 'error')).toBe(false);

      const catalogDir = dirname(catalogPath);
      for (const puzzle of result.catalog?.puzzles ?? []) {
        total += 1;
        expect(ids.has(puzzle.id)).toBe(false);
        ids.add(puzzle.id);
        expect(puzzle.name.length).toBeGreaterThan(2);
        expect(puzzle.collection.length).toBeGreaterThan(2);
        expect(puzzle.description.length).toBeGreaterThan(20);
        expect(puzzle.license.type).toBe('original');
        expect(puzzle.license.source).toBe(LICENSE_ORIGIN_PHRASE);
        expect(puzzle.license.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(puzzle.image.width).toBeGreaterThanOrEqual(800);
        expect(puzzle.image.height).toBeGreaterThanOrEqual(600);

        const srcPath = resolve(catalogDir, puzzle.image.src);
        const mediumPath = resolve(catalogDir, puzzle.image.srcMedium);
        const thumbPath = resolve(catalogDir, puzzle.image.thumbnail);
        expect(existsSync(srcPath), srcPath).toBe(true);
        expect(existsSync(mediumPath), mediumPath).toBe(true);
        expect(existsSync(thumbPath), thumbPath).toBe(true);
        expect(sha256(readFileSync(srcPath))).toBe(puzzle.image.hash);
        expect(statSync(srcPath).size).toBeLessThanOrEqual(350 * 1024);
        expect(puzzle.image.src.endsWith('.webp')).toBe(true);
        expect(puzzle.image.srcMedium.endsWith('.webp')).toBe(true);
        expect(puzzle.image.thumbnail.endsWith('.webp')).toBe(true);

        if (result.catalog?.appId === 'bible-puzzle') {
          expect(puzzle.story?.title).toBeTruthy();
          expect(puzzle.story?.summary).toBeTruthy();
          expect(puzzle.story?.reference).toBeTruthy();
          expect(puzzle.story?.message).toBeTruthy();
          expect(puzzle.story?.curiosity).toBeTruthy();
        }
      }
    }

    expect(total).toBe(20);
    expect(ids.size).toBe(20);
  });
});
