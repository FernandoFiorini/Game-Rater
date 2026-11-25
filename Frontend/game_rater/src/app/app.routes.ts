import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Void Rater — Reviews',
    loadComponent: () => import('./features/reviews/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'jogo/:slug',
    loadComponent: () =>
      import('./features/reviews/detalhe-jogo/detalhe-jogo.component').then((m) => m.DetalheJogoComponent),
  },
  {
    path: 'backlog',
    title: 'Void Rater — Backlog',
    loadComponent: () => import('./features/backlog/backlog.component').then((m) => m.BacklogComponent),
  },
  {
    path: 'estatisticas',
    title: 'Void Rater — Estatísticas',
    loadComponent: () =>
      import('./features/estatisticas/estatisticas.component').then((m) => m.EstatisticasComponent),
  },
  // TODO(auth): proteger /admin com canMatch: [adminGuard] quando houver login
  {
    path: 'admin',
    children: [
      {
        path: '',
        title: 'Void Rater — Gerenciar',
        loadComponent: () => import('./features/admin/lista/admin-lista.component').then((m) => m.AdminListaComponent),
      },
      {
        path: 'jogos/novo',
        title: 'Void Rater — Novo jogo',
        loadComponent: () => import('./features/admin/editor/editor-jogo.component').then((m) => m.EditorJogoComponent),
      },
      {
        path: 'jogos/:id/editar',
        title: 'Void Rater — Editar jogo',
        loadComponent: () => import('./features/admin/editor/editor-jogo.component').then((m) => m.EditorJogoComponent),
      },
    ],
  },
  {
    path: '**',
    title: 'Void Rater — Perdido no vazio',
    loadComponent: () => import('./features/nao-encontrado/nao-encontrado.component').then((m) => m.NaoEncontradoComponent),
  },
];
