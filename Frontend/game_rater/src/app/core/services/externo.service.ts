import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FonteExterna, FontesDisponiveis, JogoExterno, ResultadoBuscaExterna } from '../models/externo.model';

/** Importação de dados do IGDB / RAWG (via backend). */
@Injectable({ providedIn: 'root' })
export class ExternoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/externo`;

  readonly fontes$ = this.http.get<FontesDisponiveis>(`${this.url}/fontes`).pipe(shareReplay(1));

  buscar(fonte: FonteExterna, q: string): Observable<ResultadoBuscaExterna[]> {
    const params = new HttpParams().set('fonte', fonte).set('q', q);
    return this.http.get<ResultadoBuscaExterna[]>(`${this.url}/busca`, { params });
  }

  detalhar(fonte: FonteExterna, id: number): Observable<JogoExterno> {
    return this.http.get<JogoExterno>(`${this.url}/${fonte}/${id}`);
  }
}
