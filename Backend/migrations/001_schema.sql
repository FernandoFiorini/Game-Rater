-- =====================================================================
-- Game Rater — schema principal
-- Escala de notas: 0 a 100 (inteiro). Exibição pode ser /10 no front.
--
-- Separação conceitual:
--   jogo        -> dados objetivos do jogo (vêm do IGDB/RAWG ou manual)
--   review      -> a SUA experiência com o jogo (status, horas, notas, veredito)
--   review_nota -> nota + texto por categoria
--
-- Backlog = review com status 'quero_jogar' | 'backlog' | 'jogando'.
--
-- TODO(notas-publico): quando houver avaliações do público:
--   1. criar tabela `usuario` (id, nome, email, senha_hash, papel 'admin'|'user')
--   2. adicionar `review.usuario_id bigint NOT NULL REFERENCES usuario`
--   3. trocar UNIQUE (jogo_id) por UNIQUE (jogo_id, usuario_id)
--   4. separar nas views a "nota do autor" (papel admin) da "nota do público"
-- =====================================================================

-- ---------- utilitários ----------------------------------------------

CREATE OR REPLACE FUNCTION fn_set_atualizado_em() RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_slug(texto text) RETURNS text AS $$
  SELECT trim(BOTH '-' FROM
           regexp_replace(
             lower(translate(texto,
               'áàâãäåéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÅÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
               'aaaaaaeeeeiiiiooooouuuucnaaaaaaeeeeiiiiooooouuuucn')),
             '[^a-z0-9]+', '-', 'g'));
$$ LANGUAGE sql IMMUTABLE;

-- ---------- tabelas de domínio ----------------------------------------

CREATE TABLE plataforma (
  id     int  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome   text NOT NULL UNIQUE,
  sigla  text,
  ordem  int  NOT NULL DEFAULT 0
);

CREATE TABLE genero (
  id    int  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome  text NOT NULL UNIQUE
);

CREATE TABLE faixa_etaria (
  id     int  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome   text NOT NULL UNIQUE,
  ordem  int  NOT NULL DEFAULT 0
);

-- Categorias avaliadas. `peso` define a importância relativa na média final.
CREATE TABLE categoria (
  id         int          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome       text         NOT NULL UNIQUE,
  descricao  text,
  peso       numeric(4,2) NOT NULL DEFAULT 1 CHECK (peso > 0),
  ordem      int          NOT NULL DEFAULT 0,
  ativa      boolean      NOT NULL DEFAULT true
);

-- Rótulos por faixa de nota ("Brilhante", "Bom"...). Vale a maior nota_minima <= nota.
CREATE TABLE faixa_nota (
  id           int      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nota_minima  smallint NOT NULL UNIQUE CHECK (nota_minima BETWEEN 0 AND 100),
  rotulo       text     NOT NULL,
  cor          text     NOT NULL
);

-- ---------- jogo ------------------------------------------------------

