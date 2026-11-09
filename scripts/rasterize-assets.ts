import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

type Job = {
  svg: string;
  png: string;
  width: number;
};

function render(svgPath: string, outPath: string, width: number): Buffer {
  const svg = readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'transparent',
  });
  const png = resvg.render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  return png;
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

const jobs: Job[] = [
  {
    svg: resolve(root, 'assets/nostalgia/images/icon.svg'),
    png: resolve(root, 'apps/nostalgia-90/public/icons/icon-512.png'),
    width: 512,
  },
  {
    svg: resolve(root, 'assets/nostalgia/images/icon.svg'),
    png: resolve(root, 'apps/nostalgia-90/public/icons/icon-192.png'),
    width: 192,
  },
  {
    svg: resolve(root, 'assets/bible/images/icon.svg'),
    png: resolve(root, 'apps/bible-puzzle/public/icons/icon-512.png'),
    width: 512,
  },
  {
    svg: resolve(root, 'assets/bible/images/icon.svg'),
    png: resolve(root, 'apps/bible-puzzle/public/icons/icon-192.png'),
    width: 192,
  },
];

for (const job of jobs) {
  const png = render(job.svg, job.png, job.width);
  console.log('wrote', job.png, png.length, 'bytes');
}

console.log('ícones PWA atualizados (catálogos não são reescritos)');
