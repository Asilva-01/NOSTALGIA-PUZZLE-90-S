# Pipeline de conteúdo

## Campos do catálogo

Cada puzzle: `id`, `nome`, `coleção`, `descrição`, `nível recomendado`, `dificuldade`, `quantidade de peças padrão`, `unlock` (`free` | `phase`), `image` (`src`, `thumbnail`, `width`, `height`, **hash SHA-256**), `license` (`author`, `license`, `source`, `date`, `type`: original/licensed/authorized). O Bible adiciona `story` (título, resumo, referência, mensagem, curiosidade).

Imagens com o **mesmo hash não contam como desafios diferentes**.

## Fluxo para adicionar uma imagem

1. Coloque o SVG (ou raster autorizado) em `assets/<app>/images/`.
2. Rode `npm run assets:rasterize` (ou adapte o script para o novo arquivo).
3. Preencha `assets/<app>/catalog.json` com metadados e o hash gerado.
4. `npm run validate:catalog`.

## Validador / CI

```bash
npx tsx packages/content-manager/src/cli.ts \
  --catalog assets/nostalgia/catalog.json \
  --catalog assets/bible/catalog.json \
  --min 1 \
  --warn-below 200
```

- `--min` abaixo do total → **erro** (quebra o CI).
- total ≥ `--min` e &lt; `--warn-below` → **aviso** (CI verde).

Nesta entrega: `--min 1`. Só existe 1 imagem por app.

## Como a etapa 8 fica obrigatória

No workflow `.github/workflows/ci.yml` e no script `validate:catalog`, trocar para `--min 200`. Variável opcional: `CATALOG_MIN=200`. Duplicatas por hash continuam sendo erro.

Não gere as 200 imagens antes do motor estar estável.
