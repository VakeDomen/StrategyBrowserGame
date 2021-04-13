import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { GamePacket } from '../../models/packets/game.packet';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Cache } from 'src/app/services/cache.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements AfterViewInit {

  games: GamePacket[] = [];
  startedGames: GamePacket[] = [];

  dataReady: boolean = false;
  usersReady: boolean = false;
  gamesReady: boolean = false;
  startedGamesReady: boolean = false;

  constructor(
    private ws: SocketHandlerService,
    private auth: AuthService,
    private router: Router,
  ) {
    const context = this;
    this.ws.setCotext('lobby', this);
    this.ws.getGames();
    this.ws.getParticipatedGames();
    this.ws.getUsers();
  }
  ngAfterViewInit(): void { 
    this.ws.ping();
   }

  usersFetched(): void {
    this.usersReady = true;
    this.checkData()
  }
  
  handleStartedGames(games: GamePacket[]): void {
    this.startedGames.push(...games);
    this.startedGamesReady = true;
    this.checkData();
  }

  handleGames(games: GamePacket[]): void {
    this.games = games;
    console.log(games)
    this.gamesReady = true;
    this.checkData()
    // this.hostCheck();
  }

  private checkData(): void {
    this.dataReady = this.usersReady && this.gamesReady && this.startedGamesReady;
  }

  userById(id: string): string {
    const user = Cache.getUserById(id);
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

  goToGame(id: string): void {
    this.router.navigate(['/game', id]);
  }
  canJoin(game: GamePacket): boolean {
    return !game.running || 
      (game.running && game.players.includes(this.auth.getId() as string));
  }
}