/** Nota final mínima para o selo "Must Play" (inclusive). */
export const MUST_PLAY_MIN = 90;

export const isMustPlay = (nota: number | null | undefined): boolean => nota != null && nota >= MUST_PLAY_MIN;
