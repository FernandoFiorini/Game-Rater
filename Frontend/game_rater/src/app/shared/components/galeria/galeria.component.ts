import { Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { ImgUrlPipe } from '../../pipes/img-url.pipe';

/**
 * Carrossel de imagens + visualizador em tela cheia.
 * Carrossel: faixa horizontal com setas e rolagem por snap.
 * Visualizador: setas ‹ ›, teclado (← → Esc), deslizar no celular, contador e miniaturas.
 */
@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [ImgUrlPipe],
  template: `
    <div class="carrossel">
      <button type="button" class="seta esq" (click)="rolar(-1)" [disabled]="!podeVoltar()" aria-label="Imagens anteriores">‹</button>

      <div class="trilho" #trilho (scroll)="atualizarSetas()">
        @for (url of imagens(); track url; let i = $index) {
          <button type="button" class="slide" (click)="abrir(i)" [attr.aria-label]="'Ampliar imagem ' + (i + 1) + ' de ' + imagens().length">
            <img [src]="url | imgUrl" alt="" loading="lazy" />
          </button>
        }
      </div>

      <button type="button" class="seta dir" (click)="rolar(1)" [disabled]="!podeAvancar()" aria-label="Próximas imagens">›</button>
    </div>

    @if (aberta() !== null) {
      <div class="visualizador" role="dialog" aria-modal="true" aria-label="Galeria de imagens"
           (click)="fechar()" (touchstart)="toqueInicio($event)" (touchend)="toqueFim($event)">
        <div class="topo" (click)="$event.stopPropagation()">
          <span class="contador">{{ aberta()! + 1 }} / {{ imagens().length }}</span>
          <button type="button" class="fechar" (click)="fechar()" aria-label="Fechar (Esc)">✕</button>
        </div>

        @if (imagens().length > 1) {
          <button type="button" class="nav esq" (click)="$event.stopPropagation(); navegar(-1)" aria-label="Imagem anterior (←)">‹</button>
        }

        <img class="principal" [src]="atual() | imgUrl" alt="" (click)="$event.stopPropagation()" />

        @if (imagens().length > 1) {
          <button type="button" class="nav dir" (click)="$event.stopPropagation(); navegar(1)" aria-label="Próxima imagem (→)">›</button>

          <div class="miniaturas" (click)="$event.stopPropagation()">
            @for (url of imagens(); track url; let i = $index) {
              <button type="button" [class.ativa]="i === aberta()" (click)="aberta.set(i)" [attr.aria-label]="'Ir para imagem ' + (i + 1)">
                <img [src]="url | imgUrl" alt="" />
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    /* ---------- carrossel ---------- */
    .carrossel { position: relative; }
    .trilho {
      display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory;
      scroll-behavior: smooth; scrollbar-width: none; padding: 2px;
    }
    .trilho::-webkit-scrollbar { display: none; }
    .slide {
      all: unset; flex: 0 0 calc((100% - 24px) / 3); aspect-ratio: 16 / 9;
      scroll-snap-align: start; cursor: zoom-in; border-radius: var(--radius);
      overflow: hidden; border: 1px solid var(--border); background: var(--surface-2);
    }
    .slide:focus, .slide:focus-visible { outline: none; }
    .slide img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .slide:hover img { transform: scale(1.04); }
    @media (max-width: 900px) { .slide { flex-basis: calc((100% - 12px) / 2); } }
    @media (max-width: 560px) { .slide { flex-basis: 85%; } }

    .seta {
      position: absolute; top: 50%; z-index: 2; transform: translateY(-50%);
      width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border-strong);
      background: rgba(13, 14, 17, 0.85); color: var(--text-primary); font-size: 24px; line-height: 1;
      cursor: pointer; display: grid; place-items: center; padding-bottom: 3px;
      box-shadow: var(--shadow); transition: opacity 0.15s, background 0.15s;
    }
    .seta:hover:not(:disabled) { background: var(--surface-3); }
    .seta:disabled { opacity: 0; pointer-events: none; }
    .seta.esq { left: -14px; }
    .seta.dir { right: -14px; }

    /* ---------- visualizador ---------- */
    .visualizador {
      position: fixed; inset: 0; z-index: 200; background: rgba(5, 5, 7, 0.95);
      display: grid; grid-template-rows: auto 1fr auto; place-items: center;
      padding: 16px 72px 20px; animation: surgir 0.15s ease-out;
    }
    @keyframes surgir { from { opacity: 0; } }
    .topo { width: 100%; display: flex; justify-content: space-between; align-items: center; }
    .contador { font-size: 14px; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
    .fechar {
      width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer;
      background: rgba(255, 255, 255, 0.08); color: #fff; font-size: 16px;
    }
    .fechar:hover { background: rgba(255, 255, 255, 0.16); }
    .principal {
      max-width: 100%; max-height: calc(100vh - 190px); object-fit: contain;
      border-radius: var(--radius); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    }
    .nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer;
      background: rgba(255, 255, 255, 0.08); color: #fff; font-size: 32px; line-height: 1; padding-bottom: 4px;
      transition: background 0.15s;
    }
    .nav:hover { background: rgba(255, 255, 255, 0.18); }
    .nav.esq { left: 14px; }
    .nav.dir { right: 14px; }
    .miniaturas { display: flex; gap: 8px; max-width: 100%; overflow-x: auto; padding: 4px; scrollbar-width: none; }
    .miniaturas button {
      all: unset; flex: none; width: 88px; aspect-ratio: 16 / 9; border-radius: 6px; overflow: hidden;
      cursor: pointer; opacity: 0.45; outline: 2px solid transparent; transition: opacity 0.15s, outline-color 0.15s;
    }
    .miniaturas button:hover { opacity: 0.8; }
    .miniaturas button:focus-visible:not(.ativa) { outline-color: transparent; opacity: 0.8; }
    .miniaturas button.ativa { opacity: 1; outline-color: var(--text-primary); }
    .miniaturas img { width: 100%; height: 100%; object-fit: cover; }
    @media (max-width: 640px) {
      .visualizador { padding: 12px 8px 16px; }
      .nav { width: 40px; height: 40px; font-size: 26px; background: rgba(0, 0, 0, 0.5); }
      .nav.esq { left: 6px; }
      .nav.dir { right: 6px; }
      .miniaturas { display: none; }
    }
  `,
})
export class GaleriaComponent {
  imagens = input.required<string[]>();