CREATE TABLE jogo (
  id               bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug             text        NOT NULL UNIQUE,
  nome             text        NOT NULL,
  descricao        text,
  dt_lancamento    date,
  desenvolvedora   text,
  publisher        text,
  faixa_etaria_id  int         REFERENCES faixa_etaria(id),
  igdb_id          bigint      UNIQUE,
  rawg_id          bigint      UNIQUE,
  criado_em        timestamptz NOT NULL DEFAULT now(),
  atualizado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_jogo_atualizado BEFORE UPDATE ON jogo
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- Plataformas em que o jogo foi lançado
CREATE TABLE jogo_plataforma (
  jogo_id        bigint NOT NULL REFERENCES jogo(id) ON DELETE CASCADE,
  plataforma_id  int    NOT NULL REFERENCES plataforma(id),
  PRIMARY KEY (jogo_id, plataforma_id)
);

CREATE TABLE jogo_genero (
  jogo_id    bigint NOT NULL REFERENCES jogo(id) ON DELETE CASCADE,
  genero_id  int    NOT NULL REFERENCES genero(id),
  PRIMARY KEY (jogo_id, genero_id)
);

-- url pode ser externa (IGDB/RAWG) ou local (/uploads/...)
CREATE TABLE jogo_imagem (
  id       bigint   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  jogo_id  bigint   NOT NULL REFERENCES jogo(id) ON DELETE CASCADE,
  url      text     NOT NULL,
  tipo     text     NOT NULL CHECK (tipo IN ('capa', 'banner', 'screenshot')),
  ordem    smallint NOT NULL DEFAULT 0
);
CREATE INDEX ix_jogo_imagem_jogo ON jogo_imagem (jogo_id);
-- no máximo 1 capa e 1 banner por jogo
CREATE UNIQUE INDEX ux_jogo_imagem_capa_banner ON jogo_imagem (jogo_id, tipo)
  WHERE tipo IN ('capa', 'banner');

-- ---------- review (experiência pessoal) ------------------------------

CREATE TABLE review (
  id              bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  jogo_id         bigint       NOT NULL UNIQUE REFERENCES jogo(id) ON DELETE CASCADE,
  status          text         NOT NULL DEFAULT 'backlog'
                    CHECK (status IN ('quero_jogar', 'backlog', 'jogando',
                                      'zerado', 'platinado', 'abandonado')),
  plataforma_id   int          REFERENCES plataforma(id),  -- onde VOCÊ jogou
  horas_jogadas   numeric(6,1) CHECK (horas_jogadas >= 0),
  dificuldade     text,                                     -- modo jogado: "Normal", "Difícil"...
  dt_inicio       date,
  dt_conclusao    date,
  prioridade      smallint     CHECK (prioridade BETWEEN 1 AND 5), -- usada no backlog
  resumo          text,                                     -- veredito (HTML do editor)
  pros            text[]       NOT NULL DEFAULT '{}',
  contras         text[]       NOT NULL DEFAULT '{}',
  nota_manual     smallint     CHECK (nota_manual BETWEEN 0 AND 100), -- sobrescreve a média ponderada
  publicada       boolean      NOT NULL DEFAULT false,
  dt_publicacao   timestamptz,
  criado_em       timestamptz  NOT NULL DEFAULT now(),
  atualizado_em   timestamptz  NOT NULL DEFAULT now(),
  CHECK (dt_conclusao IS NULL OR dt_inicio IS NULL OR dt_conclusao >= dt_inicio)
);
CREATE INDEX ix_review_status ON review (status);

CREATE TRIGGER trg_review_atualizado BEFORE UPDATE ON review
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- nota NULL = "não se aplica" (fica fora da média)
CREATE TABLE review_nota (
  review_id     bigint   NOT NULL REFERENCES review(id) ON DELETE CASCADE,
  categoria_id  int      NOT NULL REFERENCES categoria(id),
  nota          smallint CHECK (nota BETWEEN 0 AND 100),
  texto         text,
  PRIMARY KEY (review_id, categoria_id)
);

-- ---------- views ------------------------------------------------------

-- Nota final de cada review: média ponderada pelos pesos das categorias,
-- ou a nota manual quando informada.
CREATE VIEW vw_review_nota AS
SELECT
  r.id AS review_id,
  calc.nota_calculada,
  COALESCE(r.nota_manual, calc.nota_calculada) AS nota_final
FROM review r
LEFT JOIN LATERAL (
  SELECT round(sum(rn.nota * c.peso) / nullif(sum(c.peso), 0))::smallint AS nota_calculada
  FROM review_nota rn
  JOIN categoria c ON c.id = rn.categoria_id
  WHERE rn.review_id = r.id AND rn.nota IS NOT NULL
) calc ON true;

-- Visão "card" usada em listagens, backlog e estatísticas.
CREATE VIEW vw_jogo_card AS
SELECT
  j.id,
  j.slug,
  j.nome,
  j.dt_lancamento,
  j.desenvolvedora,
  r.id              AS review_id,
  r.status,
  r.prioridade,
  r.horas_jogadas,
  r.dt_conclusao,
  r.publicada,
  r.dt_publicacao,
  r.atualizado_em,
  p.id              AS plataforma_id,
  p.nome            AS plataforma,
  vn.nota_final,
  fx.rotulo,
  fx.cor,
  (SELECT url FROM jogo_imagem i WHERE i.jogo_id = j.id AND i.tipo = 'capa'   LIMIT 1) AS capa_url,
  (SELECT url FROM jogo_imagem i WHERE i.jogo_id = j.id AND i.tipo = 'banner' LIMIT 1) AS banner_url,
  COALESCE((SELECT array_agg(jg.genero_id ORDER BY jg.genero_id)
              FROM jogo_genero jg WHERE jg.jogo_id = j.id), '{}') AS genero_ids,
  COALESCE((SELECT array_agg(g.nome ORDER BY g.nome)
              FROM jogo_genero jg JOIN genero g ON g.id = jg.genero_id
             WHERE jg.jogo_id = j.id), '{}') AS generos
FROM jogo j
JOIN review r            ON r.jogo_id = j.id
LEFT JOIN plataforma p   ON p.id = r.plataforma_id
LEFT JOIN vw_review_nota vn ON vn.review_id = r.id
LEFT JOIN LATERAL (
  SELECT f.rotulo, f.cor FROM faixa_nota f
  WHERE vn.nota_final IS NOT NULL AND f.nota_minima <= vn.nota_final
  ORDER BY f.nota_minima DESC LIMIT 1
) fx ON true;
