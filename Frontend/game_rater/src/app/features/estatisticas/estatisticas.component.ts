import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstatisticasService } from '../../core/services/estatisticas.service';
import { LookupsService } from '../../core/services/lookups.service';
import { ItemGrafico } from '../../shared/components/charts/grafico.model';
import { ChartCardComponent } from '../../shared/components/charts/chart-card.component';
import { BarListComponent } from '../../shared/components/charts/bar-list.component';
import { ColumnChartComponent } from '../../shared/components/charts/column-chart.component';
import { ScoreRingComponent } from '../../shared/components/score-ring/score-ring.component';
import { CorTextoPipe } from '../../shared/pipes/cor-texto.pipe';
import { ImgUrlPipe } from '../../shared/pipes/img-url.pipe';

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

@Component({
  selector: 'app-estatisticas',
  standalone: true,
  imports: [DecimalPipe, RouterLink, ChartCardComponent, BarListComponent, ColumnChartComponent, ScoreRingComponent, ImgUrlPipe, CorTextoPipe],
  templateUrl: './estatisticas.component.html',
  styleUrl: './estatisticas.component.scss',
})
export class EstatisticasComponent {
  private service = inject(EstatisticasService);
  protected lookups = inject(LookupsService);

  dados = toSignal(this.service.obter());

  /** não repete jogos que já aparecem em "Melhores" (acontece com poucas reviews) */
  piores = computed(() => {
    const d = this.dados();
    if (!d) return [];
    const melhores = new Set(d.melhores.map((j) => j.id));
    return d.piores.filter((j) => !melhores.has(j.id));
  });

  porCategoria = computed<ItemGrafico[]>(() =>
    (this.dados()?.porCategoria ?? []).map((c) => ({
      rotulo: c.nome,
      valor: c.media,
      detalhe: `peso ×${c.peso} · ${plural(c.quantidade, 'nota', 'notas')}`,
    })),
  );

  porGenero = computed<ItemGrafico[]>(() =>
    (this.dados()?.porGenero ?? []).map((g) => ({
      rotulo: g.nome,
      valor: g.media,
      detalhe: plural(g.quantidade, 'jogo', 'jogos'),
    })),
  );

  porPlataforma = computed<ItemGrafico[]>(() =>
    (this.dados()?.porPlataforma ?? []).map((p) => ({
      rotulo: p.nome,
      valor: p.quantidade,
      detalhe: `${p.horas}h jogadas${p.media != null ? ` · média ${p.media}` : ''}`,
    })),
  );

  distribuicao = computed<ItemGrafico[]>(() =>
    (this.dados()?.distribuicao ?? []).map((d) => ({
      rotulo: `${d.inicio}`,
      valor: d.quantidade,
      detalhe: `notas de ${d.inicio} a ${d.fim}`,
    })),
  );
  temDistribuicao = computed(() => this.distribuicao().some((d) => d.valor));

  concluidosPorAno = computed<ItemGrafico[]>(() =>
    (this.dados()?.concluidosPorAno ?? []).map((a) => ({
      rotulo: String(a.ano),
      valor: a.quantidade,
      detalhe: `${a.horas}h jogadas`,
    })),
  );

  porAnoLancamento = computed<ItemGrafico[]>(() =>
    (this.dados()?.porAnoLancamento ?? []).map((a) => ({
      rotulo: String(a.ano),
      valor: a.media,
      detalhe: `média de ${plural(a.quantidade, 'jogo', 'jogos')}`,
    })),
  );
}
