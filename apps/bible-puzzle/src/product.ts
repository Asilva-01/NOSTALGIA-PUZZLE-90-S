import type { Catalog } from '@puzzle-universe/content-manager';
import type { ProductConfig } from '@puzzle-universe/shared-ui';
import catalogJson from '../../../assets/bible/catalog.json';
import ark from '../../../assets/bible/images/noe-e-a-arca.png';
import arkThumb from '../../../assets/bible/images/noe-e-a-arca-thumb.png';

const catalog = catalogJson as Catalog;

const urls: Record<string, string> = {
  'images/noe-e-a-arca.png': ark,
  'images/noe-e-a-arca-thumb.png': arkThumb,
};

export const product: ProductConfig = {
  appId: 'bible-puzzle',
  theme: 'bible',
  name: 'Bible Puzzle Adventures',
  shortName: 'Bible Puzzle',
  tagline: 'Um livro ilustrado para montar em família. Histórias, mensagem e curiosidade em cada imagem.',
  catalog,
  assetUrl: (relativePath) => urls[relativePath] ?? relativePath,
};
