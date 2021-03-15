import { Component, OnInit } from '@angular/core';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { GamePacket } from '../../models/packets/game.packet';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UserPacket } from 'src/app/models/packets/user.packet';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements OnInit {

  games: GamePacket[] = [];

  dataReady: boolean = false;

  constructor(
    private ws: SocketHandlerService,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const context = this;
    this.ws.setCotext('lobby', this);
    this.ws.getGames();
    this.ws.getUsers();
  }

  usersFetched(): void {
    console.log(this.dataReady)
    this.dataReady = true;
  }

  handleGames(games: GamePacket[]): void {
    this.games = games;
    this.hostCheck();
  }

  userById(id: string): string {
    const user = this.auth.getUserById(id);
    if (user) {
      return user.username;
    }
    return id;
  }
  
  private hostCheck(): void {
    for (const game of this.games) {
      if (game.host === this.auth.getId()) {
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