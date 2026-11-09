# Como publicar o Bible Puzzle no repositório separado

O repositório https://github.com/Asilva-01/BIBLE-PUZZLE-ADVENTURES deve publicar o app **sem duplicar o motor**. Nada disto está implementado ainda.

## Recomendação: o monorepo continua sendo a fonte, o outro repo só publica

No `BIBLE-PUZZLE-ADVENTURES`, um workflow faz checkout **deste** monorepo num tag (`bible-v0.1.0`), executa `npm ci && npm run build:bible` com `VITE_BASE=/` (ou o path Pages daquele repo) e envia `apps/bible-puzzle/dist` para GitHub Pages / release.

Vantagens: um único lugar para o motor; o repo Bible permanece “vitrine” e store listing; não há fork divergente.

## Alternativa A — pacote versionado

Publicar `@puzzle-universe/puzzle-engine` (e `shared-ui`, `content-manager`) como tarball no GitHub Releases ou GitHub Packages. O repo Bible vira um app Vite fino que depende das versões. Mais trabalho de release; útil se o Bible ganhar time próprio.

## Alternativa B — git subtree

`git subtree split --prefix=apps/bible-puzzle` não basta: o app importa `packages/*` e `assets/bible`. Um subtree teria que incluir o motor ou o Bible quebraria. Evitar, salvo um split maior (`apps/bible-puzzle` + packages + assets/bible), que ainda duplica histórico.

## O que não fazer

- Copiar o motor para o outro repo.
- Publicar o Bible a partir deste repo no Pages do Nostalgia (identidade e domínio diferentes).

Quando for implementar, o primeiro passo é um tag `v0.1.0` neste monorepo e o workflow de checkout no repo Bible.
