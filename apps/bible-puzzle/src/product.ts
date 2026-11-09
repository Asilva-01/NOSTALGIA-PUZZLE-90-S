import type { Catalog } from '@puzzle-universe/content-manager';
import type { ProductConfig } from '@puzzle-universe/shared-ui';
import catalogJson from '../../../assets/bible/catalog.json';

const catalog = catalogJson as Catalog;

const modules = import.meta.glob('../../../assets/bible/images/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const urls: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop();
  if (file) urls[`images/${file}`] = url;
}

export const product: ProductConfig = {
  appId: 'bible-puzzle',
  theme: 'bible',
  name: 'Bible Puzzle Adventures',
  shortName: 'Bible Puzzle',
  tagline: 'Um livro ilustrado para montar em família. Histórias, mensagem e curiosidade em cada imagem.',
  catalog,
  assetUrl: (relativePath) => urls[relativePath] ?? relativePath,
};
