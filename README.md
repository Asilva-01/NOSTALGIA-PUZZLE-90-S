# Puzzle Universe

Monorepo da primeira entrega: dois jogos independentes que compartilham o motor de quebra-cabeça.

- **Nostalgia Puzzle 90's** — cartoon retrô / arcade
- **Bible Puzzle Adventures** — livro ilustrado, aquarela, histórias bíblicas

Sem backend, sem serviço pago, sem imagens de franquia.

## Requisitos

- Node.js 20+

## Comandos

```bash
npm install
npm run assets:rasterize   # SVG → PNG + hashes do catálogo (já versionado)
npm run dev:nostalgia      # http://127.0.0.1:5173
npm run dev:bible          # http://127.0.0.1:5174
npm run lint
npm run typecheck
npm test
npm run validate:catalog
npm run build
npm run test:e2e
```

Atalhos de desenvolvimento: `/?play=12`, `/?play=24` e `/?play=48` abrem o item do catálogo direto na contagem pedida.

## Catálogo (mínimo 200 na etapa 8)

Nesta entrega cada app tem **1 imagem original**. O validador roda com `--min 1 --warn-below 200`: passa no CI e emite aviso. Na etapa 8, troque para `--min 200` (documentado no workflow e em `docs/pipeline-de-conteudo.md`).

## GitHub Pages

O workflow `.github/workflows/pages.yml` publica o Nostalgia **somente via `workflow_dispatch`**. Não há deploy automático no `main` até o dono aprovar. Base path: `/NOSTALGIA-PUZZLE-90-S/`.

## Capacitor

Cada app tem `capacitor.config.ts`. O projeto Android **não** é gerado nesta entrega.

## Documentação

- [Arquitetura](docs/arquitetura.md)
- [Pipeline de conteúdo](docs/pipeline-de-conteudo.md)
- [Direitos autorais](docs/direitos-autorais.md)
- [Roadmap (etapas 2–10)](docs/roadmap.md)
- [Como o Bible Puzzle sai deste monorepo](docs/publicacao-bible-puzzle.md)
