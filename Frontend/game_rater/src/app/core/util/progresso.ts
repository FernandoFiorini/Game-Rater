import { JogoCard } from '../models/jogo.model';

/** Em que pé está a avaliação do jogo. */
export type ProgressoAvaliacao = 'sem_notas' | 'falta_texto' | 'completa';

export const PROGRESSO: { valor: ProgressoAvaliacao; rotulo: string }[] = [
  { valor: 'sem_notas', rotulo: 'Sem notas' },
  { valor: 'falta_texto', rotulo: 'Falta texto' },
  { valor: 'completa', rotulo: 'Completa' },
];

/**
 * Completa = toda categoria com nota tem justificativa E o veredito tem resumo.
 * Qualquer nota dada sem isso = "Falta texto".
 */
export function progressoDe(j: Pick<JogoCard, 'qtdNotas' | 'qtdTextos' | 'temResumo'>): ProgressoAvaliacao {
  if (j.qtdNotas === 0) return 'sem_notas';
  if (j.qtdTextos >= j.qtdNotas && j.temResumo) return 'completa';
  return 'falta_texto';
}
