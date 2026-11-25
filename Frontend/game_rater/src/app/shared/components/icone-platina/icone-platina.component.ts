import { Component, input } from '@angular/core';

/** Troféu de platina (desenho próprio, tons prateados frios). */
@Component({
  selector: 'app-icone-platina',
  standalone: true,
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="gr-platina" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.45" stop-color="#d5dde9" />
          <stop offset="1" stop-color="#9aa9c0" />
        </linearGradient>
      </defs>
      <!-- taça + alças -->
      <path fill="url(#gr-platina)"
            d="M7 2.5h10v2.2h3.2v2.6a4.6 4.6 0 0 1-3.9 4.55A5.2 5.2 0 0 1 13.1 15v2.3h3.1v2.1H7.8v-2.1h3.1V15a5.2 5.2 0 0 1-3.2-3.15A4.6 4.6 0 0 1 3.8 7.3V4.7H7V2.5Zm0 4.2H5.9v.6a2.5 2.5 0 0 0 1.35 2.2A5.3 5.3 0 0 1 7 8.1V6.7Zm10 0v1.4c0 .5-.08.97-.24 1.43a2.5 2.5 0 0 0 1.34-2.23v-.6H17Z" />
      <!-- base -->
      <rect x="6.6" y="20" width="10.8" height="1.9" rx="0.6" fill="url(#gr-platina)" />
      <!-- brilho -->
      <path d="M9.2 4.4v3.4" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.8" />
    </svg>
  `,
  styles: `:host { display: inline-flex; filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35)); }`,
})
export class IconePlatinaComponent {
  tamanho = input(14);
}
