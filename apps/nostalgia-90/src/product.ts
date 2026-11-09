import type { Catalog } from '@puzzle-universe/content-manager';
import type { ProductConfig } from '@puzzle-universe/shared-ui';
import catalogJson from '../../../assets/nostalgia/catalog.json';
import arcade from '../../../assets/nostalgia/images/arcade-neon.png';
import arcadeThumb from '../../../assets/nostalgia/images/arcade-neon-thumb.png';

const catalog = catalogJson as Catalog;

const urls: Record<string, string> = {
  'images/arcade-neon.png': arcade,
  'images/arcade-neon-thumb.png': arcadeThumb,
};

export const product: ProductConfig = {
  appId: 'nostalgia-90',
  theme: 'nostalgia',
  name: "Nostalgia Puzzle 90's",
  shortName: 'Nostalgia 90',
  tagline: 'Fliperama de esquina, neon na madrugada, peças com aba de verdade. Sem franquia. Só memória.',
  catalog,
  assetUrl: (relativePath) => urls[relativePath] ?? relativePath,
};
