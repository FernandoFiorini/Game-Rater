import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { JogoDetalhe } from '../../../core/models/jogo.model';
import { JogosService } from '../../../core/services/jogos.service';
import { LookupsService } from '../../../core/services/lookups.service';
import { ScoreRingComponent } from '../../../shared/components/score-ring/score-ring.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

type Estado = { carregando: true } | { carregando: false; jogo: JogoDetalhe | null };

@Component({
  selector: 'app-detalhe-jogo',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, ScoreRingComponent, StatusBadgeComponent, ImgUrlPipe],
  templateUrl: './detalhe-jogo.component.html',
  styleUrl: './detalhe-jogo.component.scss',
})
export class DetalheJogoComponent {
  private route = inject(ActivatedRoute);
  private jogosService = inject(JogosService);
  private titulo = inject(Title);
  protected lookups = inject(LookupsService);

  private estado = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('slug')!),
      switchMap((slug) =>
        this.jogosService.obter(slug).pipe(
          tap((j) => this.titulo.setTitle(`${j.nome} — Game Rater`)),
          map((jogo): Estado => ({ carregando: false, jogo })),
          catchError(() => of<Estado>({ carregando: false, jogo: null })),
          startWith<Estado>({ carregando: true }),
        ),
      ),
    ),
    { initialValue: { carregando: true } as Estado },
  );

  carregando = computed(() => this.estado().carregando);
  jogo = computed(() => {
    const e = this.estado();
    return e.carregando ? null : e.jogo;
  });

  capa = computed(() => this.jogo()?.imagens.find((i) => i.tipo === 'capa')?.url ?? null);
  banner = computed(() => {
    const imgs = this.jogo()?.imagens ?? [];
    return (imgs.find((i) => i.tipo === 'banner') ?? imgs.find((i) => i.tipo === 'screenshot') ?? imgs[0])?.url ?? null;
  });
  screenshots = computed(() => this.jogo()?.imagens.filter((i) => i.tipo === 'screenshot') ?? []);
  plataformasTexto = computed(() => this.jogo()?.plataformas.map((p) => p.nome).join(', ') ?? '');
  notasComTexto = computed(() => this.jogo()?.notas.filter((n) => n.texto) ?? []);

  imagemAberta = signal<string | null>(null);

  cor(nota: number | null): string {
    return this.lookups.faixa(nota)?.cor ?? 'var(--text-muted)';
  }

  irPara(categoriaId: number) {
    document.getElementById(`categoria-${categoriaId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
