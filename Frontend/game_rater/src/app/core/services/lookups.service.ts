import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, FaixaNota, Lookups } from '../models/lookups.model';

/** Domínios (plataformas, gêneros, categorias...) carregados uma vez e cacheados. */
@Injectable({ providedIn: 'root' })
export class LookupsService {
  private http = inject(HttpClient);

  readonly lookups$ = this.http.get<Lookups>(`${environment.apiUrl}/lookups`).pipe(shareReplay(1));
  readonly lookups = toSignal(this.lookups$);

  readonly categorias = computed<Categoria[]>(() => this.lookups()?.categorias ?? []);
  readonly faixasNota = computed<FaixaNota[]>(() => this.lookups()?.faixasNota ?? []);

  /** Rótulo e cor da faixa em que a nota cai. */
  faixa(nota: number | null | undefined): FaixaNota | null {
    if (nota == null) return null;
    let resultado: FaixaNota | null = null;
    for (const f of this.faixasNota()) {
      if (f.notaMinima <= nota) resultado = f;
    }
    return resultado;
  }

  /** Média ponderada pelos pesos das categorias (mesma regra da view vw_review_nota). */
  mediaPonderada(notas: { categoriaId: number; nota: number | null }[]): number | null {
    const pesos = new Map(this.categorias().map((c) => [c.id, c.peso]));
    let soma = 0;
    let somaPesos = 0;
    for (const n of notas) {
      const peso = pesos.get(n.categoriaId);
      if (n.nota == null || peso == null) continue;
      soma += n.nota * peso;
      somaPesos += peso;
    }
    return somaPesos ? Math.round(soma / somaPesos) : null;
  }
}
