const { Router } = require('express');
const { pool } = require('../../config/db');
const { asyncHandler } = require('../../utils/http-error');

const router = Router();

/** Tudo que o front precisa para montar selects, chips e rótulos de nota. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [plataformas, generos, faixasEtarias, categorias, faixasNota] = await Promise.all([
      pool.query('SELECT id, nome, sigla FROM plataforma ORDER BY ordem, nome'),
      pool.query('SELECT id, nome FROM genero ORDER BY nome'),
      pool.query('SELECT id, nome FROM faixa_etaria ORDER BY ordem, nome'),
      pool.query(
        `SELECT id, nome, descricao, peso, ordem
           FROM categoria WHERE ativa ORDER BY ordem, nome`,
      ),
      pool.query(
        `SELECT nota_minima AS "notaMinima", rotulo, cor
           FROM faixa_nota ORDER BY nota_minima`,
      ),
    ]);

    res.json({
      plataformas: plataformas.rows,
      generos: generos.rows,
      faixasEtarias: faixasEtarias.rows,
      categorias: categorias.rows,
      faixasNota: faixasNota.rows,
    });
  }),
);

module.exports = router;
