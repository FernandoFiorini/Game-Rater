const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../../utils/http-error');
const { validar } = require('../../middlewares/validar');
const { mapearGeneros, mapearPlataformas, mapearFaixaEsrb } = require('./mapeamento');
const igdb = require('./igdb');
const rawg = require('./rawg');

const FONTES = { igdb, rawg };
const fonte = z.enum(['igdb', 'rawg']);

const router = Router();

/** Quais fontes estão configuradas no .env */
router.get('/fontes', (_req, res) => {
  res.json({ igdb: igdb.configurado(), rawg: rawg.configurado() });
});

router.get(
  '/busca',
  validar(z.object({ fonte, q: z.string().trim().min(2, 'Digite ao menos 2 letras') }), 'query'),
  asyncHandler(async (req, res) => {
    const { fonte: f, q } = req.validado.query;
    res.json(await FONTES[f].buscar(q));
  }),
);

/** Detalhes normalizados + ids locais de gênero/plataforma/faixa etária já mapeados. */
router.get(
  '/:fonte/:id',
  validar(z.object({ fonte, id: z.coerce.number().int().positive() }), 'params'),
  asyncHandler(async (req, res) => {
    const { fonte: f, id } = req.validado.params;
    const d = await FONTES[f].detalhar(id);

    const [generos, plataformas, faixaEtariaId] = await Promise.all([
      mapearGeneros(d.generos),
      mapearPlataformas(d.plataformas),
      mapearFaixaEsrb(d.esrb),
    ]);

    res.json({
      fonte: d.fonte,
      idExterno: d.idExterno,
      nome: d.nome,
      descricao: d.descricao,
      dtLancamento: d.dtLancamento,
      desenvolvedora: d.desenvolvedora,
      publisher: d.publisher,
      faixaEtariaId,
      generoIds: generos.ids,
      plataformaIds: plataformas.ids,
      naoMapeados: { generos: generos.naoMapeados, plataformas: plataformas.naoMapeados },
      capaUrl: d.capaUrl,
      bannerUrl: d.bannerUrl,
      screenshots: d.screenshots,
    });
  }),
);

module.exports = router;
