import { Component, computed, inject, input } from '@angular/core';
import { LookupsService } from '../../../core/services/lookups.service';

let proximoId = 0;

/**
 * Anel de nota (0–100) no estilo "buraco negro": núcleo escuro, arco da nota
 * com brilho na cor da faixa ("Bom", "Brilhante"...) e um halo em volta.
 */
@Component({
  selector: 'app-score-ring',
  standalone: true,
  template: `
    <div class="ring" [style.width.px]="tamanho()" [style.height.px]="tamanho()" [style.--cor]="cor()"
         role="img" [attr.aria-label]="nota() == null ? 'Sem nota' : 'Nota ' + nota() + ' de 100' + (faixa() ? ', ' + faixa()!.rotulo : '')">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <defs>
          <radialGradient [attr.id]="idNucleo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#000000" />
            <stop offset="0.72" stop-color="#05040a" />
            <stop offset="1" stop-color="#16112b" />
          </radialGradient>
        </defs>
        <circle class="nucleo" cx="18" cy="18" r="16.5" [attr.fill]="'url(#' + idNucleo + ')'" />
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
    :host { display: inline-flex; flex-direction: column; align-items: center; gap: 10px; }
    .ring {
      position: relative; display: grid; place-items: center; border-radius: 50%;
      /* halo: a luz que escapa do horizonte de eventos */
      box-shadow: 0 0 calc(var(--tam, 1) * 28px) -6px color-mix(in srgb, var(--cor) 55%, transparent);
    }
    svg { position: absolute; inset: 0; transform: rotate(-90deg); overflow: visible; }
    circle { fill: none; stroke-width: 2.6; }
    .nucleo { stroke: none; }
    .trilho { stroke: rgba(255, 255, 255, 0.07); }
    .valor {
      stroke-linecap: round;
      filter: drop-shadow(0 0 1.2px var(--cor)) drop-shadow(0 0 3px color-mix(in srgb, var(--cor) 70%, transparent));
      transition: stroke-dasharray 0.4s ease, stroke 0.3s;
    }
    .numero {
      font-family: var(--font-display); font-weight: 700; position: relative; letter-spacing: -0.03em;
      text-shadow: 0 0 14px color-mix(in srgb, var(--cor) 45%, transparent);
    }
    .rotulo { font-family: var(--font-display); font-weight: 600; font-size: 18px; }
  `,
})
export class ScoreRingComponent {
  private lookups = inject(LookupsService);

  nota = input<number | null | undefined>(null);
  tamanho = input(96);
  mostrarRotulo = input(false);

  readonly idNucleo = `vr-nucleo-${proximoId++}`;

  faixa = computed(() => this.lookups.faixa(this.nota()));
  cor = computed(() => this.faixa()?.cor ?? '#4a4866');
}
