import { PIECE_COUNTS, type PieceCount } from '@puzzle-universe/puzzle-engine';

export const LICENSE_TYPES = ['original', 'licensed', 'authorized'] as const;
export type LicenseType = (typeof LICENSE_TYPES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const LICENSE_ORIGIN_PHRASE = 'Arte original gerada por IA para o Puzzle Universe';

export type LicenseMeta = {
  author: string;
  license: string;
  source: string;
  date: string;
  type: LicenseType;
};

export type StoryMeta = {
  title: string;
  summary: string;
  reference: string;
  message: string;
  curiosity: string;
};

export type CatalogImage = {
  src: string;
  srcMedium: string;
  thumbnail: string;
  width: number;
  height: number;
  hash: string;
};

export type UnlockRule =
  | { type: 'free' }
  | { type: 'phase'; phase: number };

export type CatalogEntry = {
  id: string;
  name: string;
  collection: string;
  description: string;
  image: CatalogImage;
  recommendedLevel: number;
  difficulty: Difficulty;
  defaultPieceCount: PieceCount;
  unlock: UnlockRule;
  license: LicenseMeta;
  story?: StoryMeta;
};

export type Catalog = {
  appId: string;
  title: string;
  locale: 'pt-BR';
  puzzles: CatalogEntry[];
};

export function isPieceCount(value: unknown): value is PieceCount {
  return typeof value === 'number' && (PIECE_COUNTS as readonly number[]).includes(value);
}

export function catalogPlaySrc(image: CatalogImage, viewportWidth: number): string {
  return viewportWidth < 900 ? image.srcMedium : image.src;
}

export { PIECE_COUNTS };
