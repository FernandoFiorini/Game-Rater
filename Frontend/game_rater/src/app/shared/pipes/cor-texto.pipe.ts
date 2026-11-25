import { Pipe, PipeTransform } from '@angular/core';

/**
 * Cor de texto legível sobre um fundo colorido (ex.: selo de nota na cor da faixa).
 * Fundos claros (como o "branco-estelar" da Obra-prima) recebem texto escuro.
 */
@Pipe({ name: 'corTexto', standalone: true })
export class CorTextoPipe implements PipeTransform {
  transform(fundo: string | null | undefined): string {
    const m = fundo?.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return '#ffffff';
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
    // luminância relativa (WCAG)
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.45 ? '#14121f' : '#ffffff';
  }
}
