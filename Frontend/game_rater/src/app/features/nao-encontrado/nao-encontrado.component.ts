import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VoidLogoComponent } from '../../shared/components/void-logo/void-logo.component';

@Component({
  selector: 'app-nao-encontrado',
  standalone: true,
  imports: [RouterLink, VoidLogoComponent],
  template: `
    <div class="page vazio">
      <app-void-logo [tamanho]="120" />
      <h1>Perdido no vazio</h1>
      <p>Essa página não existe, ou foi engolida pelo horizonte de eventos.</p>
      <a class="btn primary" routerLink="/">Voltar para as reviews</a>
    </div>
  `,
  styles: `
    .vazio {
      min-height: calc(100vh - 60px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 16px; text-align: center;
    }
    app-void-logo { margin-bottom: 12px; animation: flutuar 6s ease-in-out infinite; }
    h1 { font-size: 36px; }
    p { color: var(--text-secondary); margin: 0 0 8px; }
    @keyframes flutuar { 50% { transform: translateY(-8px) rotate(8deg); } }
    @media (prefers-reduced-motion: reduce) { app-void-logo { animation: none; } }
  `,
})
export class NaoEncontradoComponent {}
