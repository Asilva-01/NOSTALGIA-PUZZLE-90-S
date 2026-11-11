import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildPhaseTable } from '@puzzle-universe/puzzle-engine';
import { LICENSE_ORIGIN_PHRASE } from '../src/schema.ts';
import { loadCatalogFile, validateCatalogJson } from '../src/validate.ts';

const LOTE2_IDS = [
  'orelhao',
  'pipas',
  'lanchonete',
  'shopping',
  'clube-piscina',
  'feira-livre',
  'aniversario',
  'cinema-bairro',
  'rolima',
  'gude',
  'radio-fm',
  'skate-praca',
  'casa-avo',
  'padaria',
  'acampamento',
  'noe-arca',
  'abraao-estrelas',
  'jose-manto',
  'sarca-ardente',
  'jerico',
  'rute-noemi',
  'ester',
  'salomao-templo',
  'elias-corvos',
  'samuel-menino',
  'bodas-cana',
  'jesus-aguas',
  'zaqueu',
  'ovelha-perdida',
  'tumulo-vazio',
] as const;

const root = resolve(fileURLToPath(new URL('../../..', import.meta.url)));

const CATALOGS = [
  resolve(root, 'assets/nostalgia/catalog.json'),
  resolve(root, 'assets/bible/catalog.json'),
] as const;

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

describe('catálogo lote 2', () => {
  it('tem 25 entradas por app, fases 11–25 com 24 peças e artes distintas', () => {
    const ids = new Set<string>();
    let total = 0;

    for (const catalogPath of CATALOGS) {
      const raw = loadCatalogFile(catalogPath);
      const result = validateCatalogJson(raw, {
        minEntries: 25,
        warnBelow: 200,
        catalogPath,
      });
      expect(result.ok, result.issues.map((issue) => issue.message).join('\n')).toBe(true);
      expect(result.catalog).not.toBeNull();
      expect(result.validIds).toHaveLength(25);
      expect(result.issues.some((issue) => issue.code === 'min.warn')).toBe(true);
      expect(result.issues.some((issue) => issue.level === 'error')).toBe(false);

      const catalogDir = dirname(catalogPath);
      const puzzles = result.catalog?.puzzles ?? [];
      const phases = buildPhaseTable(puzzles.map((puzzle) => puzzle.id));
      expect(phases[9]?.pieceCount).toBe(12);
      expect(phases[10]?.pieceCount).toBe(24);
      expect(phases[24]?.pieceCount).toBe(24);
      expect(phases[10]?.puzzleId).toBe(puzzles[10]?.id);
      expect(phases[24]?.puzzleId).toBe(puzzles[24]?.id);

      for (const puzzle of puzzles) {
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

      const lote2 = puzzles.slice(10);
      expect(lote2).toHaveLength(15);
      for (const puzzle of lote2) {
        expect(puzzle.defaultPieceCount).toBe(24);
        expect(puzzle.difficulty).toBe('medium');
        expect(puzzle.unlock.type).toBe('phase');
        if (puzzle.unlock.type === 'phase') {
          expect(puzzle.unlock.phase).toBeGreaterThanOrEqual(11);
          expect(puzzle.unlock.phase).toBeLessThanOrEqual(25);
        }
      }
    }

    expect(total).toBe(50);
    expect(ids.size).toBe(50);
    for (const id of LOTE2_IDS) {
      expect(ids.has(id), id).toBe(true);
    }
  });
});
