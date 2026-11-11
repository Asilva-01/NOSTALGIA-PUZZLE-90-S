# Pipeline de conteúdo

## Campos do catálogo

Cada puzzle: `id`, `nome`, `coleção`, `descrição`, `nível recomendado`, `dificuldade`, `quantidade de peças padrão`, `unlock` (`free` | `phase`), `image` (`src` grande, `srcMedium` ~800 px, `thumbnail` ~320 px, `width`, `height`, **hash SHA-256 da versão grande**), `license` (`author`, `license`, `source`, `date`, `type`: original/licensed/authorized). O Bible adiciona `story` (título, resumo, referência, mensagem, curiosidade) — obrigatório nesse app.

Imagens com o **mesmo hash não contam como desafios diferentes**.

A versão grande deve ficar **abaixo de 350 KB** (o validador avisa se passar).

## Fluxo para adicionar uma imagem

1. Arte original (nunca de terceiros) em 4:3.
2. `npm run assets:optimize` (lote 1) ou `npm run assets:optimize:lote2` (anexa sem tocar no lote 1), ou gere WebP à mão: grande (largura nativa até 1600 px), média 800 px, miniatura ~320 px, qualidade ~82.
3. Preencha `assets/<app>/catalog.json` com metadados e o hash SHA-256 da versão grande.
4. `npm run validate:catalog`.

`npm run assets:rasterize` só atualiza ícones PWA a partir dos SVG de `icon.svg`. **Não** reescreve o catálogo.

## Validador / CI

```bash
npx tsx packages/content-manager/src/cli.ts \
  --catalog assets/nostalgia/catalog.json \
  --catalog assets/bible/catalog.json \
  --min 25 \
  --warn-below 200
```

- `--min` abaixo do total → **erro** (quebra o CI).
- total ≥ `--min` e &lt; `--warn-below` → **aviso** (CI verde). A meta de 200 imagens permanece como aviso.

Nesta entrega: `--min 25` (10 artes do lote 1 + 15 do lote 2 por app). A etapa 8 troca para `--min 200`. Não baixe o mínimo.

## Como a etapa 8 fica obrigatória

No workflow `.github/workflows/ci.yml` e no script `validate:catalog`, trocar para `--min 200`. Variável opcional: `CATALOG_MIN=200`. Duplicatas por hash continuam sendo erro.

Não gere as 200 imagens antes do motor estar estável. Não pré-carregue as versões grandes no service worker.
