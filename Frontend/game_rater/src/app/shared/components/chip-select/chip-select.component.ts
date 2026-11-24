import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OpcaoChip<T = number | string> {
  valor: T;
  rotulo: string;
  icone?: string;
}

/**
 * Seleção por chips. `multiplo` = array de valores; senão um valor único (ou null).
 * Funciona com formControlName.
 */
@Component({
  selector: 'app-chip-select',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChipSelectComponent), multi: true }],
  template: `
    <div class="chips" role="group">
      @for (op of opcoes(); track op.valor) {
        <button type="button" class="chip-opcao"
                [class.ativo]="selecionado(op.valor)"
                [attr.aria-pressed]="selecionado(op.valor)"
                [disabled]="desabilitado()"
                (click)="alternar(op.valor)">
          @if (op.icone) { <span aria-hidden="true">{{ op.icone }}</span> }
          {{ op.rotulo }}
        </button>
      }
    </div>
  `,
  styles: `
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip-opcao {
      display: inline-flex; align-items: center; gap: 6px;
      height: 32px; padding: 0 14px; border-radius: 999px;
      background: var(--surface-2); color: var(--text-secondary);
      border: 1px solid var(--border); font: 500 13px var(--font);
      cursor: pointer; transition: all 0.15s;
    }
    .chip-opcao:hover:not(:disabled) { border-color: var(--border-strong); color: var(--text-primary); }
    .chip-opcao.ativo {
      background: var(--accent-soft); border-color: var(--accent); color: var(--text-primary);
    }
  `,
})
export class ChipSelectComponent implements ControlValueAccessor {
  opcoes = input.required<OpcaoChip[]>();
  multiplo = input(false);
  /** Em seleção única: permite desmarcar clicando no ativo */
  permitirVazio = input(true);

  private valor = signal<unknown>(null);
  protected desabilitado = signal(false);
  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  selecionado(v: unknown): boolean {
    const atual = this.valor();
    return this.multiplo() ? Array.isArray(atual) && atual.includes(v) : atual === v;
  }

  alternar(v: unknown) {
    let novo: unknown;
    if (this.multiplo()) {
      const atual = (this.valor() as unknown[]) ?? [];
      novo = atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v];
    } else {
      novo = this.valor() === v && this.permitirVazio() ? null : v;
    }
    this.valor.set(novo);
    this.onChange(novo);
    this.onTouched();
  }

  writeValue(v: unknown): void {
    this.valor.set(this.multiplo() ? (v ?? []) : v);
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.desabilitado.set(d);
  }
}
