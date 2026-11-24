const env = require('../../config/env');
const { HttpError } = require('../../utils/http-error');

const API = 'https://api.igdb.com/v4';
const IMG = (id, tamanho) => `https://images.igdb.com/igdb/image/upload/t_${tamanho}/${id}.jpg`;

let token = { valor: '', expiraEm: 0 };

const configurado = () => Boolean(env.igdb.clientId && env.igdb.clientSecret);

async function obterToken() {
  if (token.valor && Date.now() < token.expiraEm) return token.valor;

  const url = new URL('https://id.twitch.tv/oauth2/token');
  url.searchParams.set('client_id', env.igdb.clientId);
  url.searchParams.set('client_secret', env.igdb.clientSecret);
  url.searchParams.set('grant_type', 'client_credentials');

  const resp = await fetch(url, { method: 'POST' });
  if (!resp.ok) throw new HttpError(502, 'Falha ao autenticar na Twitch/IGDB. Confira IGDB_CLIENT_ID/SECRET.');
  const json = await resp.json();
  // renova 5 min antes de expirar
  token = { valor: json.access_token, expiraEm: Date.now() + (json.expires_in - 300) * 1000 };
  return token.valor;
}

async function consultar(endpoint, corpo) {
  if (!configurado()) throw new HttpError(503, 'IGDB não configurado (IGDB_CLIENT_ID / IGDB_CLIENT_SECRET no .env)');

  const resp = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': env.igdb.clientId,
      Authorization: `Bearer ${await obterToken()}`,
      Accept: 'application/json',
    },
    body: corpo,
  });
  if (resp.status === 401) token = { valor: '', expiraEm: 0 };
  if (!resp.ok) throw new HttpError(502, `IGDB respondeu ${resp.status}`);
  return resp.json();
}

const dataUnix = (s) => (s ? new Date(s * 1000).toISOString().slice(0, 10) : null);

async function buscar(termo) {
  const seguro = termo.replace(/["\\]/g, '');
  const jogos = await consultar(
    'games',
    `search "${seguro}"; fields name,first_release_date,cover.image_id,platforms.name; limit 12;`,
  );
  return jogos.map((j) => ({
    fonte: 'igdb',
    idExterno: j.id,
    nome: j.name,
    ano: j.first_release_date ? new Date(j.first_release_date * 1000).getUTCFullYear() : null,
    capaUrl: j.cover ? IMG(j.cover.image_id, 'cover_big') : null,
    plataformas: (j.platforms || []).map((p) => p.name),
  }));
}

async function detalhar(id) {
  const [j] = await consultar(
    'games',
    `fields name,summary,first_release_date,genres.name,themes.name,platforms.name,
            cover.image_id,artworks.image_id,screenshots.image_id,
            involved_companies.developer,involved_companies.publisher,involved_companies.company.name;
     where id = ${Number(id)};`,
  );
  if (!j) throw HttpError.naoEncontrado('Jogo não encontrado no IGDB');

  const empresas = j.involved_companies || [];
  const nomesEmpresa = (filtro) =>
    empresas.filter(filtro).map((e) => e.company?.name).filter(Boolean).join(', ') || null;

  const banner = j.artworks?.[0] ?? j.screenshots?.[0];

  return {
    fonte: 'igdb',
    idExterno: j.id,
    nome: j.name,
    descricao: j.summary ?? null,
    dtLancamento: dataUnix(j.first_release_date),
    desenvolvedora: nomesEmpresa((e) => e.developer),
    publisher: nomesEmpresa((e) => e.publisher),
    generos: [...(j.genres || []), ...(j.themes || [])].map((g) => g.name),
    plataformas: (j.platforms || []).map((p) => p.name),
    esrb: null,
    capaUrl: j.cover ? IMG(j.cover.image_id, 'cover_big_2x') : null,
    bannerUrl: banner ? IMG(banner.image_id, '1080p') : null,
    screenshots: (j.screenshots || []).slice(0, 8).map((s) => IMG(s.image_id, 'screenshot_huge')),
  };
}

module.exports = { configurado, buscar, detalhar };
