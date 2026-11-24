import { ItemLookup } from './lookups.model';

export type StatusJogo = 'quero_jogar' | 'backlog' | 'jogando' | 'zerado' | 'platinado' | 'abandonado';

export type TipoImagem = 'capa' | 'banner' | 'screenshot';

export interface ImagemJogo {
  id?: number;
  url: string;
  tipo: TipoImagem;
}

/** Item de listagem (GET /jogos) */
export interface JogoCard {
  id: number;
  slug: string;
  nome: string;
  dtLancamento: string | null;
  desenvolvedora: string | null;
  status: StatusJogo;
  prioridade: number | null;
  horasJogadas: number | null;
  dtConclusao: string | null;
  publicada: boolean;
  dtPublicacao: string | null;
  atualizadoEm: string;
  plataformaId: number | null;
  plataforma: string | null;
  notaFinal: number | null;
  rotulo: string | null;
  cor: string | null;
  capaUrl: string | null;
  bannerUrl: string | null;
  generoIds: number[];
  generos: string[];
}

export interface NotaCategoria {
  categoriaId: number;
  categoria: string;
  peso: number;
  ordem: number;
  nota: number | null;
  texto: string | null;
}

export interface Review {
  id: number;
  status: StatusJogo;
  plataforma: ItemLookup | null;
  horasJogadas: number | null;
  dificuldade: string | null;
  dtInicio: string | null;
  dtConclusao: string | null;
  prioridade: number | null;
  resumo: string | null;
  pros: string[];
  contras: string[];
  notaManual: number | null;
  notaCalculada: number | null;
  notaFinal: number | null;
  rotulo: string | null;
  cor: string | null;
  publicada: boolean;
  dtPublicacao: string | null;
  atualizadoEm: string;
}

/** Detalhe completo (GET /jogos/:idOuSlug) */
export interface JogoDetalhe {
  id: number;
  slug: string;
  nome: string;
  descricao: string | null;
  dtLancamento: string | null;
  desenvolvedora: string | null;
  publisher: string | null;
  igdbId: number | null;
  rawgId: number | null;
  faixaEtaria: ItemLookup | null;
  generos: ItemLookup[];
  plataformas: ItemLookup[];
  imagens: ImagemJogo[];
  review: Review;
  notas: NotaCategoria[];
}

/** Corpo de POST/PUT /jogos */
export interface SalvarJogo {
  jogo: {
    nome: string;
    descricao: string | null;
    dtLancamento: string | null;
    desenvolvedora: string | null;
    publisher: string | null;
    faixaEtariaId: number | null;
    igdbId: number | null;
    rawgId: number | null;
    generoIds: number[];
    plataformaIds: number[];
  };
  review: {
    status: StatusJogo;
    plataformaId: number | null;
    horasJogadas: number | null;
    dificuldade: string | null;
    dtInicio: string | null;
    dtConclusao: string | null;
    prioridade: number | null;
    resumo: string | null;
    pros: string[];
    contras: string[];
    notaManual: number | null;
    publicada: boolean;
  };
  notas: { categoriaId: number; nota: number | null; texto: string | null }[];
  imagens: { url: string; tipo: TipoImagem }[];
}

export interface FiltrosJogos {
  q?: string;
  status?: StatusJogo[];
  publicada?: boolean;
  generoId?: number;
  plataformaId?: number;
  ordem?: 'nota' | 'recentes' | 'nome' | 'lancamento' | 'prioridade';
}
