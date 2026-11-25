import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JogoCard, StatusJogo } from '../../core/models/jogo.model';
import { JogosService } from '../../core/services/jogos.service';
import { STATUS, STATUS_PENDENTES, infoStatus } from '../../core/util/status';
import { ImgUrlPipe } from '../../shared/pipes/img-url.pipe';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

const COLUNAS: { status: StatusJogo; descricao: string }[] = [
  { status: 'jogando', descricao: 'O que estou jogando agora' },
  { status: 'backlog', descricao: 'Tenho e ainda vou jogar' },
  { status: 'quero_jogar', descricao: 'Lista de desejos' },
];

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [RouterLink, ImgUrlPipe, StatusBadgeComponent],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.scss',
})
export class BacklogComponent {
  private jogosService = inject(JogosService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  readonly colunasDef = COLUNAS;
  readonly status = STATUS;
  readonly estrelas = [1, 2, 3, 4, 5];
  infoStatus = infoStatus;

  jogos = signal<JogoCard[] | null>(null);

  /** Já jogados, mas sem review publicada: a fila de reviews a escrever. */
  paraAvaliar = signal<JogoCard[] | null>(null);
  buscaAvaliar = signal('');
  paraAvaliarFiltrados = computed(() => {
    const termo = this.buscaAvaliar().trim().toLowerCase();
    return (this.paraAvaliar() ?? [])
      .filter((j) => !termo || j.nome.toLowerCase().includes(termo))
      .sort((a, b) => (b.dtConclusao ?? '').localeCompare(a.dtConclusao ?? ''));
  });

  colunas = computed(() =>
    COLUNAS.map((c) => ({
      ...c,
      info: infoStatus(c.status),
      jogos: (this.jogos() ?? []).filter((j) => j.status === c.status),
    })),
  );

  constructor() {
    this.carregar();
  }

  carregar() {
    this.jogosService
      .listar({ status: STATUS_PENDENTES, ordem: 'prioridade' })
      .subscribe((j) => this.jogos.set(j));
    this.jogosService
      .listar({ status: ['zerado', 'platinado', 'abandonado'], publicada: false })
      .subscribe((j) => this.paraAvaliar.set(j));
  }

  mover(jogo: JogoCard, status: StatusJogo) {
    if (status === jogo.status) return;
    this.jogosService.atualizarStatus(jogo.id, status).subscribe(() => {
      if (infoStatus(status).pendente) {
        this.jogos.update((lista) => lista!.map((j) => (j.id === jogo.id ? { ...j, status } : j)));
        this.toastr.success(`${jogo.nome} → ${infoStatus(status).rotulo}`);
      } else {
        this.toastr.success(`${jogo.nome} marcado como ${infoStatus(status).rotulo}. Hora de escrever a review!`);
        this.router.navigate(['/admin/jogos', jogo.id, 'editar'], { fragment: 'notas' });
      }
    });
  }

  priorizar(jogo: JogoCard, prioridade: number) {
    this.jogosService.atualizarStatus(jogo.id, jogo.status, prioridade).subscribe(() => {
      this.jogos.update((lista) =>
        lista!
          .map((j) => (j.id === jogo.id ? { ...j, prioridade } : j))
          .sort((a, b) => (b.prioridade ?? 0) - (a.prioridade ?? 0)),
      );
    });
  }
}
