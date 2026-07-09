import { Routes } from '@angular/router';
import { GameComponent } from './game.component';

export const gameRoutes: Routes = [
  { path: '', redirectTo: 'play', pathMatch: 'full' },
  { path: 'play', component: GameComponent }
];