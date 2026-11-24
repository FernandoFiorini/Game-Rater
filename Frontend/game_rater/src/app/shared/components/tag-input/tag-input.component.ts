import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Lista de textos curtos (prós/contras). Enter adiciona, × remove. */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagInputComponent), multi: true }],
  template: `
    <ul class="itens">
      @for (item of itens(); track $index) {
        <li [class]="variante()">
          <span class="marca" aria-hidden="true">{{ variante() === 'pro' ? '+' : '−' }}</span>
          <span class="texto">{{ item }}</span>
          <button type="button" class="remover" (click)="remover($index)" [attr.aria-label]="'Remover ' + item">×</button>
        </li>
      }
    </ul>
    <div class="nova">
      <input #campo class="input" [placeholder]="placeholder()"
             (keydown.enter)="$event.preventDefault(); adicionar(campo)" (blur)="onTouched()" />
      <button type="button" class="btn sm" (click)="adicionar(campo)">Adicionar</button>
    </div>
  `,
  styles: `
    .itens { list-style: none; margin: 0 0 10px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    li {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: var(--radius-sm);
      background: var(--surface-2); border: 1px solid var(--border);
    }
    .marca { font-weight: 700; width: 16px; text-align: center; }
    .pro .marca { color: #7fd17f; }
    .contra .marca { color: var(--critical); }
    .texto { flex: 1; font-size: 14px; }
    .remover {
      background: none; border: 0; color: var(--text-muted); font-size: 18px; cursor: pointer; line-height: 1;
    }
    .remover:hover { color: var(--text-primary); }
    .nova { display: flex; gap: 8px; align-items: center; }
  `,
})
export class TagInputComponent implements ControlValueAccessor {
  placeholder = input('Adicionar item');
  variante = input<'pro' | 'contra'>('pro');

  itens = signal<string[]>([]);
  private onChange: (v: string[]) => void = () => {};
  onTouched: () => void = () => {};

  adicionar(campo: HTMLInputElement) {
    const texto = campo.value.trim();
    if (!texto) return;
    this.atualizar([...this.itens(), texto]);
    campo.value = '';
  }

  remover(i: number) {
    this.atualizar(this.itens().filter((_, idx) => idx !== i));
  }

  private atualizar(v: string[]) {
    this.itens.set(v);
    this.onChange(v);
  }

  writeValue(v: string[] | null): void {
    this.itens.set(v ?? []);
  }
  registerOnChange(fn: (v: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
