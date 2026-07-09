import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameComponent } from './game/game.component';
import { GameOverComponent } from './game-over/game-over.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'game', component: GameComponent },
  { path: 'game-over', component: GameOverComponent },
  { path: '**', redirectTo: '' }
];