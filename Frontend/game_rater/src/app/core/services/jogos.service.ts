import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltrosJogos, JogoCard, JogoDetalhe, SalvarJogo, StatusJogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/jogos`;

  listar(filtros: FiltrosJogos = {}): Observable<JogoCard[]> {
    let params = new HttpParams();
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.status?.length) params = params.set('status', filtros.status.join(','));
    if (filtros.publicada !== undefined) params = params.set('publicada', String(filtros.publicada));
    if (filtros.generoId) params = params.set('generoId', filtros.generoId);
    if (filtros.plataformaId) params = params.set('plataformaId', filtros.plataformaId);
    if (filtros.ordem) params = params.set('ordem', filtros.ordem);
    return this.http.get<JogoCard[]>(this.url, { params });
  }

  obter(idOuSlug: string | number): Observable<JogoDetalhe> {
    return this.http.get<JogoDetalhe>(`${this.url}/${idOuSlug}`);
  }

  criar(dados: SalvarJogo): Observable<{ id: number; slug: string }> {
    return this.http.post<{ id: number; slug: string }>(this.url, dados);
  }

  atualizar(id: number, dados: SalvarJogo): Observable<{ id: number; slug: string }> {
    return this.http.put<{ id: number; slug: string }>(`${this.url}/${id}`, dados);
  }

  atualizarStatus(id: number, status: StatusJogo, prioridade?: number | null): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/status`, { status, prioridade });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
