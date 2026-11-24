const { HttpError } = require('../utils/http-error');

/**
 * Valida req[origem] com um schema zod e substitui pelo valor parseado.
 * @param {import('zod').ZodType} schema
 * @param {'body' | 'query' | 'params'} origem
 */
const validar = (schema, origem = 'body') => (req, _res, next) => {
  const resultado = schema.safeParse(req[origem]);
  if (!resultado.success) {
    const erros = resultado.error.issues.map((i) => ({
      campo: i.path.join('.'),
      mensagem: i.message,
    }));
    return next(HttpError.requisicaoInvalida('Dados inválidos', erros));
  }
  // req.query é getter-only em algumas versões; guardamos em req.validado
  req.validado = { ...(req.validado || {}), [origem]: resultado.data };
  next();
};

module.exports = { validar };
