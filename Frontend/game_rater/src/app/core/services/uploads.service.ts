import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private http = inject(HttpClient);

  /** Envia arquivos e devolve as URLs relativas (/uploads/...). */
  enviar(arquivos: File[]): Observable<{ url: string }[]> {
    const corpo = new FormData();
    arquivos.forEach((a) => corpo.append('arquivos', a));
    return this.http.post<{ url: string }[]>(`${environment.apiUrl}/uploads`, corpo);
  }
}
