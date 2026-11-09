import type { Catalog } from '@puzzle-universe/content-manager';
import type { ProductConfig } from '@puzzle-universe/shared-ui';
import catalogJson from '../../../assets/nostalgia/catalog.json';

const catalog = catalogJson as Catalog;

const modules = import.meta.glob('../../../assets/nostalgia/images/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const urls: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop();
  if (file) urls[`images/${file}`] = url;
}

export const product: ProductConfig = {
  appId: 'nostalgia-90',
  theme: 'nostalgia',
  name: "Nostalgia Puzzle 90's",
  shortName: 'Nostalgia 90',
  tagline: 'Fliperama de esquina, neon na madrugada, peças com aba de verdade. Sem franquia. Só memória.',
  catalog,
  assetUrl: (relativePath) => urls[relativePath] ?? relativePath,
};
