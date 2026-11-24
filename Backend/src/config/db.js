const { Pool, types } = require('pg');
const env = require('./env');

// numeric -> number (pg devolve string por padrão para não perder precisão)
types.setTypeParser(types.builtins.NUMERIC, (v) => (v === null ? null : Number(v)));
// int8 (bigint) -> number. Seguro enquanto os ids couberem em 2^53.
types.setTypeParser(types.builtins.INT8, (v) => (v === null ? null : Number(v)));
// date -> 'YYYY-MM-DD' (sem conversão de fuso)
types.setTypeParser(types.builtins.DATE, (v) => v);

const pool = new Pool(env.db);

/**
 * Executa `fn` dentro de uma transação. Faz rollback se der erro.
 * @template T
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function transacao(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}

module.exports = { pool, transacao };
