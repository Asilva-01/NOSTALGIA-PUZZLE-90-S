import type { Catalog, CatalogEntry } from '@puzzle-universe/content-manager';
import type { PieceCount } from '@puzzle-universe/puzzle-engine';

export type ThemeName = 'nostalgia' | 'bible';

export type ProductConfig = {
  appId: string;
  theme: ThemeName;
  name: string;
  shortName: string;
  tagline: string;
  catalog: Catalog;
  assetUrl: (relativePath: string) => string;
};

export type PlayTarget = {
  puzzle: CatalogEntry;
  pieceCount: PieceCount;
  phaseId: string | null;
  seed: number;
};
