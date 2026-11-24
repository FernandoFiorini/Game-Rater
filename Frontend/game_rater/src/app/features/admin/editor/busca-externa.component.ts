import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';
import { FonteExterna, JogoExterno, ResultadoBuscaExterna } from '../../../core/models/externo.model';
import { ExternoService } from '../../../core/services/externo.service';

/** Busca no IGDB/RAWG e devolve os dados normalizados do jogo escolhido. */
@Component({
  selector: 'app-busca-externa',
  standalone: true,
  template: `
    @if (fontes(); as f) {
      @if (!f.igdb && !f.rawg) {
        <div class="aviso">
          <strong>Importação automática desligada.</strong>
          Configure <code>IGDB_CLIENT_ID</code>/<code>IGDB_CLIENT_SECRET</code> ou <code>RAWG_API_KEY</code>
          no <code>Backend/.env</code> para preencher capa, datas, gêneros e plataformas automaticamente.
        </div>
      } @else {
        <div class="busca">
          <div class="fontes" role="radiogroup" aria-label="Fonte">
            <button type="button" role="radio" [attr.aria-checked]="fonte() === 'igdb'" [class.ativo]="fonte() === 'igdb'"
                    [disabled]="!f.igdb" (click)="trocarFonte('igdb')">IGDB</button>
            <button type="button" role="radio" [attr.aria-checked]="fonte() === 'rawg'" [class.ativo]="fonte() === 'rawg'"
                    [disabled]="!f.rawg" (click)="trocarFonte('rawg')">RAWG</button>
          </div>
          <div class="campo">
            <input class="input" type="search" placeholder="Digite o nome do jogo para importar os dados…"
                   aria-label="Buscar jogo para importar"
                   [value]="termo()" (input)="termo.set($any($event.target).value)" (focus)="aberto.set(true)" />
            @if (buscando()) { <span class="spinner" aria-label="Buscando"></span> }
          </div>
        </div>

        @if (aberto() && termo().trim().length >= 2 && !buscando()) {
          <ul class="resultados" role="listbox">
            @for (r of resultados(); track r.idExterno) {
              <li role="option">
                <button type="button" (click)="escolher(r)" [disabled]="importando() !== null">
                  @if (r.capaUrl) { <img [src]="r.capaUrl" alt="" loading="lazy" /> } @else { <span class="sem"></span> }
                  <span class="txt">
                    <span class="nome">{{ r.nome }} @if (r.ano) { <span class="ano">({{ r.ano }})</span> }</span>
                    <span class="plat">{{ r.plataformas.slice(0, 4).join(' · ') }}</span>
                  </span>
                  <span class="acao">{{ importando() === r.idExterno ? 'Importando…' : 'Importar' }}</span>
                </button>
              </li>
            } @empty {
              <li class="nada">Nenhum resultado.</li>
            }
          </ul>
        }
      }
    }
  `,
  styles: `
    :host { display: block; position: relative; }
    .aviso {
      padding: 14px 16px; border-radius: var(--radius); font-size: 13px; color: var(--text-secondary);
      background: var(--surface-2); border: 1px dashed var(--border-strong); line-height: 1.6;
    }
    code { background: var(--surface-3); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
    .busca { display: flex; gap: 10px; }
    .fontes { display: flex; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 3px; }
    .fontes button {
      border: 0; background: transparent; color: var(--text-secondary); font: 600 12px var(--font);
      padding: 0 12px; border-radius: 4px; cursor: pointer;
    }
    .fontes button.ativo { background: var(--surface-3); color: var(--text-primary); }
    .fontes button:disabled { opacity: 0.35; cursor: not-allowed; }
    .campo { position: relative; flex: 1; }
    .spinner {
      position: absolute; right: 12px; top: 50%; width: 16px; height: 16px; margin-top: -8px;
      border: 2px solid var(--border-strong); border-top-color: var(--series-1); border-radius: 50%;
      animation: gira 0.7s linear infinite;
    }
    @keyframes gira { to { transform: rotate(360deg); } }
    .resultados {
      position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 30;
      list-style: none; margin: 0; padding: 6px; max-height: 420px; overflow-y: auto;
      background: var(--surface-2); border: 1px solid var(--border-strong); border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .resultados button {
      all: unset; box-sizing: border-box; width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 8px; border-radius: var(--radius-sm); cursor: pointer;
    }
    .resultados button:hover, .resultados button:focus-visible { background: var(--surface-3); }
    img, .sem { width: 40px; height: 54px; object-fit: cover; border-radius: 4px; background: var(--surface-3); flex: none; }
    .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .nome { font-weight: 600; }
    .ano { color: var(--text-muted); font-weight: 400; }
    .plat { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .acao { font-size: 12px; font-weight: 600; color: var(--series-1); }
    .nada { padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px; }
  `,
  host: { '(document:click)': 'fecharSeFora($event)' },
})
export class BuscaExternaComponent {
  private externo = inject(ExternoService);

  importar = output<JogoExterno>();

  fontes = toSignal(this.externo.fontes$.pipe(catchError(() => of({ igdb: false, rawg: false }))));
  fonte = signal<FonteExterna>('igdb');
  termo = signal('');
  aberto = signal(false);
  buscando = signal(false);
  importando = signal<number | null>(null);

  resultados = toSignal(
    toObservable(computed(() => ({ q: this.termo().trim(), fonte: this.fonte() }))).pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => a.q === b.q && a.fonte === b.fonte),
      filter((p) => p.q.length >= 2),
      tap(() => this.buscando.set(true)),
      switchMap((p) => this.externo.buscar(p.fonte, p.q).pipe(catchError(() => of([])))),
      tap(() => this.buscando.set(false)),
    ),
    { initialValue: [] as ResultadoBuscaExterna[] },
  );

  constructor() {
    // usa a primeira fonte configurada
    effect(
      () => {
        const f = this.fontes();
        if (f && !f.igdb && f.rawg) this.fonte.set('rawg');
      },
      { allowSignalWrites: true },
    );
  }

  trocarFonte(f: FonteExterna) {
    this.fonte.set(f);
  }

  escolher(r: ResultadoBuscaExterna) {
    this.importando.set(r.idExterno);
    this.externo.detalhar(r.fonte, r.idExterno).subscribe({
      next: (d) => {
        this.importar.emit(d);
        this.importando.set(null);
        this.aberto.set(false);
        this.termo.set('');
      },
      error: () => this.importando.set(null),
    });
  }

  fecharSeFora(ev: MouseEvent) {
    const host = (ev.target as HTMLElement).closest('app-busca-externa');
    if (!host) this.aberto.set(false);
  }
}
