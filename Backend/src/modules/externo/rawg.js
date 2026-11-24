const env = require('../../config/env');
const { HttpError } = require('../../utils/http-error');

const API = 'https://api.rawg.io/api';

const configurado = () => Boolean(env.rawg.apiKey);

async function consultar(caminho, params = {}) {
  if (!configurado()) throw new HttpError(503, 'RAWG não configurado (RAWG_API_KEY no .env)');

  const url = new URL(`${API}${caminho}`);
  url.searchParams.set('key', env.rawg.apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const resp = await fetch(url);
  if (resp.status === 404) throw HttpError.naoEncontrado('Jogo não encontrado no RAWG');
  if (!resp.ok) throw new HttpError(502, `RAWG respondeu ${resp.status}`);
  return resp.json();
}

async function buscar(termo) {
  const { results } = await consultar('/games', { search: termo, page_size: 12, search_precise: true });
  return results.map((j) => ({
    fonte: 'rawg',
    idExterno: j.id,
    nome: j.name,
    ano: j.released ? Number(j.released.slice(0, 4)) : null,
    capaUrl: j.background_image ?? null,
    plataformas: (j.platforms || []).map((p) => p.platform.name),
  }));
}

async function detalhar(id) {
  const [j, shots] = await Promise.all([
    consultar(`/games/${Number(id)}`),
    consultar(`/games/${Number(id)}/screenshots`).catch(() => ({ results: [] })),
  ]);

  const nomes = (lista) => (lista || []).map((x) => x.name).join(', ') || null;

  return {
    fonte: 'rawg',
    idExterno: j.id,
    nome: j.name,
    descricao: j.description_raw || null,
    dtLancamento: j.released ?? null,
    desenvolvedora: nomes(j.developers),
    publisher: nomes(j.publishers),
    generos: (j.genres || []).map((g) => g.name),
    plataformas: (j.platforms || []).map((p) => p.platform.name),
    esrb: j.esrb_rating?.slug ?? null,
    // RAWG não tem capa vertical; usamos a imagem principal como capa e a adicional como banner
    capaUrl: j.background_image ?? null,
    bannerUrl: j.background_image_additional || j.background_image || null,
    screenshots: (shots.results || []).slice(0, 8).map((s) => s.image),
  };
}

module.exports = { configurado, buscar, detalhar };
