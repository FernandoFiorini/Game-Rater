import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JogoCard, StatusJogo } from '../../../core/models/jogo.model';
import { JogosService } from '../../../core/services/jogos.service';
import { STATUS } from '../../../core/util/status';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProgressoBadgeComponent } from '../../../shared/components/progresso-badge/progresso-badge.component';
import { PROGRESSO, ProgressoAvaliacao, progressoDe } from '../../../core/util/progresso';
import { CorTextoPipe } from '../../../shared/pipes/cor-texto.pipe';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

@Component({
  selector: 'app-admin-lista',
  standalone: true,
  imports: [RouterLink, DatePipe, StatusBadgeComponent, ImgUrlPipe, CorTextoPipe, ProgressoBadgeComponent],
  templateUrl: './admin-lista.component.html',
  styleUrl: './admin-lista.component.scss',
})
export class AdminListaComponent {
  private jogosService = inject(JogosService);
  private toastr = inject(ToastrService);

  readonly status = STATUS;

  jogos = signal<JogoCard[] | null>(null);
  busca = signal('');
  filtroStatus = signal<StatusJogo | ''>('');
  filtroPublicacao = signal<'' | 'publicadas' | 'rascunhos'>('');
  filtroProgresso = signal<ProgressoAvaliacao | ''>('');
  readonly progressoOpcoes = PROGRESSO;

  filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    return (this.jogos() ?? []).filter(
      (j) =>
        (!termo || j.nome.toLowerCase().includes(termo)) &&
        (!this.filtroStatus() || j.status === this.filtroStatus()) &&
        (this.filtroPublicacao() !== 'publicadas' || j.publicada) &&
        (this.filtroPublicacao() !== 'rascunhos' || !j.publicada) &&
        (!this.filtroProgresso() || progressoDe(j) === this.filtroProgresso()),
    );
  });

  constructor() {
    this.carregar();
  }

  carregar() {
    this.jogosService.listar({ ordem: 'recentes' }).subscribe((j) => this.jogos.set(j));
  }

  excluir(jogo: JogoCard) {
    if (!window.confirm(`Excluir "${jogo.nome}"? Isso apaga a review, notas e imagens enviadas.`)) return;
    this.jogosService.excluir(jogo.id).subscribe(() => {
      this.jogos.update((l) => l!.filter((j) => j.id !== jogo.id));
      this.toastr.success('Jogo excluído');
    });
  }
}
