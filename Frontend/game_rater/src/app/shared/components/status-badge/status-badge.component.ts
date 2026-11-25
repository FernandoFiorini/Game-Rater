import { Component, computed, input } from '@angular/core';
import { StatusJogo } from '../../../core/models/jogo.model';
import { ICONE_PLATINA, infoStatus } from '../../../core/util/status';
import { IconePlatinaComponent } from '../icone-platina/icone-platina.component';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [IconePlatinaComponent],
  template: `
    <span class="badge" [attr.data-status]="status()">
      @if (info().icone === iconePlatina) {
        <app-icone-platina [tamanho]="14" />
      } @else {
        <span aria-hidden="true">{{ info().icone }}</span>
      }
      {{ info().rotulo }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      height: 24px; padding: 0 10px; border-radius: 999px;
      font-size: 12px; font-weight: 600;
      background: var(--surface-3); color: var(--text-secondary);
      border: 1px solid var(--border-strong);
    }
    [data-status='jogando'] { color: #8cc0ff; border-color: rgba(57, 135, 229, 0.5); }
    [data-status='zerado'] { color: #7fd17f; border-color: rgba(12, 163, 12, 0.5); }
    [data-status='platinado'] {
      padding-left: 7px;
      color: #fff;
      background: linear-gradient(135deg, #2f6fd6 0%, #1d4a9e 100%);
      border-color: #4d8ae6;
      box-shadow: 0 2px 10px rgba(47, 111, 214, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    [data-status='abandonado'] { color: var(--critical); border-color: rgba(230, 103, 103, 0.5); }
  `,
})
export class StatusBadgeComponent {
  status = input.required<StatusJogo>();
  info = computed(() => infoStatus(this.status()));
  readonly iconePlatina = ICONE_PLATINA;
}
