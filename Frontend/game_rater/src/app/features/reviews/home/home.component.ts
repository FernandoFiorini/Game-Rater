import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { JogoCard } from '../../../core/models/jogo.model';
import { JogosService } from '../../../core/services/jogos.service';
import { LookupsService } from '../../../core/services/lookups.service';
import { GameCardComponent } from '../../../shared/components/game-card/game-card.component';

type Ordem = 'recentes' | 'nota' | 'nome' | 'lancamento';

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GameCardComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private jogosService = inject(JogosService);
  protected lookups = inject(LookupsService);

  /** undefined = carregando */
  private jogos = toSignal(
    this.jogosService.listar({ publicada: true }).pipe(map((j) => j as JogoCard[] | undefined)),
  );

  busca = signal('');
  generoId = signal<number | null>(null);
  plataformaId = signal<number | null>(null);
  ordem = signal<Ordem>('recentes');

  carregando = computed(() => this.jogos() === undefined);

  filtrados = computed(() => {
    const termo = normalizar(this.busca().trim());
    const g = this.generoId();
    const p = this.plataformaId();
    const lista = (this.jogos() ?? []).filter(
      (j) =>
        (!termo || normalizar(j.nome).includes(termo) || normalizar(j.desenvolvedora ?? '').includes(termo)) &&
        (!g || j.generoIds.includes(g)) &&
        (!p || j.plataformaIds.includes(p)),
    );

    const ordenadores: Record<Ordem, (a: JogoCard, b: JogoCard) => number> = {
      recentes: (a, b) => (b.dtPublicacao ?? b.atualizadoEm).localeCompare(a.dtPublicacao ?? a.atualizadoEm),
      nota: (a, b) => (b.notaFinal ?? -1) - (a.notaFinal ?? -1),
      nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
      lancamento: (a, b) => (b.dtLancamento ?? '').localeCompare(a.dtLancamento ?? ''),
    };
    return [...lista].sort(ordenadores[this.ordem()]);
  });

  temFiltro = computed(() => !!(this.busca() || this.generoId() || this.plataformaId()));

  limpar() {
    this.busca.set('');
    this.generoId.set(null);
    this.plataformaId.set(null);
  }

  numero(v: string): number | null {
    return v ? Number(v) : null;
  }
}
