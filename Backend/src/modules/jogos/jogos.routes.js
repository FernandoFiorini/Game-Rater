const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../../utils/http-error');
const { validar } = require('../../middlewares/validar');
const { salvarJogoSchema, statusSchema, listarSchema } = require('./jogos.schema');
const service = require('./jogos.service');

// TODO(auth): proteger POST/PUT/PATCH/DELETE com um middleware de admin
// antes de publicar a aplicação.

const router = Router();
const idParam = validar(z.object({ id: z.coerce.number().int().positive() }), 'params');

router.get(
  '/',
  validar(listarSchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json(await service.listar(req.validado.query));
  }),
);

router.get(
  '/:idOuSlug',
  asyncHandler(async (req, res) => {
    res.json(await service.obter(req.params.idOuSlug));
  }),
);

router.post(
  '/',
  validar(salvarJogoSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await service.criar(req.validado.body));
  }),
);

router.put(
  '/:id',
  idParam,
  validar(salvarJogoSchema),
  asyncHandler(async (req, res) => {
    res.json(await service.atualizar(req.validado.params.id, req.validado.body));
  }),
);

router.patch(
  '/:id/status',
  idParam,
  validar(statusSchema),
  asyncHandler(async (req, res) => {
    await service.atualizarStatus(req.validado.params.id, req.validado.body);
    res.status(204).end();
  }),
);

router.delete(
  '/:id',
  idParam,
  asyncHandler(async (req, res) => {
    await service.excluir(req.validado.params.id);
    res.status(204).end();
  }),
);

module.exports = router;
