const { pool } = require('../../config/db');

/**
 * Nomes vindos do IGDB/RAWG (minúsculo) -> nome local (tabela genero/plataforma).
 * Nomes que não estiverem aqui são comparados direto com o nome local.
 */
const ALIAS_GENERO = {
  // IGDB genres
  'role-playing (rpg)': 'RPG',
  shooter: 'Tiro',
  adventure: 'Aventura',
  platform: 'Plataforma',
  racing: 'Corrida',
  sport: 'Esporte',
  fighting: 'Luta',
  puzzle: 'Puzzle',
  strategy: 'Estratégia',
  'real time strategy (rts)': 'Estratégia',
  'turn-based strategy (tbs)': 'Estratégia',
  tactical: 'Estratégia',
  simulator: 'Simulação',
  indie: 'Indie',
  arcade: 'Arcade',
  "hack and slash/beat 'em up": 'Hack and slash',
  // IGDB themes
  action: 'Ação',
  horror: 'Terror',
  survival: 'Sobrevivência',
  stealth: 'Stealth',
  'open world': 'Mundo aberto',
  // RAWG genres
  platformer: 'Plataforma',
  sports: 'Esporte',
  simulation: 'Simulação',
  rpg: 'RPG',
};

const ALIAS_PLATAFORMA = {
  'pc (microsoft windows)': 'PC',
  pc: 'PC',
  linux: 'PC',
  mac: 'PC',
  macos: 'PC',
  'playstation 5': 'PlayStation 5',
  'playstation 4': 'PlayStation 4',
  'xbox series x|s': 'Xbox Series X|S',
  'xbox series s/x': 'Xbox Series X|S',
  'xbox one': 'Xbox One',
  'nintendo switch': 'Nintendo Switch',
  'nintendo switch 2': 'Nintendo Switch 2',
  android: 'Mobile',
  ios: 'Mobile',
};

const ESRB_PARA_FAIXA = {
  everyone: 'Livre',
  'everyone-10-plus': '10 anos',
  teen: '14 anos',
  mature: '18 anos',
  'adults-only': '18 anos',
};

/**
 * Converte nomes externos em ids locais.
 * @returns {Promise<{ ids: number[], naoMapeados: string[] }>}
 */
async function mapear(tabela, alias, nomesExternos) {
  const { rows } = await pool.query(`SELECT id, nome FROM ${tabela}`);
  const porNome = new Map(rows.map((r) => [r.nome.toLowerCase(), r.id]));

  const ids = new Set();
  const naoMapeados = [];
  for (const externo of new Set(nomesExternos)) {
    const chave = externo.toLowerCase();
    const local = (alias[chave] ?? externo).toLowerCase();
    const id = porNome.get(local);
    if (id) ids.add(id);
    else naoMapeados.push(externo);
  }
  return { ids: [...ids], naoMapeados };
}

const mapearGeneros = (nomes) => mapear('genero', ALIAS_GENERO, nomes);
const mapearPlataformas = (nomes) => mapear('plataforma', ALIAS_PLATAFORMA, nomes);

async function mapearFaixaEsrb(slug) {
  const nome = slug && ESRB_PARA_FAIXA[slug];
  if (!nome) return null;
  const { rows } = await pool.query('SELECT id FROM faixa_etaria WHERE nome = $1', [nome]);
  return rows[0]?.id ?? null;
}

module.exports = { mapearGeneros, mapearPlataformas, mapearFaixaEsrb };
