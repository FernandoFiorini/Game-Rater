/**
 * Roda, em ordem, os arquivos migrations/NNN_*.sql ainda não aplicados.
 * Cada arquivo roda em sua própria transação e é registrado em schema_migrations.
 *
 * Uso: npm run migrate
 */
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../src/config/db');

const PASTA = path.resolve(__dirname, '../migrations');

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        nome        text PRIMARY KEY,
        aplicada_em timestamptz NOT NULL DEFAULT now()
      )`);

    const { rows } = await client.query('SELECT nome FROM schema_migrations');
    const aplicadas = new Set(rows.map((r) => r.nome));

    const arquivos = fs
      .readdirSync(PASTA)
      .filter((f) => /^\d+_.+\.sql$/.test(f))
      .sort();

    const pendentes = arquivos.filter((f) => !aplicadas.has(f));
    if (pendentes.length === 0) {
      console.log('Nenhuma migration pendente.');
      return;
    }

    client.on('notice', (n) => console.log(`  NOTICE: ${n.message}`));

    for (const arquivo of pendentes) {
      const sql = fs.readFileSync(path.join(PASTA, arquivo), 'utf8');
      process.stdout.write(`→ ${arquivo} ... `);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (nome) VALUES ($1)', [arquivo]);
        await client.query('COMMIT');
        console.log('ok');
      } catch (erro) {
        await client.query('ROLLBACK');
        console.log('FALHOU');
        throw erro;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((erro) => {
  console.error(erro.message);
  process.exit(1);
});
