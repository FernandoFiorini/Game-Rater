import { AfterViewChecked, Directive, ElementRef, HostListener, inject } from '@angular/core';

const ROTULO = 'Spoiler oculto. Ative para revelar.';

/**
 * Torna interativos os trechos <span class="spoiler"> dentro de um HTML renderizado
 * via [innerHTML]: ficam borrados (CSS) até um clique ou Enter/Espaço.
 * Uso: <div class="rich" appSpoilers [innerHTML]="texto"></div>
 */
@Directive({
  selector: '[appSpoilers]',
  standalone: true,
})
export class SpoilersDirective implements AfterViewChecked {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O innerHTML pode mudar a qualquer momento: prepara spoilers novos (acessibilidade). */
  ngAfterViewChecked(): void {
    this.host.nativeElement.querySelectorAll<HTMLElement>('.spoiler:not([data-spoiler])').forEach((el) => {
      el.dataset['spoiler'] = '';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-pressed', 'false');
      el.setAttribute('aria-label', ROTULO);
      el.title = 'Spoiler: clique para revelar';
    });
  }

  @HostListener('click', ['$event'])
  aoClicar(ev: MouseEvent) {
    const alvo = (ev.target as HTMLElement).closest<HTMLElement>('.spoiler');
    if (!alvo || !this.host.nativeElement.contains(alvo)) return;
    // depois de revelado, permite selecionar o texto sem esconder de novo
    if (alvo.classList.contains('revelado') && window.getSelection()?.toString()) return;
    this.alternar(alvo);
  }

  @HostListener('keydown', ['$event'])
  aoTeclar(ev: KeyboardEvent) {
    const alvo = (ev.target as HTMLElement).closest<HTMLElement>('.spoiler');
    if (!alvo || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    ev.preventDefault();
    this.alternar(alvo);
  }

  private alternar(el: HTMLElement) {
    const revelado = el.classList.toggle('revelado');
    el.setAttribute('aria-pressed', String(revelado));
    if (revelado) {
      el.removeAttribute('aria-label');
      el.title = 'Clique para esconder de novo';
    } else {
      el.setAttribute('aria-label', ROTULO);
      el.title = 'Spoiler: clique para revelar';
    }
  }
}
