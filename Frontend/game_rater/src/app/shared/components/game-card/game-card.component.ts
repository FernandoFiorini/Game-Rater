import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JogoCard } from '../../../core/models/jogo.model';
import { ImgUrlPipe } from '../../pipes/img-url.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { MustPlayComponent } from '../must-play/must-play.component';
import { isMustPlay } from '../../../core/util/must-play';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [RouterLink, ImgUrlPipe, StatusBadgeComponent, MustPlayComponent],
  template: `
    <a class="game-card" [routerLink]="['/jogo', jogo().slug]">
      <div class="capa">
        @if (jogo().capaUrl) {
          <img [src]="jogo().capaUrl | imgUrl" [alt]="'Capa de ' + jogo().nome" loading="lazy" />
        } @else {
          <div class="sem-capa">{{ iniciais() }}</div>
        }
        @if (mustPlay()) {
          <app-must-play class="must-play" />
        }
        @if (jogo().notaFinal != null) {
          <div class="nota" [style.background]="jogo().cor">
            {{ jogo().notaFinal }}
          </div>
        }
        @if (!jogo().publicada) {
          <div class="flag"><app-status-badge [status]="jogo().status" /></div>
        }
      </div>
      <div class="info">
        <div class="nome" [title]="jogo().nome">{{ jogo().nome }}</div>
        <div class="meta">
          {{ jogo().plataforma ?? 'Sem plataforma' }}@if (ano()) { · {{ ano() }} }
        </div>
        @if (jogo().rotulo) {
          <div class="rotulo">{{ jogo().rotulo }}</div>
        }
      </div>
    </a>
  `,
  styles: `
    .game-card { display: block; border-radius: var(--radius); transition: transform 0.2s; }
    .game-card:hover { transform: translateY(-4px); }
    .game-card:hover .capa { box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); border-color: var(--border-strong); }
    .capa {
      position: relative; aspect-ratio: 3 / 4; border-radius: var(--radius);
      overflow: hidden; background: var(--surface-2); border: 1px solid var(--border);
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    img { width: 100%; height: 100%; object-fit: cover; }
    .sem-capa {
      width: 100%; height: 100%; display: grid; place-items: center;
      font-family: var(--font-display); font-size: 40px; font-weight: 700; color: var(--text-muted);
      background: linear-gradient(135deg, var(--surface-2), var(--surface-3));
    }
    .nota {
      position: absolute; top: 10px; right: 10px;
      min-width: 42px; height: 42px; padding: 0 6px; border-radius: 10px;
      display: grid; place-items: center;
      font-family: var(--font-display); font-weight: 700; font-size: 17px; color: #fff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    }
    .flag { position: absolute; left: 10px; bottom: 10px; }
    .must-play { position: absolute; left: 10px; bottom: 10px; }
    .info { padding: 10px 2px 0; }
    .nome { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { font-size: 13px; color: var(--text-muted); }
    .rotulo { font-size: 12px; color: var(--text-secondary); margin-top: 2px; font-weight: 500; }
  `,
})
export class GameCardComponent {
  jogo = input.required<JogoCard>();

  mustPlay = computed(() => this.jogo().publicada && isMustPlay(this.jogo().notaFinal));

  ano = computed(() => this.jogo().dtLancamento?.slice(0, 4) ?? null);
  iniciais = computed(() =>
    this.jogo()
      .nome.split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase(),
  );
}
