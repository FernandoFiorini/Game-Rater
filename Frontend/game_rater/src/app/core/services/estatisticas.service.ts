import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Estatisticas } from '../models/estatisticas.model';

@Injectable({ providedIn: 'root' })
export class EstatisticasService {
  private http = inject(HttpClient);

  obter() {
    return this.http.get<Estatisticas>(`${environment.apiUrl}/estatisticas`);
  }
}