  private trilho = viewChild.required<ElementRef<HTMLDivElement>>('trilho');

  aberta = signal<number | null>(null);
  atual = computed(() => {
    const i = this.aberta();
    return i === null ? null : this.imagens()[i];
  });

  podeVoltar = signal(false);
  podeAvancar = signal(false);

  private toqueX = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));
    // trava a rolagem da página enquanto o visualizador está aberto
    effect(() => {
      document.body.style.overflow = this.aberta() !== null ? 'hidden' : '';
    });
    // estado inicial das setas do carrossel quando as imagens chegam
    effect(() => {
      this.imagens();
      setTimeout(() => this.atualizarSetas());
    });
  }

  // ---------- carrossel ----------
  rolar(direcao: 1 | -1) {
    const el = this.trilho().nativeElement;
    el.scrollBy({ left: direcao * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  atualizarSetas() {
    const el = this.trilho().nativeElement;
    this.podeVoltar.set(el.scrollLeft > 4);
    this.podeAvancar.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  @HostListener('window:resize')
  aoRedimensionar() {
    this.atualizarSetas();
  }

  // ---------- visualizador ----------
  abrir(i: number) {
    this.aberta.set(i);
  }

  fechar() {
    this.aberta.set(null);
  }

  navegar(direcao: 1 | -1) {
    const total = this.imagens().length;
    const i = this.aberta();
    if (i === null || total < 2) return;
    this.aberta.set((i + direcao + total) % total); // circular
  }

  @HostListener('document:keydown', ['$event'])
  teclado(ev: KeyboardEvent) {
    if (this.aberta() === null) return;
    if (ev.key === 'ArrowRight') this.navegar(1);
    else if (ev.key === 'ArrowLeft') this.navegar(-1);
    else if (ev.key === 'Escape') this.fechar();
    else return;
    ev.preventDefault();
  }

  toqueInicio(ev: TouchEvent) {
    this.toqueX = ev.changedTouches[0].clientX;
  }

  toqueFim(ev: TouchEvent) {
    const dx = ev.changedTouches[0].clientX - this.toqueX;
    if (Math.abs(dx) > 50) this.navegar(dx < 0 ? 1 : -1);
  }
}
