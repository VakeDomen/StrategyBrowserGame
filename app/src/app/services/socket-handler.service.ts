import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Game } from '../models/game';
import { CredentialsPacket } from '../models/packets/credentials.packet';
import { LoginPacket } from '../models/packets/login.packet';


@Injectable({
  providedIn: 'root'
})
export class SocketHandlerService {

  private contexts: any = {};

  constructor(
    private ws: WebSocketService,
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router,
  ) { 
    this.init();
  }


  init(): void {
    this.initAuth();
    this.initLobby();
    this.initGame();
  }

  setCotext(tag: string, context: any) {
    this.contexts[tag] = context;
  }

  // ------------------ auth ------------------

  initAuth(): void {
    this.ws.listen('LOGIN').subscribe(resp => this.loginHandle(resp));
  }

  login(name: string, password: string): void {
    const packet: CredentialsPacket = {
      username: name, 
      password: password
    };
    this.ws.emit('LOGIN', packet);
  }

  register(name: string, password: string): void {
    const packet: CredentialsPacket = {
      username: name, 
      password: password
    };
    this.ws.emit('REGISTER', packet);
  }

  loginHandle(resp: LoginPacket): void {
    if (resp.success === true) {
      this.auth.login(resp.username);
      this.toastr.success('Success', 'Logged as ' + resp.username + '!');
      this.router.navigate(['/lobby']);
    } else {
      this.toastr.error('Failed', 'Name might be taken!');
    }
  }

  // ------------------ lobby ------------------
  initLobby(): void {
    this.ws.listen('LOBBY_GAMES').subscribe((resp: Game[]) => this.handleGames(resp));
    this.ws.listen('LOBBY_GAME').subscribe((resp: Game) => this.setRoom(resp));
    this.ws.listen('LOBBY_JOIN_GAME').subscribe((resp: Game) => this.setRoom(resp));
    this.ws.listen('LOBBY_START_GAME').subscribe((resp: Game) => this.handleStartGame(resp));
  }

  getGames(): void {
    this.ws.emit('LOBBY_GAMES', null);
  }
  handleGames(games: Game[]): void {
    const gameContext = this.contexts['game'];
    if (gameContext) {
      gameContext.handleGames(games);
    }
  }
  hostGame(mode: string): void {
    this.ws.emit('LOBBY_HOST_GAME', mode);
  }
  
  getRoom(id: string): void {
    this.ws.emit('LOBBY_GAME', id);
  }
  setRoom(game: Game): void {
    const roomContext = this.contexts['room'];
    if (roomContext) {
      roomContext.setRoom(game);
    }
  }
  joinRoom(id: string): void {
    this.ws.emit('LOBBY_JOIN_GAME', id);
  }
  leaveRoom(id: string): void {
    this.ws.emit('LOBBY_LEAVE_GAME', id);
  }
  startGame(id: string): void {
    this.ws.emit('LOBBY_START_GAME', id);
  }
  handleStartGame(game: Game): void {
    this.toastr.success('Host ' + game.host + ' starting the game!');
    const roomContext = this.contexts['room'];
    if (roomContext) {
      roomContext.handleStartGame(game);
    }
  }

  // ------------------ game ------------------
  initGame(): void {
  }
}