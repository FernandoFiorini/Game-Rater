const { z } = require('zod');

const STATUS = ['quero_jogar', 'backlog', 'jogando', 'zerado', 'platinado', 'abandonado'];
/** Ainda não jogou: só dados do jogo + capa */
const STATUS_SO_JOGO = ['quero_jogar', 'backlog'];

const textoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullish();

const data = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD')
  .or(z.literal('').transform(() => null))
  .nullish();

const id = z.coerce.number().int().positive();

const jogoSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  descricao: textoOpcional,
  dtLancamento: data,
  desenvolvedora: textoOpcional,
  publisher: textoOpcional,
  faixaEtariaId: id.nullish(),
  igdbId: id.nullish(),
  rawgId: id.nullish(),
  generoIds: z.array(id).default([]),
  plataformaIds: z.array(id).default([]),
});

const reviewSchema = z
  .object({
    status: z.enum(STATUS).default('backlog'),
    /** plataformas em que VOCÊ jogou (pode ser mais de uma) */
    plataformaIds: z.array(id).default([]),
    /** em quais dessas plataformas platinei (subconjunto de plataformaIds) */
    platinadoIds: z.array(id).default([]),
    horasJogadas: z.coerce.number().min(0).max(99999).nullish(),
    dificuldade: textoOpcional,
    dtInicio: data,
    dtConclusao: data,
    prioridade: z.coerce.number().int().min(1).max(5).nullish(),
    resumo: textoOpcional,
    pros: z.array(z.string().trim().min(1)).default([]),
    contras: z.array(z.string().trim().min(1)).default([]),
    notaManual: z.coerce.number().int().min(0).max(100).nullish(),
    publicada: z.boolean().default(false),
  })
  .refine((r) => r.platinadoIds.every((p) => r.plataformaIds.includes(p)), {
    message: 'Platina marcada numa plataforma que não está em "Joguei no"',
    path: ['platinadoIds'],
  })
  .refine((r) => !r.dtInicio || !r.dtConclusao || r.dtConclusao >= r.dtInicio, {
    message: 'Data de conclusão não pode ser anterior ao início',
    path: ['dtConclusao'],
  });

const notaSchema = z.object({
  categoriaId: id,
  nota: z.number().int().min(0).max(100).nullable(), // null = não se aplica
  texto: textoOpcional,
});

const imagemSchema = z.object({
  url: z.string().trim().min(1),
  tipo: z.enum(['capa', 'banner', 'screenshot']),
});

const salvarJogoSchema = z
  .object({
    jogo: jogoSchema,
    review: reviewSchema,
    notas: z.array(notaSchema).default([]),
    imagens: z.array(imagemSchema).max(30).default([]),
  })
  .refine((d) => !d.review.publicada || d.notas.some((n) => n.nota !== null) || d.review.notaManual != null, {
    message: 'Para publicar, dê nota a pelo menos uma categoria',
    path: ['review', 'publicada'],
  })
  .refine(
    (d) =>
      !STATUS_SO_JOGO.includes(d.review.status) ||
      (!d.review.publicada && d.notas.every((n) => n.nota === null) && d.imagens.every((i) => i.tipo === 'capa')),
    {
      message: 'Jogos em "Quero jogar" ou "Backlog" não têm notas, review publicada, banner nem screenshots',
      path: ['review', 'status'],
    },
  )
  .refine((d) => d.imagens.filter((i) => i.tipo === 'capa').length <= 1, {
    message: 'Apenas uma capa por jogo',
    path: ['imagens'],
  })
  .refine((d) => d.imagens.filter((i) => i.tipo === 'banner').length <= 1, {
    message: 'Apenas um banner por jogo',
    path: ['imagens'],
  });

const statusSchema = z.object({
  status: z.enum(STATUS),
  prioridade: z.coerce.number().int().min(1).max(5).nullish(),
});

const listarSchema = z.object({
  q: z.string().trim().optional(),
  status: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').filter(Boolean) : undefined))
    .pipe(z.array(z.enum(STATUS)).optional()),
  publicada: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  generoId: id.optional(),
  plataformaId: id.optional(),
  ordem: z.enum(['nota', 'recentes', 'nome', 'lancamento', 'prioridade']).default('recentes'),
});

module.exports = { STATUS, STATUS_SO_JOGO, salvarJogoSchema, statusSchema, listarSchema };
