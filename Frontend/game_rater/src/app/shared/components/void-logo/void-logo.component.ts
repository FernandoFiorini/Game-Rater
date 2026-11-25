import { Component, input } from '@angular/core';

let proximoId = 0;

/**
 * Marca do Void Rater: um anel em eclipse (o "vazio") com uma abertura
 * e um ponto de luz na borda — o horizonte de eventos.
 */
@Component({
  selector: 'app-void-logo',
  standalone: true,
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient [attr.id]="id + '-n'" cx="50%" cy="50%" r="50%">
          <stop offset="0.55" stop-color="#05050a" />
          <stop offset="1" stop-color="#1a1236" />
        </radialGradient>
        <linearGradient [attr.id]="id + '-a'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" [attr.stop-color]="claro() ? '#ffffff' : '#c8b6ff'" />
          <stop offset="1" [attr.stop-color]="claro() ? '#e6ddff' : '#7c5cff'" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" [attr.fill]="'url(#' + id + '-n)'" />
      <!-- anel com abertura no topo-direito -->
      <path d="M22.9 7.6A11.5 11.5 0 1 0 27.4 14" fill="none" [attr.stroke]="'url(#' + id + '-a)'" stroke-width="3.2" stroke-linecap="round" />
      <!-- ponto de luz -->
      <circle cx="25.9" cy="9.4" r="1.9" [attr.fill]="claro() ? '#ffffff' : '#e7deff'" />
    </svg>
  `,
  styles: `:host { display: inline-flex; filter: drop-shadow(0 0 6px rgba(124, 92, 255, 0.55)); }`,
})
export class VoidLogoComponent {
  tamanho = input(28);
  /** versão clara (para usar sobre fundos coloridos, como o selo Must Play) */
  claro = input(false);

  readonly id = `vr-logo-${proximoId++}`;
}
