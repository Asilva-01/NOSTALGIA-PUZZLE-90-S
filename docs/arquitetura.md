# Arquitetura — primeira entrega

## Monorepo

Workspaces npm. TypeScript strict. Vite em cada app.

```
apps/nostalgia-90      produto arcade (manifest, ícone, base path próprios)
apps/bible-puzzle      produto storybook
packages/puzzle-engine motor sem React (geometria, sessão, renderer Canvas, persistência)
packages/content-manager schema + CLI de validação
packages/shared-ui     casca React das duas UIs
packages/shared-utils  rng, math, format
assets/nostalgia|bible WebP (grande / 800 / thumb) + catálogo JSON
```

Cada app é publicável sozinha: `VITE_BASE`, `manifest.webmanifest`, ícones e `index.html` próprios.

## Motor

`puzzle-engine` não importa React.

1. **Grade** — 12, 24, 48, 72, 96, 150, 200. Escolhe cols×rows mais próxima do aspecto da imagem.
2. **Geometria** — arestas compartilhadas. Contorno liso (`flat`). Interiores com aba/encaixe em Bézier cúbica e perfis variados (`classic`, `wide`, `tall`, `round`, `square`, `stem`), seed determinística. Peça vizinha usa a mesma aresta invertida (abas complementares).
3. **Sessão** — embaralhamento Fisher–Yates, pointer drag, grupos de peças vizinhas alinhadas, snap por proximidade no tabuleiro, conclusão, pausa, cronômetro, limites de ajuda (incluindo prévia parcial), pontuação e estrelas.
4. **Renderer** — bitmap por peça (`OffscreenCanvas` com fallback), `requestAnimationFrame` só quando a tela está suja ou há arrasto, zoom/pan (roda, pinça, botões). Em 48+ a câmera inicial prioriza tamanho tátil; “Ver” enquadra o mundo inteiro.
5. **Persistência** — IndexedDB versionado (`puzzle-universe` v1): sessão corrente (inclui `groupId`), progresso, ajustes. Falha de leitura devolve estado vazio.
6. **Som** — Web Audio original (pegar, encaixar, unir grupo, concluir, erro, ajuda), respeitando o interruptor ligar/desligar.

Tamanho mínimo de peça na tela: 44 px (12/24 tentam caber na vista; 48+ pode exigir pan).

## Progressão

Tabela parametrizável em `PHASE_BANDS` (fases 1–200). Com 25 imagens, as fases 1–10 (12 peças) e 11–25 (24 peças) usam uma arte cada; a partir da 26 a tabela recicla o catálogo. Desbloqueio sequencial, replay liberado, estrelas e melhor pontuação por fase. No catálogo, 12/24/48 estão jogáveis para validar o motor sem grind.

## Aleatório

`pickRandomChallenge` só considera fase desbloqueada + `puzzleId` válido no catálogo, e evita o `lastRandomId` quando há alternativa. `pickSurpriseChallenge` prefere a faixa de peças e a dificuldade do nível atual do jogador. Trocar de desafio grava a sessão corrente antes de abrir a nova.

## Apps

`shared-ui` lê o catálogo e o tema (`data-theme`). Nostalgia e Bible só entregam tokens CSS, fontes, PWA e o JSON do produto.
