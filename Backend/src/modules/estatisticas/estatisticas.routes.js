const { Router } = require('express');
const { pool } = require('../../config/db');
const { asyncHandler } = require('../../utils/http-error');

const router = Router();

// Médias consideram apenas reviews publicadas. Contagens de status consideram tudo.
const CONSULTAS = {
  resumo: `
    SELECT
      count(*)::int                                                   AS "totalJogos",
      count(*) FILTER (WHERE publicada)::int                          AS "totalAvaliados",
      round(avg(nota_final) FILTER (WHERE publicada))::int            AS "mediaGeral",
      COALESCE(sum(horas_jogadas), 0)::numeric(10,1)                  AS "horasTotais",
      count(*) FILTER (WHERE status IN ('zerado','platinado'))::int   AS concluidos,
      count(*) FILTER (WHERE status = 'platinado')::int               AS platinados,
      count(*) FILTER (WHERE status = 'abandonado')::int              AS abandonados,
      count(*) FILTER (WHERE status = 'jogando')::int                 AS jogando,
      count(*) FILTER (WHERE status IN ('backlog','quero_jogar'))::int AS backlog
    FROM vw_jogo_card`,

  porCategoria: `
    SELECT c.id, c.nome, c.peso,
           round(avg(rn.nota))::int AS media,
           count(rn.nota)::int      AS quantidade
    FROM categoria c
    LEFT JOIN (review_nota rn JOIN review r ON r.id = rn.review_id AND r.publicada)
           ON rn.categoria_id = c.id AND rn.nota IS NOT NULL
    WHERE c.ativa
    GROUP BY c.id
    ORDER BY c.ordem, c.nome`,

  porGenero: `
    SELECT g.nome, round(avg(v.nota_final))::int AS media, count(*)::int AS quantidade
    FROM vw_jogo_card v
    JOIN jogo_genero jg ON jg.jogo_id = v.id
    JOIN genero g       ON g.id = jg.genero_id
    WHERE v.publicada AND v.nota_final IS NOT NULL
    GROUP BY g.nome
    ORDER BY quantidade DESC, media DESC
    LIMIT 12`,

  porPlataforma: `
    SELECT plataforma AS nome,
           count(*)::int                                                AS quantidade,
           round(avg(nota_final) FILTER (WHERE publicada))::int         AS media,
           COALESCE(sum(horas_jogadas), 0)::numeric(10,1)               AS horas
    FROM vw_jogo_card
    WHERE plataforma IS NOT NULL AND status NOT IN ('backlog','quero_jogar')
    GROUP BY plataforma
    ORDER BY quantidade DESC`,

  porAnoLancamento: `
    SELECT extract(year FROM dt_lancamento)::int AS ano,
           round(avg(nota_final))::int           AS media,
           count(*)::int                         AS quantidade
    FROM vw_jogo_card
    WHERE publicada AND nota_final IS NOT NULL AND dt_lancamento IS NOT NULL
    GROUP BY 1
    ORDER BY 1`,

  concluidosPorAno: `
    SELECT extract(year FROM dt_conclusao)::int        AS ano,
           count(*)::int                               AS quantidade,
           COALESCE(sum(horas_jogadas), 0)::numeric(10,1) AS horas
    FROM vw_jogo_card
    WHERE status IN ('zerado','platinado') AND dt_conclusao IS NOT NULL
    GROUP BY 1
    ORDER BY 1`,

  distribuicao: `
    SELECT f.inicio, LEAST(f.inicio + 9, 100) AS fim,
           count(v.id)::int AS quantidade
    FROM generate_series(0, 90, 10) AS f(inicio)
    LEFT JOIN vw_jogo_card v
           ON v.publicada AND v.nota_final IS NOT NULL
          AND LEAST(v.nota_final / 10, 9) * 10 = f.inicio
    GROUP BY f.inicio
    ORDER BY f.inicio`,

  melhores: `
    SELECT id, slug, nome, nota_final AS "notaFinal", rotulo, cor, capa_url AS "capaUrl"
    FROM vw_jogo_card WHERE publicada AND nota_final IS NOT NULL
    ORDER BY nota_final DESC, nome LIMIT 5`,

  piores: `
    SELECT id, slug, nome, nota_final AS "notaFinal", rotulo, cor, capa_url AS "capaUrl"
    FROM vw_jogo_card WHERE publicada AND nota_final IS NOT NULL
    ORDER BY nota_final ASC, nome LIMIT 5`,
};

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const chaves = Object.keys(CONSULTAS);
    const resultados = await Promise.all(chaves.map((k) => pool.query(CONSULTAS[k])));
    const corpo = Object.fromEntries(chaves.map((k, i) => [k, resultados[i].rows]));
    corpo.resumo = corpo.resumo[0];
    res.json(corpo);
  }),
);

module.exports = router;
