-- "Joguei no" passa a aceitar várias plataformas (ex.: PS5 e PS4).
-- review.plataforma_id (uma só) -> tabela review_plataforma (N:N).

CREATE TABLE review_plataforma (
  review_id      bigint NOT NULL REFERENCES review(id) ON DELETE CASCADE,
  plataforma_id  int    NOT NULL REFERENCES plataforma(id),
  PRIMARY KEY (review_id, plataforma_id)
);

-- migra o valor atual
INSERT INTO review_plataforma (review_id, plataforma_id)
SELECT id, plataforma_id FROM review WHERE plataforma_id IS NOT NULL;

-- a view depende da coluna antiga: recria sem ela
DROP VIEW vw_jogo_card;
ALTER TABLE review DROP COLUMN plataforma_id;

-- plataforma  = siglas em texto ("PS5 / PS4"), na ordem da tabela plataforma
-- plataforma_ids = ids, para filtros
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
  COALESCE((SELECT array_agg(p.id ORDER BY p.ordem, p.nome)
              FROM review_plataforma rp JOIN plataforma p ON p.id = rp.plataforma_id
             WHERE rp.review_id = r.id), '{}') AS plataforma_ids,
  (SELECT string_agg(COALESCE(p.sigla, p.nome), ' / ' ORDER BY p.ordem, p.nome)
     FROM review_plataforma rp JOIN plataforma p ON p.id = rp.plataforma_id
    WHERE rp.review_id = r.id) AS plataforma,
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
LEFT JOIN vw_review_nota vn ON vn.review_id = r.id
LEFT JOIN LATERAL (
  SELECT f.rotulo, f.cor FROM faixa_nota f
  WHERE vn.nota_final IS NOT NULL AND f.nota_minima <= vn.nota_final
  ORDER BY f.nota_minima DESC LIMIT 1
) fx ON true;
