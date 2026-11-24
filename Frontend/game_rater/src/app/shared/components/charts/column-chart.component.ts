import { Component, computed, input } from '@angular/core';
import { ItemGrafico } from './grafico.model';

/**
 * Colunas de série única (histograma / série anual).
 * Specs: coluna ≤ 24px, topo arredondado 4px, base reta numa linha de base única;
 * grade recessiva; valor exibido no tooltip (hover/foco), não em cada coluna.
 */
@Component({
  selector: 'app-column-chart',
  standalone: true,
  template: `
    <div class="grafico" [style.height.px]="altura()">
      <div class="grade" aria-hidden="true">
        <span [attr.data-v]="escala() + sufixo()"></span>
        <span [attr.data-v]="metade() + sufixo()"></span>
        <span data-v="0"></span>
      </div>
      <div class="colunas" role="list">
        @for (i of itens(); track i.rotulo) {
          <div class="col" role="listitem" tabindex="0"
               [attr.aria-label]="i.rotulo + ': ' + (i.valor ?? 0) + sufixo() + (i.detalhe ? ' — ' + i.detalhe : '')">
            <span class="barra" [style.height.%]="((i.valor ?? 0) / escala()) * 100"></span>
            <span class="tooltip" role="tooltip">
              <strong>{{ i.rotulo }}</strong><br />{{ i.valor ?? 0 }}{{ sufixo() }}@if (i.detalhe) { · {{ i.detalhe }} }
            </span>
          </div>
        }
      </div>
    </div>
    <div class="eixo-x" aria-hidden="true">
      @for (i of itens(); track i.rotulo) { <span>{{ i.rotulo }}</span> }
    </div>
  `,
  styles: `
    :host { display: block; padding-left: 36px; }
    .grafico { position: relative; }
    .grade { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
    .grade span { position: relative; border-top: 1px solid var(--border); }
    .grade span:last-child { border-top-color: var(--border-strong); }
    .grade span::before {
      content: attr(data-v); position: absolute; right: calc(100% + 8px); top: -8px;
      font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums;
    }
    .colunas { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 2px; }
    .col {
      position: relative; flex: 1; height: 100%; display: flex; align-items: flex-end; justify-content: center;
      border-radius: 4px 4px 0 0; outline: none;
    }
    .col:hover, .col:focus-visible { background: rgba(255, 255, 255, 0.04); }
    .barra { width: 100%; max-width: 24px; background: var(--series-1); border-radius: 4px 4px 0 0; transition: height 0.4s ease; }
    .tooltip {
      position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translate(-50%, 4px); z-index: 5;
      background: var(--surface-3); border: 1px solid var(--border-strong); color: var(--text-primary);
      padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px; line-height: 1.4; white-space: nowrap;
      box-shadow: var(--shadow); pointer-events: none; opacity: 0; transition: opacity 0.12s, transform 0.12s;
    }
    .col:hover .tooltip, .col:focus-visible .tooltip { opacity: 1; transform: translate(-50%, 0); }
    .eixo-x { display: flex; gap: 2px; margin-top: 6px; }
    .eixo-x span { flex: 1; text-align: center; font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; }
  `,
})
export class ColumnChartComponent {
  itens = input.required<ItemGrafico[]>();
  max = input<number | null>(null);
  altura = input(180);
  sufixo = input('');

  escala = computed(() => this.max() ?? Math.max(1, ...this.itens().map((i) => i.valor ?? 0)));
  metade = computed(() => Math.round(this.escala() / 2));
}
