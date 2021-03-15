import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { AuthGuard } from './services/auth.guard';
import { RoomComponent } from './components/room/room.component';
import { GameComponent } from './components/game/game.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'lobby',
    canActivate: [AuthGuard],
    component: LobbyComponent
  },
  {
    path: 'room/:id',
    canActivate: [AuthGuard],
    component: RoomComponent,
  },
  {
    path: 'game/:id',
    canActivate: [AuthGuard],
    component: GameComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }