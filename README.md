# Game Rater

Reviews pessoais de jogos, com notas por categoria (média ponderada), backlog e estatísticas.

- **Backend:** Node + Express + PostgreSQL (`Backend/`)
- **Frontend:** Angular 17 standalone + signals (`Frontend/game_rater/`)

## Rodando

```bash
# 1. Backend
cd Backend
npm install
cp .env.example .env      # se ainda não tiver o .env; preencha o banco
npm run migrate           # cria o schema, insere os dados iniciais e importa o schema antigo (tb_*) se existir
npm run dev               # http://localhost:3000

# 2. Frontend
cd Frontend/game_rater
npm install
npm start                 # http://localhost:4200
```

### Importação IGDB / RAWG (opcional)

No `Backend/.env`:

- **IGDB:** crie um app em <https://dev.twitch.tv/console/apps> → `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET`
- **RAWG:** chave gratuita em <https://rawg.io/apidocs> → `RAWG_API_KEY`

Sem elas, o editor funciona normalmente, só sem a busca automática.

## Modelo de dados

| Tabela | O que guarda |
|---|---|
| `jogo` | dados objetivos (nome, datas, empresas, ids IGDB/RAWG) |
| `jogo_genero`, `jogo_plataforma`, `jogo_imagem` | relações do jogo |
| `review` | **sua** experiência: status, plataforma jogada, horas, datas, prioridade, veredito, prós/contras, publicada |
| `review_nota` | nota 0–100 + texto por categoria (`nota NULL` = não se aplica) |
| `categoria` | categorias avaliadas e seus **pesos** |
| `faixa_nota` | rótulos por faixa ("Bom", "Brilhante"...) e cores |
| `vw_review_nota` / `vw_jogo_card` | média ponderada e dados de listagem |

Backlog = review com status `quero_jogar`, `backlog` ou `jogando`.

Para mudar pesos, categorias ou rótulos, edite as tabelas `categoria` / `faixa_nota` (ou crie uma nova migration `004_*.sql`).

## API

| Método | Rota | |
|---|---|---|
| GET | `/api/lookups` | plataformas, gêneros, faixas etárias, categorias, faixas de nota |
| GET | `/api/jogos?status=&publicada=&q=&generoId=&plataformaId=&ordem=` | listagem |
| GET | `/api/jogos/:idOuSlug` | detalhe completo |
| POST / PUT | `/api/jogos` / `/api/jogos/:id` | cria / substitui jogo + review + notas + imagens |
| PATCH | `/api/jogos/:id/status` | troca rápida de status/prioridade (backlog) |
| DELETE | `/api/jogos/:id` | exclui (e remove uploads locais) |
| GET | `/api/estatisticas` | números da página de estatísticas |
| GET | `/api/externo/fontes`, `/api/externo/busca`, `/api/externo/:fonte/:id` | IGDB/RAWG |
| POST | `/api/uploads` | upload de imagens (campo `arquivos`) |

## TODOs conhecidos

- **Autenticação de admin** (`TODO(auth)`): hoje qualquer pessoa com acesso à API pode criar ou excluir. Precisa ser feita antes de publicar online.
- **Notas do público** (`TODO(notas-publico)` em `001_schema.sql`): tabela `usuario` + `review.usuario_id`.
- **Links de afiliado** (`TODO(afiliados)`): botões "Onde comprar" na página da review.
  - Banco: nova migration com `jogo_link_compra (id, jogo_id → jogo ON DELETE CASCADE, loja, url, plataforma_id NULL, ordem)`.
  - Editor: seção "Onde comprar" (opcional, disponível também em Quero jogar/Backlog).
  - Página: botões perto do veredito + aviso "Links de afiliado: posso receber comissão por compras" (diretrizes do CONAR).
  - Não guardar preço no banco (desatualiza); se um dia quiser, buscar ao vivo numa API de preços.
  - Depende de o site estar no ar, ou seja, de `TODO(auth)` resolvido antes.
