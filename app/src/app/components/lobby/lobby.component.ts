import { Component, OnInit } from '@angular/core';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { Game } from '../../models/game';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements OnInit {

  games: Game[] = [];

  constructor(
    private ws: SocketHandlerService,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const context = this;
    this.ws.setCotext('game', this);
    this.ws.getGames()
  }

  handleGames(games: Game[]): void {
    this.games = games;
    this.hostCheck();
  }

  hostCheck(): void {
    for (const game of this.games) {
      if (game.host === this.auth.getName()) {
        this.router.navigate(['/room', game.id]);
      }
    }
  }

  hostGame(): void {
    this.ws.hostGame('VERSUS');
  }

  goToRoom(id: string): void {
    this.router.navigate(['/room', id]);
  }

}