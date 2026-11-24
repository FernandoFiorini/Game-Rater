import { Component, input, signal } from '@angular/core';
import { ItemGrafico } from './grafico.model';

/** Moldura de gráfico: título, subtítulo e alternância gráfico ⇄ tabela. */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  template: `
    <section class="card chart-card">
      <header>
        <div>
          <h3>{{ titulo() }}</h3>
          @if (subtitulo()) { <p class="sub">{{ subtitulo() }}</p> }
        </div>
        @if (itens().length) {
          <button type="button" class="btn ghost sm" (click)="tabela.set(!tabela())" [attr.aria-pressed]="tabela()">
            {{ tabela() ? 'Ver gráfico' : 'Ver tabela' }}
          </button>
        }
      </header>

      @if (!itens().length) {
        <p class="vazio">Sem dados suficientes ainda.</p>
      } @else if (tabela()) {
        <table>
          <caption class="sr-only">{{ titulo() }}</caption>
          <thead><tr><th>{{ colunaRotulo() }}</th><th class="num">{{ colunaValor() }}</th><th>Detalhe</th></tr></thead>
          <tbody>
            @for (i of itens(); track i.rotulo) {
              <tr><td>{{ i.rotulo }}</td><td class="num">{{ i.valor ?? '—' }}{{ i.valor != null ? sufixo() : '' }}</td><td class="muted">{{ i.detalhe ?? '' }}</td></tr>
            }
          </tbody>
        </table>
      } @else {
        <ng-content />
      }
    </section>
  `,
  styles: `
    .chart-card { display: flex; flex-direction: column; gap: 18px; padding: 20px 22px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    h3 { font-size: 16px; }
    .sub { margin: 4px 0 0; font-size: 13px; color: var(--text-muted); }
    .vazio { color: var(--text-muted); font-size: 14px; margin: 0; padding: 24px 0; text-align: center; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; color: var(--text-muted); font-weight: 500; padding: 6px 8px; border-bottom: 1px solid var(--border); }
    td { padding: 6px 8px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
  `,
})
export class ChartCardComponent {
  titulo = input.required<string>();
  subtitulo = input<string>();
  itens = input<ItemGrafico[]>([]);
  sufixo = input('');
  colunaRotulo = input('Item');
  colunaValor = input('Valor');

  tabela = signal(false);
}
