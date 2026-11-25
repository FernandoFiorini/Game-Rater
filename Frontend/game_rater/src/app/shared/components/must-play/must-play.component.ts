import { Component, input } from '@angular/core';
import { MUST_PLAY_MIN } from '../../../core/util/must-play';
import { VoidLogoComponent } from '../void-logo/void-logo.component';

/** Faíscas da versão épica: direção (dx, dy em px) e atraso (s). */
const FAISCAS = [
  { dx: -70, dy: -38, atraso: 0.95 },
  { dx: 72, dy: -42, atraso: 1.0 },
  { dx: -84, dy: 14, atraso: 1.08 },
  { dx: 88, dy: 10, atraso: 1.02 },
  { dx: -46, dy: 48, atraso: 1.12 },
  { dx: 52, dy: 46, atraso: 1.06 },
  { dx: 0, dy: -58, atraso: 0.98 },
  { dx: 10, dy: 60, atraso: 1.15 },
];

/**
 * Selo "Must Play" do Void Rater (nota final ≥ MUST_PLAY_MIN).
 * `grande` = versão do painel de nota; padrão = fita compacta para cards.
 * `animar` = toca uma animação de entrada UMA vez (quando o componente é criado).
 * `epico`  = versão mais intensa da animação (Obra-prima).
 */
@Component({
  selector: 'app-must-play',
  standalone: true,
  imports: [VoidLogoComponent],
  template: `
    <span class="palco" [class.animar]="animar()" [class.epico]="animar() && epico()">
      @if (animar()) {
        <span class="onda" aria-hidden="true"></span>
        @if (epico()) {
          <span class="onda onda2" aria-hidden="true"></span>
          @for (f of faiscas; track $index) {
            <span class="faisca" aria-hidden="true"
                  [style.--dx.px]="f.dx" [style.--dy.px]="f.dy" [style.animation-delay.s]="f.atraso">✦</span>
          }
        }
      }

      <span class="selo" [class.grande]="grande()" role="img"
            [attr.aria-label]="'Must Play — nota ' + minimo + ' ou mais no Void Rater'"
            [attr.title]="'Must Play: nota ' + minimo + '+ no Void Rater'">
        <app-void-logo class="marca" [tamanho]="grande() ? 30 : 17" [claro]="true" />
        <span class="texto" aria-hidden="true">
          <span class="linha1">Must</span><span class="linha2">Play</span>
        </span>
        @if (animar()) { <span class="brilho" aria-hidden="true"></span> }
      </span>
    </span>
  `,
  styles: `
    :host { display: inline-flex; }

    .palco { position: relative; display: inline-flex; }

    .selo {
      position: relative; overflow: hidden;
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

    /* ================= animação de entrada (toca uma vez) ================= */

    /* 1. carimbo: cai grande, gira de leve e assenta */
    .animar .selo { animation: carimbo 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.25) 0.25s both; }
    @keyframes carimbo {
      0%   { transform: scale(1.9) rotate(-10deg); opacity: 0; filter: blur(3px); }
      55%  { transform: scale(0.92) rotate(1.5deg); opacity: 1; filter: blur(0); }
      78%  { transform: scale(1.04) rotate(0); }
      100% { transform: none; opacity: 1; }
    }

    /* 2. faixa de brilho que atravessa o selo */
    .brilho {
      position: absolute; top: -20%; bottom: -20%; left: 0; width: 45%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
      transform: translateX(-160%) skewX(-20deg);
      animation: varrer 0.9s ease-out 0.85s both;
      pointer-events: none;
    }
    @keyframes varrer {
      from { transform: translateX(-160%) skewX(-20deg); }
      to   { transform: translateX(320%) skewX(-20deg); }
    }

    /* 3. onda de luz saindo do selo */
    .onda {
      position: absolute; inset: 0; border-radius: 12px; pointer-events: none;
      border: 2px solid var(--accent-claro);
      box-shadow: 0 0 18px rgba(var(--accent-rgb), 0.7);
      opacity: 0;
      animation: onda 1s ease-out 0.75s both;
    }
    @keyframes onda {
      0%   { transform: scale(0.85); opacity: 0.9; }
      100% { transform: scale(2.1); opacity: 0; }
    }

    /* ---------- versão épica (Obra-prima) ---------- */
    .epico .selo { animation-duration: 0.85s; }
    .epico .selo.grande { animation: carimbo 0.85s cubic-bezier(0.2, 0.9, 0.3, 1.25) 0.25s both, clarao 1.6s ease-out 0.8s both; }
    @keyframes clarao {
      0%   { box-shadow: 0 8px 30px rgba(var(--accent-rgb), 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25); }
      25%  { box-shadow: 0 0 60px 10px rgba(var(--accent-rgb), 0.9), 0 0 20px rgba(255, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
      100% { box-shadow: 0 8px 30px rgba(var(--accent-rgb), 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25); }
    }
    .epico .onda { border-color: #ffffff; }
    .onda2 { animation-delay: 1.05s; border-color: var(--accent-claro) !important; }

    .faisca {
      position: absolute; left: 50%; top: 50%; z-index: 2; pointer-events: none;
      font-size: 14px; line-height: 1; color: #fff;
      text-shadow: 0 0 8px var(--accent-claro), 0 0 14px rgba(var(--accent-rgb), 0.9);
      opacity: 0;
      animation: faisca 1.1s ease-out both;
    }
    .faisca:nth-of-type(even) { font-size: 10px; color: #e7deff; }
    @keyframes faisca {
      0%   { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
      30%  { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.1) rotate(160deg); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .animar .selo, .epico .selo.grande, .brilho, .onda, .faisca { animation: none !important; }
      .onda, .faisca, .brilho { display: none; }
    }
  `,
})
export class MustPlayComponent {
  grande = input(false);
  animar = input(false);
  epico = input(false);

  readonly minimo = MUST_PLAY_MIN;
  readonly faiscas = FAISCAS;
}
