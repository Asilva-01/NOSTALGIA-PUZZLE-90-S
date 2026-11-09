# Créditos de arte — lote 1

Todas as imagens deste lote são **arte original gerada por IA para o Puzzle Universe**. Não há material de terceiros, franquia, logotipo ou personagem licenciado.

| Campo | Valor |
| --- | --- |
| Origem | Arte original gerada por IA para o Puzzle Universe |
| Tipo | `original` |
| Licença | CC BY 4.0 |
| Data | 2026-11-08 |
| Formato no app | WebP 4:3 (versão grande nativa, média ~800 px, miniatura ~320 px) |

Os JPG de trabalho do lote **não** entram no repositório. Só as variantes WebP otimizadas e o catálogo.

## Nostalgia Puzzle 90's

| Fase | Id | Título | Coleção |
| --- | --- | --- | --- |
| 1 | `quarto-tv` | Quarto com TV de tubo | Cotidiano dos anos 90 |
| 2 | `fliperama` | Fliperama | Lazer dos anos 90 |
| 3 | `locadora` | Locadora de vídeo | Cotidiano dos anos 90 |
| 4 | `recreio` | Recreio na escola | Escola dos anos 90 |
| 5 | `festa-junina` | Festa Junina | Festas dos anos 90 |
| 6 | `praia-walkman` | Praia com Walkman | Lazer dos anos 90 |
| 7 | `banca-jornal` | Banca de jornal | Cotidiano dos anos 90 |
| 8 | `pelada` | Pelada na rua | Esporte dos anos 90 |
| 9 | `sala-auditorio` | Sala — programa de auditório | TV dos anos 90 |
| 10 | `parque` | Parque de diversões | Lazer dos anos 90 |

## Bible Puzzle Adventures

Cada entrada traz `story` (título, resumo, referência, mensagem, curiosidade) ligada à coleção do testamento.

| Fase | Id | Título | Coleção | Referência |
| --- | --- | --- | --- | --- |
| 1 | `eden` | Criação / Éden | Antigo Testamento | Gênesis 1–3 |
| 2 | `mar-vermelho` | Moisés e o Mar Vermelho | Antigo Testamento | Êxodo 14 |
| 3 | `davi-golias` | Davi e Golias | Antigo Testamento | 1 Samuel 17 |
| 4 | `daniel-leoes` | Daniel na cova dos leões | Antigo Testamento | Daniel 6 |
| 5 | `jonas` | Jonas e o grande peixe | Antigo Testamento | Jonas 1–2 |
| 6 | `manjedoura` | Nascimento de Jesus | Novo Testamento | Lucas 2 |
| 7 | `tempestade` | Jesus acalma a tempestade | Novo Testamento | Marcos 4:35–41 |
| 8 | `paes-peixes` | Multiplicação dos pães | Novo Testamento | João 6:1–14 |
| 9 | `bom-samaritano` | Bom Samaritano | Novo Testamento | Lucas 10:25–37 |
| 10 | `filho-prodigo` | Filho Pródigo | Novo Testamento | Lucas 15:11–32 |

## Como regenerar as variantes

Com o diretório do lote extraído (JPG + `manifest.json`):

```bash
LOTE1_SRC=/caminho/arte-lote1 npm run assets:optimize
```

O script escreve WebP em `assets/<app>/images/` e atualiza `catalog.json` (hashes SHA-256 da versão grande). Não copie os JPG originais para o git.
