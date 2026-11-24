const { HttpError } = require('../utils/http-error');

// Códigos de erro do Postgres que viram 4xx
const ERROS_PG = {
  '23505': [409, 'Registro duplicado'],
  '23503': [400, 'Referência inválida'],
  '23514': [400, 'Valor fora das regras permitidas'],
  '22P02': [400, 'Formato de valor inválido'],
};

// eslint-disable-next-line no-unused-vars
function errorHandler(erro, _req, res, _next) {
  if (erro instanceof HttpError) {
    return res.status(erro.status).json({ erro: erro.message, detalhes: erro.detalhes });
  }

  if (erro?.code && ERROS_PG[erro.code]) {
    const [status, mensagem] = ERROS_PG[erro.code];
    return res.status(status).json({ erro: mensagem, detalhes: erro.detail || erro.constraint });
  }

  // multer
  if (erro?.name === 'MulterError') {
    return res.status(400).json({ erro: `Upload inválido: ${erro.message}` });
  }

  console.error(erro);
  res.status(500).json({ erro: 'Erro interno no servidor' });
}

module.exports = { errorHandler };
