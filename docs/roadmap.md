# Roadmap — etapas 2 a 10

A etapa 1 (arquitetura + motor jogável 12/24 + UI inicial + 1 imagem por app) já entrou. O lote 1 (10 artes originais por app) também. Este PR fecha o motor compartilhado: grupos, recorte variado, prévia parcial, som e polish de 48 peças.

## 2. Engine

Fechado neste PR: grupos de peças que se unem ao encostar (não só no slot final), variação de recorte (perfis de aba), prévia parcial com limites casual/desafio, feedback sonoro além do beep (ligar/desligar nas duas apps).

## 3. Protótipo 12 / 24 / 48

12 e 24 testados (inclusive e2e de montagem). 48 jogável no celular com zoom/pan, bandeja que pode exigir pan, peças com tamanho mínimo tátil e e2e de abertura + conclusão via motor. Falta telemetria local de tempo médio e renderer/testes de 72–200 peças.

## 4. Progressão + ajuda

Tabela, presets casual/desafio e limites por partida (imagem, dica, prévia parcial, bordas, mistura) existem. Falta medalhas, coleções completas, estatísticas na home e limites configuráveis peça a peça.

## 5. Aleatório

Desafio aleatório funcional. “Surpreenda-me” habilitado: imagem + dificuldade alinhadas ao nível, só desbloqueadas, sem repetir o imediato.

## 6–7. UI Nostalgia e Bible

Identidades iniciais distintas. Falta onboarding, loja de temas visuais originais, e telas de coleção cheia.

## 8. Catálogo e 200 desafios

Validador pronto; `--min 10` no CI, aviso abaixo de 200. Lote 2 de artes (fases 11–25) ainda não entra. Produzir o restante do lote original/licenciado, thumbnails preguiçosos, nunca pré-carregar 200 WebP grandes no service worker.

## 9. Persistência / PWA / testes

IndexedDB v1, SW e aviso de atualização existem. Grupos e uso de prévia entram no save da sessão sem migrar o schema. Falta migração v2, favoritos, histórico rico, testes de 72–200 peças no renderer.

## 10. Publicação web e Android

Pages do Nostalgia está **manual** (`workflow_dispatch`). Bible: ver `docs/publicacao-bible-puzzle.md`. Capacitor: só o config; `cap add android` fica para esta etapa.
