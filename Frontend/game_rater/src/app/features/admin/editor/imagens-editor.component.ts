import { Component, computed, inject, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ImagemJogo, TipoImagem } from '../../../core/models/jogo.model';
import { UploadsService } from '../../../core/services/uploads.service';
import { ImgUrlPipe } from '../../../shared/pipes/img-url.pipe';

const MAX_SCREENSHOTS = 12;

/** Capa (vertical), banner (horizontal) e screenshots. Aceita upload ou URL. */
@Component({
  selector: 'app-imagens-editor',
  standalone: true,
  imports: [ImgUrlPipe, NgTemplateOutlet],
  template: `
    <div class="topo" [class.so-capa]="somenteCapa()">
      <!-- capa -->
      <div class="slot-grupo">
        <span class="label">Capa <span class="muted">(vertical, 3:4)</span></span>
        <div class="slot capa" [class.vazio]="!capa()">
          @if (capa(); as c) {
            <img [src]="c.url | imgUrl" alt="Capa" />
            <button type="button" class="remover" (click)="remover(c)" aria-label="Remover capa">×</button>
          } @else {
            <ng-container *ngTemplateOutlet="adicionar; context: { tipo: 'capa' }" />
          }
        </div>
      </div>

      <!-- banner -->
      @if (!somenteCapa()) {
      <div class="slot-grupo banner-grupo">
        <span class="label">Banner <span class="muted">(horizontal, 16:9 — fundo da página)</span></span>
        <div class="slot banner" [class.vazio]="!banner()">
          @if (banner(); as b) {
            <img [src]="b.url | imgUrl" alt="Banner" />
            <button type="button" class="remover" (click)="remover(b)" aria-label="Remover banner">×</button>
          } @else {
            <ng-container *ngTemplateOutlet="adicionar; context: { tipo: 'banner' }" />
          }
        </div>
      </div>
      }
    </div>

    @if (!somenteCapa()) {
    <span class="label">Screenshots <span class="muted">({{ screenshots().length }}/{{ max }})</span></span>
    <div class="shots">
      @for (s of screenshots(); track s.url) {
        <div class="slot shot">
          <img [src]="s.url | imgUrl" alt="" loading="lazy" />
          <button type="button" class="remover" (click)="remover(s)" aria-label="Remover screenshot">×</button>
        </div>
      }
      @if (screenshots().length < max) {
        <div class="slot shot vazio">
          <ng-container *ngTemplateOutlet="adicionar; context: { tipo: 'screenshot' }" />
        </div>
      }
    </div>
    }

    <ng-template #adicionar let-tipo="tipo">
      <div class="add">
        @if (enviando() === tipo) {
          <span class="muted">Enviando…</span>
        } @else {
          <label class="btn sm">
            Enviar arquivo
            <input type="file" accept="image/*" hidden [multiple]="tipo === 'screenshot'"
                   (change)="enviar($event, tipo)" />
          </label>
          <button type="button" class="btn ghost sm" (click)="colarUrl(tipo)">Colar URL</button>
        }
      </div>
    </ng-template>
  `,
  styles: `
    .label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
    .topo { display: grid; grid-template-columns: 180px 1fr; gap: 20px; margin-bottom: 20px; }
    .topo.so-capa { grid-template-columns: 180px; margin-bottom: 0; }
    .slot {
      position: relative; border-radius: var(--radius); overflow: hidden;
      background: var(--surface-2); border: 1px solid var(--border);
    }
    .slot.vazio { border-style: dashed; border-color: var(--border-strong); display: grid; place-items: center; }
    .capa { aspect-ratio: 3 / 4; }
    .banner { aspect-ratio: 16 / 9; max-height: 240px; }
    .shot { aspect-ratio: 16 / 9; }
    img { width: 100%; height: 100%; object-fit: cover; }
    .remover {
      position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; border-radius: 50%;
      border: 0; background: rgba(0, 0, 0, 0.7); color: #fff; font-size: 18px; cursor: pointer;
      opacity: 0; transition: opacity 0.15s;
    }
    .slot:hover .remover, .remover:focus-visible { opacity: 1; }
    .shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
    .add { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; }
    @media (max-width: 720px) { .topo { grid-template-columns: 1fr; } .capa { max-width: 180px; } }
  `,
})
export class ImagensEditorComponent {
  private uploads = inject(UploadsService);
  private toastr = inject(ToastrService);

  imagens = model<ImagemJogo[]>([]);
  /** esconde banner e screenshots (usado em "Quero jogar") */
  somenteCapa = input(false);
  readonly max = MAX_SCREENSHOTS;

  capa = computed(() => this.imagens().find((i) => i.tipo === 'capa') ?? null);
  banner = computed(() => this.imagens().find((i) => i.tipo === 'banner') ?? null);
  screenshots = computed(() => this.imagens().filter((i) => i.tipo === 'screenshot'));

  enviando = signal<TipoImagem | null>(null);

  remover(img: ImagemJogo) {
    this.imagens.update((l) => l.filter((i) => i !== img));
  }

  private adicionarUrls(tipo: TipoImagem, urls: string[]) {
    this.imagens.update((lista) => {
      if (tipo === 'screenshot') {
        const vagas = MAX_SCREENSHOTS - lista.filter((i) => i.tipo === 'screenshot').length;
        return [...lista, ...urls.slice(0, vagas).map((url) => ({ url, tipo }))];
      }
      // capa e banner: só 1 — substitui
      return [...lista.filter((i) => i.tipo !== tipo), { url: urls[0], tipo }];
    });
  }

  enviar(ev: Event, tipo: TipoImagem) {
    const input = ev.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);
    input.value = '';
    if (!arquivos.length) return;

    this.enviando.set(tipo);
    this.uploads.enviar(arquivos).subscribe({
      next: (r) => {
        this.adicionarUrls(tipo, r.map((x) => x.url));
        this.enviando.set(null);
      },
      error: () => this.enviando.set(null),
    });
  }

  colarUrl(tipo: TipoImagem) {
    const url = window.prompt('URL da imagem:')?.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      this.toastr.warning('Informe uma URL começando com http:// ou https://');
      return;
    }
    this.adicionarUrls(tipo, [url]);
  }
}
