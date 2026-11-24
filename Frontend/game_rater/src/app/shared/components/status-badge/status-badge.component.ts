import { Component, computed, input } from '@angular/core';
import { StatusJogo } from '../../../core/models/jogo.model';
import { infoStatus } from '../../../core/util/status';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [attr.data-status]="status()"><span aria-hidden="true">{{ info().icone }}</span>{{ info().rotulo }}</span>`,
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
    [data-status='platinado'] { color: #f0c04a; border-color: rgba(224, 165, 38, 0.6); }
    [data-status='abandonado'] { color: var(--critical); border-color: rgba(230, 103, 103, 0.5); }
  `,
})
export class StatusBadgeComponent {
  status = input.required<StatusJogo>();
  info = computed(() => infoStatus(this.status()));
}
