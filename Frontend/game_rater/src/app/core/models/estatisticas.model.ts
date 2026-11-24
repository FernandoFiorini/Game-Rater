export interface JogoRanking {
  id: number;
  slug: string;
  nome: string;
  notaFinal: number;
  rotulo: string;
  cor: string;
  capaUrl: string | null;
}

export interface Estatisticas {
  resumo: {
    totalJogos: number;
    totalAvaliados: number;
    mediaGeral: number | null;
    horasTotais: number;
    concluidos: number;
    platinados: number;
    abandonados: number;
    jogando: number;
    backlog: number;
  };
  porCategoria: { id: number; nome: string; peso: number; media: number | null; quantidade: number }[];
  porGenero: { nome: string; media: number; quantidade: number }[];
  porPlataforma: { nome: string; quantidade: number; media: number | null; horas: number }[];
  porAnoLancamento: { ano: number; media: number; quantidade: number }[];
  concluidosPorAno: { ano: number; quantidade: number; horas: number }[];
  distribuicao: { inicio: number; fim: number; quantidade: number }[];
  melhores: JogoRanking[];
  piores: JogoRanking[];
}
