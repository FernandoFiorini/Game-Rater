class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} mensagem
   * @param {unknown} [detalhes]
   */
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }

  static naoEncontrado(mensagem = 'Recurso não encontrado') {
    return new HttpError(404, mensagem);
  }

  static requisicaoInvalida(mensagem, detalhes) {
    return new HttpError(400, mensagem, detalhes);
  }
}

/** Envolve handlers async para que erros cheguem ao errorHandler (Express 4). */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { HttpError, asyncHandler };
