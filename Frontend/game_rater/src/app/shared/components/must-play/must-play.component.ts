import { Component, input } from '@angular/core';
import { MUST_PLAY_MIN } from '../../../core/util/must-play';
import { VoidLogoComponent } from '../void-logo/void-logo.component';

/**
 * Selo "Must Play" do Void Rater (nota final ≥ MUST_PLAY_MIN).
 * `grande` = versão do painel de nota; padrão = fita compacta para cards.
 */
@Component({
  selector: 'app-must-play',
  standalone: true,
  imports: [VoidLogoComponent],
  template: `
    <span class="selo" [class.grande]="grande()" role="img"
          [attr.aria-label]="'Must Play — nota ' + minimo + ' ou mais no Void Rater'"
          [attr.title]="'Must Play: nota ' + minimo + '+ no Void Rater'">
      <app-void-logo class="marca" [tamanho]="grande() ? 30 : 17" [claro]="true" />
      <span class="texto" aria-hidden="true">
        <span class="linha1">Must</span><span class="linha2">Play</span>
      </span>
    </span>
  `,
  styles: `
    :host { display: inline-flex; }

    .selo {
      display: inline-flex; align-items: center; gap: 6px;
      height: 24px; padding: 0 9px 0 4px; border-radius: 6px;
      background: linear-gradient(135deg, #8b6bff 0%, #5a3be0 55%, #2a1a7a 100%);
      color: #fff;
      box-shadow: 0 4px 16px rgba(var(--accent-rgb), 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
      font-family: var(--font-display);
      white-space: nowrap;
    }

    .marca { display: inline-flex; }

    .texto { display: inline-flex; gap: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }

    /* versão grande (painel da review) */
    .selo.grande {
      height: auto; padding: 8px 14px 8px 8px; gap: 10px; border-radius: 10px;
      box-shadow: 0 8px 30px rgba(var(--accent-rgb), 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .grande .texto { flex-direction: column; gap: 0; line-height: 1.05; font-size: 14px; letter-spacing: 0.14em; }
    .grande .linha2 { font-size: 18px; letter-spacing: 0.08em; }
  `,
})
export class MustPlayComponent {
  grande = input(false);
  readonly minimo = MUST_PLAY_MIN;
}
