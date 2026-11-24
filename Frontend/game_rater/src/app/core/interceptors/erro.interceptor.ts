import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

interface CorpoErro {
  erro?: string;
  detalhes?: { campo: string; mensagem: string }[] | string;
}

/** Mostra um toast para qualquer erro HTTP. Os componentes só tratam o que for específico. */
export const erroInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      const corpo = erro.error as CorpoErro | null;
      let mensagem = corpo?.erro ?? 'Falha na comunicação com o servidor';

      if (erro.status === 0) mensagem = 'Servidor indisponível. O backend está rodando?';

      if (Array.isArray(corpo?.detalhes) && corpo.detalhes.length) {
        mensagem += '<br>' + corpo.detalhes.map((d) => `• ${d.mensagem}`).join('<br>');
      }

      toastr.error(mensagem, 'Erro', { enableHtml: true });
      return throwError(() => erro);
    }),
  );
};
