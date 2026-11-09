import { createHash } from 'node:crypto';
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

function sha(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

const jobs: Job[] = [
  {
    svg: resolve(root, 'assets/nostalgia/images/arcade-neon.svg'),
    png: resolve(root, 'assets/nostalgia/images/arcade-neon.png'),
    width: 1600,
  },
  {
    svg: resolve(root, 'assets/nostalgia/images/arcade-neon.svg'),
    png: resolve(root, 'assets/nostalgia/images/arcade-neon-thumb.png'),
    width: 480,
  },
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
    svg: resolve(root, 'assets/bible/images/noe-e-a-arca.svg'),
    png: resolve(root, 'assets/bible/images/noe-e-a-arca.png'),
    width: 1600,
  },
  {
    svg: resolve(root, 'assets/bible/images/noe-e-a-arca.svg'),
    png: resolve(root, 'assets/bible/images/noe-e-a-arca-thumb.png'),
    width: 480,
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

const hashes: Record<string, string> = {};
for (const job of jobs) {
  const png = render(job.svg, job.png, job.width);
  hashes[job.png] = sha(png);
  console.log('wrote', job.png, png.length, 'bytes');
}

const nostalgiaHash = hashes[resolve(root, 'assets/nostalgia/images/arcade-neon.png')];
const bibleHash = hashes[resolve(root, 'assets/bible/images/noe-e-a-arca.png')];
if (!nostalgiaHash || !bibleHash) {
  throw new Error('Falha ao calcular hash das imagens');
}

writeFileSync(
  resolve(root, 'assets/nostalgia/catalog.json'),
  `${JSON.stringify(
    {
      appId: 'nostalgia-90',
      title: "Nostalgia Puzzle 90's",
      locale: 'pt-BR',
      puzzles: [
        {
          id: 'arcade-neon',
          name: 'Fliperama Neon',
          collection: 'Esquina dos anos 90',
          description:
            'Uma loja de fliperama original, com cabinets geométricos, marquee neon e o chão xadrez da madrugada. Nenhum personagem ou marca de franquia.',
          recommendedLevel: 1,
          difficulty: 'easy',
          defaultPieceCount: 12,
          unlock: { type: 'free' },
          license: {
            author: 'Puzzle Universe / André Luiz (arte gerada em SVG original)',
            license: 'CC BY 4.0',
            source: 'assets/nostalgia/images/arcade-neon.svg',
            date: '2026-11-08',
            type: 'original',
          },
          image: {
            src: 'images/arcade-neon.png',
            thumbnail: 'images/arcade-neon-thumb.png',
            width: 1600,
            height: 1200,
            hash: nostalgiaHash,
          },
        },
      ],
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  resolve(root, 'assets/bible/catalog.json'),
  `${JSON.stringify(
    {
      appId: 'bible-puzzle',
      title: 'Bible Puzzle Adventures',
      locale: 'pt-BR',
      puzzles: [
        {
          id: 'noe-e-a-arca',
          name: 'Noé e a arca',
          collection: 'Noé e a arca',
          description:
            'Ilustração original em estilo livro infantil: a arca sobre as águas, o arco-íris da promessa e animais em pares.',
          recommendedLevel: 1,
          difficulty: 'easy',
          defaultPieceCount: 12,
          unlock: { type: 'free' },
          license: {
            author: 'Puzzle Universe / André Luiz (arte gerada em SVG original)',
            license: 'CC BY 4.0',
            source: 'assets/bible/images/noe-e-a-arca.svg',
            date: '2026-11-08',
            type: 'original',
          },
          story: {
            title: 'Noé e a arca',
            summary:
              'Noé constrói uma arca, acolhe os animais e atravessa o dilúvio. Quando as águas baixam, um arco-íris assina a promessa de recomeço.',
            reference: 'Gênesis 6–9',
            message: 'Cuidar uns dos outros e da criação é um jeito de honrar a promessa.',
            curiosity:
              'A palavra hebraica para arco-íris, qeshet, também pode significar arco de guerra — aqui transformado em sinal de paz.',
          },
          image: {
            src: 'images/noe-e-a-arca.png',
            thumbnail: 'images/noe-e-a-arca-thumb.png',
            width: 1600,
            height: 1200,
            hash: bibleHash,
          },
        },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log('catálogos atualizados com hashes');
