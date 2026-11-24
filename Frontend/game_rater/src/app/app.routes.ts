import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Game Rater — Reviews',
    loadComponent: () => import('./features/reviews/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'jogo/:slug',
    loadComponent: () =>
      import('./features/reviews/detalhe-jogo/detalhe-jogo.component').then((m) => m.DetalheJogoComponent),
  },
  {
    path: 'backlog',
    title: 'Game Rater — Backlog',
    loadComponent: () => import('./features/backlog/backlog.component').then((m) => m.BacklogComponent),
  },
  {
    path: 'estatisticas',
    title: 'Game Rater — Estatísticas',
    loadComponent: () =>
      import('./features/estatisticas/estatisticas.component').then((m) => m.EstatisticasComponent),
  },
  // TODO(auth): proteger /admin com canMatch: [adminGuard] quando houver login
  {
    path: 'admin',
    children: [
      {
        path: '',
        title: 'Game Rater — Gerenciar',
        loadComponent: () => import('./features/admin/lista/admin-lista.component').then((m) => m.AdminListaComponent),
      },
      {
        path: 'jogos/novo',
        title: 'Game Rater — Novo jogo',
        loadComponent: () => import('./features/admin/editor/editor-jogo.component').then((m) => m.EditorJogoComponent),
      },
      {
        path: 'jogos/:id/editar',
        title: 'Game Rater — Editar jogo',
        loadComponent: () => import('./features/admin/editor/editor-jogo.component').then((m) => m.EditorJogoComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
