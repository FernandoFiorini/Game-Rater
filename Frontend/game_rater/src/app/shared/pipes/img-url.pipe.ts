import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Resolve URLs de imagem: arquivos locais (/uploads/...) apontam para o backend. */
@Pipe({ name: 'imgUrl', standalone: true })
export class ImgUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('/uploads/')) return environment.arquivosUrl + url;
    return url;
  }
}
