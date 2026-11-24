export interface ItemLookup {
  id: number;
  nome: string;
}

export interface Plataforma extends ItemLookup {
  sigla: string | null;
}

export interface Categoria extends ItemLookup {
  descricao: string | null;
  /** importância relativa na média ponderada */
  peso: number;
  ordem: number;
}

export interface FaixaNota {
  notaMinima: number;
  rotulo: string;
  cor: string;
}

export interface Lookups {
  plataformas: Plataforma[];
  generos: ItemLookup[];
  faixasEtarias: ItemLookup[];
  categorias: Categoria[];
  faixasNota: FaixaNota[];
}
