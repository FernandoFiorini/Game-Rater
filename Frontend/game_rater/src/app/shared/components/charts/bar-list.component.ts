import { Component, computed, input } from '@angular/core';
import { ItemGrafico } from './grafico.model';

/**
 * Barras horizontais de série única.
 * Specs: barra ≤ 16px, ponta arredondada 4px, base reta; valor fora da ponta;
 * linha inteira é o alvo do hover/foco (tooltip com o detalhe).
 */
@Component({
  selector: 'app-bar-list',
  standalone: true,
  template: `
    <div class="lista" role="list">
      @for (i of itens(); track i.rotulo) {
        <div class="linha" role="listitem" tabindex="0"
             [attr.aria-label]="i.rotulo + ': ' + (i.valor ?? 'sem dados') + sufixo() + (i.detalhe ? ' — ' + i.detalhe : '')">
          <span class="rotulo" [title]="i.rotulo">{{ i.rotulo }}</span>
          <span class="trilho">
            @if (i.valor != null) {
              <span class="barra" [style.width.%]="(i.valor / escala()) * 100"></span>
            }
          </span>
          <span class="valor">{{ i.valor ?? '—' }}{{ i.valor != null ? sufixo() : '' }}</span>
          @if (i.detalhe) {
            <span class="tooltip" role="tooltip"><strong>{{ i.rotulo }}</strong><br />{{ i.valor ?? '—' }}{{ i.valor != null ? sufixo() : '' }} · {{ i.detalhe }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .lista { display: flex; flex-direction: column; gap: 2px; }
    .linha {
      position: relative;
      display: grid; grid-template-columns: minmax(90px, 160px) 1fr 52px;
      align-items: center; gap: 12px; padding: 6px 8px; margin: 0 -8px; border-radius: var(--radius-sm);
      outline: none;
    }
    .linha:hover, .linha:focus-visible { background: var(--surface-2); }
    .rotulo { font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .trilho { height: 16px; display: flex; align-items: center; }
    .barra { height: 100%; background: var(--series-1); border-radius: 0 4px 4px 0; min-width: 2px; transition: width 0.4s ease; }
    .valor { font-size: 13px; font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; color: var(--text-primary); }
    .tooltip {
      position: absolute; right: 60px; bottom: calc(100% + 4px); z-index: 5;
      background: var(--surface-3); border: 1px solid var(--border-strong); color: var(--text-primary);
      padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px; line-height: 1.4;
      box-shadow: var(--shadow); pointer-events: none; white-space: nowrap;
      opacity: 0; transform: translateY(4px); transition: opacity 0.12s, transform 0.12s;
    }
    .linha:hover .tooltip, .linha:focus-visible .tooltip { opacity: 1; transform: none; }
  `,
})
export class BarListComponent {
  itens = input.required<ItemGrafico[]>();
  /** valor máximo da escala; padrão = maior valor */
  max = input<number | null>(null);
  sufixo = input('');

  escala = computed(() => this.max() ?? Math.max(1, ...this.itens().map((i) => i.valor ?? 0)));
}
