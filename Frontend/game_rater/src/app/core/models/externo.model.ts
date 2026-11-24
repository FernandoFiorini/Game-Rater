export type FonteExterna = 'igdb' | 'rawg';

export interface FontesDisponiveis {
  igdb: boolean;
  rawg: boolean;
}

export interface ResultadoBuscaExterna {
  fonte: FonteExterna;
  idExterno: number;
  nome: string;
  ano: number | null;
  capaUrl: string | null;
  plataformas: string[];
}

export interface JogoExterno {
  fonte: FonteExterna;
  idExterno: number;
  nome: string;
  descricao: string | null;
  dtLancamento: string | null;
  desenvolvedora: string | null;
  publisher: string | null;
  faixaEtariaId: number | null;
  generoIds: number[];
  plataformaIds: number[];
  naoMapeados: { generos: string[]; plataformas: string[] };
  capaUrl: string | null;
  bannerUrl: string | null;
  screenshots: string[];
}
