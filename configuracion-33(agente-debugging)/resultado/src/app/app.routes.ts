import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'game',
    loadComponent: () => import('./game/game.component').then(m => m.GameComponent)
  },
  {
    path: 'game-over',
    loadComponent: () => import('./game-over/game-over.component').then(m => m.GameOverComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
