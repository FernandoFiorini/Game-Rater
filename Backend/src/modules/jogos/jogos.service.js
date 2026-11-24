const { pool, transacao } = require('../../config/db');
const { HttpError } = require('../../utils/http-error');
const { removerArquivosLocais } = require('../uploads/uploads.storage');
const { STATUS_SO_JOGO } = require('./jogos.schema');

const STATUS_CONCLUIDO = ['zerado', 'platinado'];

const COLUNAS_CARD = `
  id, slug, nome,
  dt_lancamento AS "dtLancamento",
  desenvolvedora,
  status, prioridade,
  horas_jogadas AS "horasJogadas",
  dt_conclusao  AS "dtConclusao",
  publicada,
  dt_publicacao AS "dtPublicacao",
  atualizado_em AS "atualizadoEm",
  plataforma_id AS "plataformaId",
  plataforma,
  nota_final AS "notaFinal",
  rotulo, cor,
  capa_url   AS "capaUrl",
  banner_url AS "bannerUrl",
  genero_ids AS "generoIds",
  generos`;

const ORDENACAO = {
  nota: 'nota_final DESC NULLS LAST, nome',
  recentes: 'COALESCE(dt_publicacao, atualizado_em) DESC',
  nome: 'nome',
  lancamento: 'dt_lancamento DESC NULLS LAST, nome',
  prioridade: 'prioridade DESC NULLS LAST, atualizado_em DESC',
};

/**
 * @param {{ q?: string, status?: string[], publicada?: boolean, generoId?: number,
 *           plataformaId?: number, ordem: keyof typeof ORDENACAO }} f
 */
async function listar(f) {
  const where = [];
  const params = [];
  const p = (v) => {
    params.push(v);
    return `$${params.length}`;
  };

  if (f.q) where.push(`(nome ILIKE ${p(`%${f.q}%`)} OR desenvolvedora ILIKE ${p(`%${f.q}%`)})`);
  if (f.status?.length) where.push(`status = ANY(${p(f.status)})`);
  if (f.publicada !== undefined) where.push(`publicada = ${p(f.publicada)}`);
  if (f.generoId) where.push(`${p(f.generoId)} = ANY(genero_ids)`);
  if (f.plataformaId) where.push(`plataforma_id = ${p(f.plataformaId)}`);

  const sql = `
    SELECT ${COLUNAS_CARD}
    FROM vw_jogo_card
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${ORDENACAO[f.ordem] ?? ORDENACAO.recentes}`;

  const { rows } = await pool.query(sql, params);
  return rows;
}

/** Busca por id numérico ou slug. */
async function obter(idOuSlug) {
  const porId = /^\d+$/.test(String(idOuSlug));
  const { rows } = await pool.query(
    `SELECT
       j.id, j.slug, j.nome, j.descricao,
       j.dt_lancamento AS "dtLancamento",
       j.desenvolvedora, j.publisher,
       j.igdb_id AS "igdbId", j.rawg_id AS "rawgId",
       CASE WHEN fe.id IS NULL THEN NULL ELSE json_build_object('id', fe.id, 'nome', fe.nome) END AS "faixaEtaria",
       json_build_object(
         'id', r.id,
         'status', r.status,
         'plataforma', CASE WHEN p.id IS NULL THEN NULL ELSE json_build_object('id', p.id, 'nome', p.nome) END,
         'horasJogadas', r.horas_jogadas,
         'dificuldade', r.dificuldade,
         'dtInicio', r.dt_inicio,
         'dtConclusao', r.dt_conclusao,
         'prioridade', r.prioridade,
         'resumo', r.resumo,
         'pros', r.pros,
         'contras', r.contras,
         'notaManual', r.nota_manual,
         'notaCalculada', vn.nota_calculada,
         'notaFinal', card.nota_final,
         'rotulo', card.rotulo,
         'cor', card.cor,
         'publicada', r.publicada,
         'dtPublicacao', r.dt_publicacao,
         'atualizadoEm', r.atualizado_em
       ) AS review
     FROM jogo j
     JOIN review r               ON r.jogo_id = j.id
     JOIN vw_review_nota vn      ON vn.review_id = r.id
     JOIN vw_jogo_card card      ON card.id = j.id
     LEFT JOIN plataforma p      ON p.id = r.plataforma_id
     LEFT JOIN faixa_etaria fe   ON fe.id = j.faixa_etaria_id
     WHERE ${porId ? 'j.id = $1' : 'j.slug = $1'}`,
    [porId ? Number(idOuSlug) : String(idOuSlug)],
  );

  const jogo = rows[0];
  if (!jogo) throw HttpError.naoEncontrado('Jogo não encontrado');

  const [generos, plataformas, imagens, notas] = await Promise.all([
    pool.query(
      `SELECT g.id, g.nome FROM jogo_genero jg JOIN genero g ON g.id = jg.genero_id
        WHERE jg.jogo_id = $1 ORDER BY g.nome`,
      [jogo.id],
    ),
    pool.query(
      `SELECT p.id, p.nome FROM jogo_plataforma jp JOIN plataforma p ON p.id = jp.plataforma_id
        WHERE jp.jogo_id = $1 ORDER BY p.ordem, p.nome`,
      [jogo.id],
    ),
    pool.query(
      `SELECT id, url, tipo, ordem FROM jogo_imagem WHERE jogo_id = $1 ORDER BY tipo, ordem, id`,
      [jogo.id],
    ),
    pool.query(
      `SELECT c.id AS "categoriaId", c.nome AS categoria, c.peso, c.ordem, rn.nota, rn.texto
         FROM review_nota rn JOIN categoria c ON c.id = rn.categoria_id
        WHERE rn.review_id = $1
        ORDER BY c.ordem, c.nome`,
      [jogo.review.id],
    ),
  ]);

  return {
    ...jogo,
    generos: generos.rows,
    plataformas: plataformas.rows,
    imagens: imagens.rows,
    notas: notas.rows,
  };
}

