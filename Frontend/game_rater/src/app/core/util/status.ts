import { StatusJogo } from '../models/jogo.model';

export interface InfoStatus {
  valor: StatusJogo;
  rotulo: string;
  icone: string;
  /** true = ainda não terminou (aparece no backlog) */
  pendente: boolean;
}

/** Marcador: em vez de texto, renderiza <app-icone-platina> (troféu de platina em SVG). */
export const ICONE_PLATINA = '@platina';

export const STATUS: InfoStatus[] = [
  { valor: 'quero_jogar', rotulo: 'Quero jogar', icone: '☆', pendente: true },
  { valor: 'backlog', rotulo: 'Backlog', icone: '▤', pendente: true },
  { valor: 'jogando', rotulo: 'Jogando', icone: '▶', pendente: true },
  { valor: 'zerado', rotulo: 'Zerado', icone: '✓', pendente: false },
  { valor: 'platinado', rotulo: 'Platinado', icone: ICONE_PLATINA, pendente: false },
  { valor: 'abandonado', rotulo: 'Abandonado', icone: '✕', pendente: false },
];

const POR_VALOR = new Map(STATUS.map((s) => [s.valor, s]));

export const infoStatus = (s: StatusJogo): InfoStatus => POR_VALOR.get(s)!;

export const STATUS_PENDENTES = STATUS.filter((s) => s.pendente).map((s) => s.valor);

/** Ainda não jogou: o editor mostra só dados do jogo + capa (sem notas/experiência/veredito). */
export const STATUS_SO_JOGO: StatusJogo[] = ['quero_jogar', 'backlog'];
