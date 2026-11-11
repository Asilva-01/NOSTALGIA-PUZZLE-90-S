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

const LOTE1_HASHES: Record<string, Record<string, string>> = {
  'nostalgia-90': {
    'quarto-tv': 'ea77b4dda20721b45c21f3365d4fd2ce8b0eb1dc84e7475c97cb18f5c1086053',
    fliperama: 'c4ede08e6cc3f789ecf0f447bc2e76d93715391551311a20d0d6e352a32fe471',
    locadora: '133b6fa339239a4de30825f9f55bb54eb1ad38ae6f9e7ca86c6563652d2d93cd',
    recreio: '10a23db163c179c0e36a2762cfc0623840e5e66142c0e4e35ea28a1cd18bd068',
    'festa-junina': 'fd6de1adae6c705356c6d498d6c3f575f791154115b63910e0d9f9d9ab7d5926',
    'praia-walkman': '273953ef83c93cf6f867c6edf9781236bc23d2119e32e7ca4c90698245ef2a94',
    'banca-jornal': '9c00136f4480295b155eefaa55246941cbc849e3fb10253964b73974322d0ad4',
    pelada: '95497616d3efd65cb1b7ee2ad879bd6445ac761309a3ac627a1ae59b0b55987e',
    'sala-auditorio': 'a0a2ab5a330566997e240ceee3f99ada46331b4fcfea4e600caa14e9c222edc8',
    parque: '78602ff1d0860184995347e06a6e91deb4fa21bff6ebb053eeeb6c03a91e6b76',
  },
  'bible-puzzle': {
    eden: 'd7e984c42496ddce6a68b8d7d069cae0e415516e38f6a827bc1ceba6c4ba105c',
    'mar-vermelho': '23eaecd36aa7f0829462e61c60a4b96e996c1173e0acc84f371ffdbd2036a6b4',
    'davi-golias': '84bb8c6b69debef82b5b728909c1b91c9e7058f94f7fb10177e95b8643edc5b9',
    'daniel-leoes': '58ec614d013e2d64333720a06374d261fec19600cdfbb4c990134ab36ceabadb',
    jonas: 'ca9be8adcedb49d6e24a99ba1cce3247a6278f34c3640a2c007b7235501c49d1',
    manjedoura: '1854456a2a839872219a9b35c4bd14227eeda6fc47e4a5b7c25a89b9bfa19a88',
    tempestade: '099205b980272a8d8129cedf0185e73dcb1ac91051250dad1b4d761d5d3d7208',
    'paes-peixes': '2098025a9c9fc6523384f2387b780801f6598de6284213b9c3f07671b19cacba',
    'bom-samaritano': '46cb71afe01b68c0d02fc640409a3e6613b8ae76ce98b24286c41fc34a65f873',
    'filho-prodigo': '23940033ef054a99fd57ef9c433384ede9b94ee145483f8c1d2fa07dbd12bff0',
  },
};

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

describe('catálogo lote 1', () => {
  it('preserva as 20 artes originais, hashes e arquivos no disco', () => {
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
      expect(result.issues.some((issue) => issue.level === 'error')).toBe(false);

      const appId = result.catalog?.appId ?? '';
      const expected = LOTE1_HASHES[appId];
      expect(expected).toBeDefined();
      const byId = new Map((result.catalog?.puzzles ?? []).map((puzzle) => [puzzle.id, puzzle]));
      const catalogDir = dirname(catalogPath);

      for (const [id, hash] of Object.entries(expected ?? {})) {
        const puzzle = byId.get(id);
        expect(puzzle, `lote 1 ausente: ${id}`).toBeDefined();
        if (!puzzle) continue;
        total += 1;
        expect(puzzle.image.hash).toBe(hash);
        expect(puzzle.defaultPieceCount).toBe(12);
        expect(puzzle.license.type).toBe('original');
        expect(puzzle.license.source).toBe(LICENSE_ORIGIN_PHRASE);
        const srcPath = resolve(catalogDir, puzzle.image.src);
        expect(existsSync(srcPath), srcPath).toBe(true);
        expect(sha256(readFileSync(srcPath))).toBe(hash);
        expect(statSync(srcPath).size).toBeLessThanOrEqual(350 * 1024);
      }
    }

    expect(total).toBe(20);
  });
});