async function gerarSlugUnico(client, nome, ignorarId = null) {
  const { rows } = await client.query('SELECT fn_slug($1) AS base', [nome]);
  const base = rows[0].base || 'jogo';
  const existentes = await client.query(
    `SELECT slug FROM jogo WHERE (slug = $1 OR slug LIKE $1 || '-%') AND ($2::bigint IS NULL OR id <> $2)`,
    [base, ignorarId],
  );
  const usados = new Set(existentes.rows.map((r) => r.slug));
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Grava as tabelas filhas (substitui tudo). */
async function gravarFilhos(client, jogoId, reviewId, dados) {
  await client.query('DELETE FROM jogo_genero WHERE jogo_id = $1', [jogoId]);
  await client.query('DELETE FROM jogo_plataforma WHERE jogo_id = $1', [jogoId]);
  await client.query('DELETE FROM jogo_imagem WHERE jogo_id = $1', [jogoId]);
  await client.query('DELETE FROM review_nota WHERE review_id = $1', [reviewId]);

  const { generoIds, plataformaIds } = dados.jogo;

  if (generoIds.length) {
    await client.query(
      `INSERT INTO jogo_genero (jogo_id, genero_id)
       SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING`,
      [jogoId, generoIds],
    );
  }
  if (plataformaIds.length) {
    await client.query(
      `INSERT INTO jogo_plataforma (jogo_id, plataforma_id)
       SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING`,
      [jogoId, plataformaIds],
    );
  }
  if (dados.imagens.length) {
    await client.query(
      `INSERT INTO jogo_imagem (jogo_id, url, tipo, ordem)
       SELECT $1, i.url, i.tipo, i.ordem
         FROM unnest($2::text[], $3::text[]) WITH ORDINALITY AS i(url, tipo, ordem)`,
      [jogoId, dados.imagens.map((i) => i.url), dados.imagens.map((i) => i.tipo)],
    );
  }
  // notas sem valor e sem texto não precisam ser gravadas
  const notas = dados.notas.filter((n) => n.nota !== null || n.texto);
  if (notas.length) {
    await client.query(
      `INSERT INTO review_nota (review_id, categoria_id, nota, texto)
       SELECT $1, n.categoria_id, n.nota, n.texto
         FROM unnest($2::int[], $3::smallint[], $4::text[]) AS n(categoria_id, nota, texto)`,
      [reviewId, notas.map((n) => n.categoriaId), notas.map((n) => n.nota), notas.map((n) => n.texto ?? null)],
    );
  }
}

const valoresReview = (r) => [
  r.status,
  r.plataformaId ?? null,
  r.horasJogadas ?? null,
  r.dificuldade ?? null,
  r.dtInicio ?? null,
  r.dtConclusao ?? null,
  r.prioridade ?? null,
  r.resumo ?? null,
  r.pros,
  r.contras,
  r.notaManual ?? null,
  r.publicada,
];

const valoresJogo = (j) => [
  j.nome,
  j.descricao ?? null,
  j.dtLancamento ?? null,
  j.desenvolvedora ?? null,
  j.publisher ?? null,
  j.faixaEtariaId ?? null,
  j.igdbId ?? null,
  j.rawgId ?? null,
];

async function criar(dados) {
  return transacao(async (client) => {
    const slug = await gerarSlugUnico(client, dados.jogo.nome);
    const { rows: [jogo] } = await client.query(
      `INSERT INTO jogo (nome, descricao, dt_lancamento, desenvolvedora, publisher, faixa_etaria_id, igdb_id, rawg_id, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, slug`,
      [...valoresJogo(dados.jogo), slug],
    );

    const { rows: [review] } = await client.query(
      `INSERT INTO review (status, plataforma_id, horas_jogadas, dificuldade, dt_inicio, dt_conclusao,
                           prioridade, resumo, pros, contras, nota_manual, publicada, dt_publicacao, jogo_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CASE WHEN $12 THEN now() END, $13)
       RETURNING id`,
      [...valoresReview(dados.review), jogo.id],
    );

    await gravarFilhos(client, jogo.id, review.id, dados);
    return jogo;
  });
}

async function atualizar(id, dados) {
  const urlsAntigas = [];

  const resultado = await transacao(async (client) => {
    const { rows: [atual] } = await client.query(
      `SELECT j.nome, r.id AS review_id FROM jogo j JOIN review r ON r.jogo_id = j.id
        WHERE j.id = $1 FOR UPDATE`,
      [id],
    );
    if (!atual) throw HttpError.naoEncontrado('Jogo não encontrado');

    const imgs = await client.query('SELECT url FROM jogo_imagem WHERE jogo_id = $1', [id]);
    urlsAntigas.push(...imgs.rows.map((r) => r.url));

    const slug =
      atual.nome === dados.jogo.nome ? null : await gerarSlugUnico(client, dados.jogo.nome, id);

    const { rows: [jogo] } = await client.query(
      `UPDATE jogo SET
         nome = $1, descricao = $2, dt_lancamento = $3, desenvolvedora = $4, publisher = $5,
         faixa_etaria_id = $6, igdb_id = $7, rawg_id = $8, slug = COALESCE($9, slug)
       WHERE id = $10
       RETURNING id, slug`,
      [...valoresJogo(dados.jogo), slug, id],
    );

    await client.query(
      `UPDATE review SET
         status = $1, plataforma_id = $2, horas_jogadas = $3, dificuldade = $4, dt_inicio = $5,
         dt_conclusao = $6, prioridade = $7, resumo = $8, pros = $9, contras = $10,
         nota_manual = $11, publicada = $12,
         dt_publicacao = CASE WHEN $12 THEN COALESCE(dt_publicacao, now()) ELSE dt_publicacao END
       WHERE id = $13`,
      [...valoresReview(dados.review), atual.review_id],
    );

    await gravarFilhos(client, id, atual.review_id, dados);
    return jogo;
  });

  const urlsNovas = new Set(dados.imagens.map((i) => i.url));
  await removerArquivosLocais(urlsAntigas.filter((u) => !urlsNovas.has(u)));

  return resultado;
}

/** Troca rápida de status (usada pelo backlog). Preenche datas de início/conclusão se vazias. */
async function atualizarStatus(id, { status, prioridade }) {
  const { rows } = await pool.query(
    `UPDATE review SET
       status = $1,
       prioridade = COALESCE($2, prioridade),
       publicada = CASE WHEN $1 = ANY($5::text[]) THEN false ELSE publicada END,
       dt_inicio = CASE WHEN $1 = 'jogando' THEN COALESCE(dt_inicio, current_date) ELSE dt_inicio END,
       dt_conclusao = CASE WHEN $1 = ANY($4::text[]) THEN COALESCE(dt_conclusao, current_date) ELSE dt_conclusao END
     WHERE jogo_id = $3
     RETURNING id`,
    [status, prioridade ?? null, id, STATUS_CONCLUIDO, STATUS_SO_JOGO],
  );
  if (!rows.length) throw HttpError.naoEncontrado('Jogo não encontrado');
}

async function excluir(id) {
  const imgs = await pool.query('SELECT url FROM jogo_imagem WHERE jogo_id = $1', [id]);
  const { rowCount } = await pool.query('DELETE FROM jogo WHERE id = $1', [id]);
  if (!rowCount) throw HttpError.naoEncontrado('Jogo não encontrado');
  await removerArquivosLocais(imgs.rows.map((r) => r.url));
}

module.exports = { listar, obter, criar, atualizar, atualizarStatus, excluir };
