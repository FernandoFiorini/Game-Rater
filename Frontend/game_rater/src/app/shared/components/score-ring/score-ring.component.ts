import { Component, computed, inject, input } from '@angular/core';
import { LookupsService } from '../../../core/services/lookups.service';

/** Anel de nota (0–100) com a cor da faixa ("Bom", "Brilhante"...). */
@Component({
  selector: 'app-score-ring',
  standalone: true,
  template: `
    <div class="ring" [style.width.px]="tamanho()" [style.height.px]="tamanho()"
         role="img" [attr.aria-label]="nota() == null ? 'Sem nota' : 'Nota ' + nota() + ' de 100' + (faixa() ? ', ' + faixa()!.rotulo : '')">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle class="trilho" cx="18" cy="18" r="15.9155" />
        @if (nota() != null) {
          <circle class="valor" cx="18" cy="18" r="15.9155"
                  [attr.stroke]="cor()"
                  [attr.stroke-dasharray]="nota() + ' ' + (100 - nota()!)" />
        }
      </svg>
      <span class="numero" [style.font-size.px]="tamanho() * 0.3">{{ nota() ?? '—' }}</span>
    </div>
    @if (mostrarRotulo() && faixa()) {
      <div class="rotulo">{{ faixa()!.rotulo }}</div>
    }
  `,
  styles: `
    :host { display: inline-flex; flex-direction: column; align-items: center; gap: 8px; }
    .ring { position: relative; display: grid; place-items: center; }
    svg { position: absolute; inset: 0; transform: rotate(-90deg); }
    circle { fill: none; stroke-width: 3; }
    .trilho { stroke: rgba(255, 255, 255, 0.1); }
    .valor { stroke-linecap: round; transition: stroke-dasharray 0.4s ease, stroke 0.3s; }
    .numero { font-family: var(--font-display); font-weight: 700; position: relative; }
    .rotulo { font-family: var(--font-display); font-weight: 600; font-size: 18px; }
  `,
})
export class ScoreRingComponent {
  private lookups = inject(LookupsService);

  nota = input<number | null | undefined>(null);
  tamanho = input(96);
  mostrarRotulo = input(false);

  faixa = computed(() => this.lookups.faixa(this.nota()));
  cor = computed(() => this.faixa()?.cor ?? 'var(--text-muted)');
}
