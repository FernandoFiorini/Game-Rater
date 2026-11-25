import { Component, computed, input } from '@angular/core';
import { JogoCard } from '../../../core/models/jogo.model';
import { PROGRESSO, progressoDe } from '../../../core/util/progresso';

/** Tag de progresso da avaliação: Sem notas / Falta texto / Completa. */
@Component({
  selector: 'app-progresso-badge',
  standalone: true,
  template: `
    <span class="tag" [attr.data-p]="progresso()" [title]="detalhe()">
      <span class="ponto" aria-hidden="true"></span>{{ rotulo() }}
    </span>
  `,
  styles: `
    .tag {
      display: inline-flex; align-items: center; gap: 6px;
      height: 22px; padding: 0 9px; border-radius: 999px;
      font-size: 11px; font-weight: 600; white-space: nowrap;
      border: 1px solid var(--border-strong); color: var(--text-muted); background: transparent;
    }
    .ponto { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    [data-p='falta_texto'] { color: #f0b46a; border-color: rgba(217, 98, 43, 0.55); background: rgba(217, 98, 43, 0.1); }
    [data-p='completa']    { color: #7fd1a6; border-color: rgba(47, 158, 110, 0.55); background: rgba(47, 158, 110, 0.1); }
  `,
})
export class ProgressoBadgeComponent {
  jogo = input.required<JogoCard>();

  progresso = computed(() => progressoDe(this.jogo()));
  rotulo = computed(() => PROGRESSO.find((p) => p.valor === this.progresso())!.rotulo);
  detalhe = computed(() => {
    const j = this.jogo();
    const partes = [`justificativas: ${j.qtdTextos} de ${j.qtdNotas}`, j.temResumo ? 'resumo: ok' : 'resumo: falta'];
    return partes.join(' · ');
  });
}
