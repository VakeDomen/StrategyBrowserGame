import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { GamePacket } from '../models/packets/game.packet';
import { CredentialsPacket } from '../models/packets/credentials.packet';
import { LoginPacket } from '../models/packets/login.packet';
import { UserPacket } from '../models/packets/user.packet';
import { MapPacket } from '../models/packets/map.packet';


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
    this.initErrors();
    this.initAuth();
    this.initLobby();
    this.initGame();
  }

  setCotext(tag: string, context: any) {
    this.contexts[tag] = context;
  }

  // ------------------ errors ------------------

  initErrors(): void {
    this.ws.listen('GAME_NOT_EXIST').subscribe(resp => this.handleGameNotExist());
  }

  handleGameNotExist(): void {
    this.toastr.error('Game does not exist!');
    this.router.navigate(['lobby']);
  }

  // ------------------ auth ------------------

  initAuth(): void {
    this.ws.listen('LOGIN').subscribe(resp => this.loginHandle(resp));
    this.ws.listen('PONG').subscribe((resp: LoginPacket) => this.handlePong(resp));
    this.ws.listen('GET_USER').subscribe((resp: UserPacket) => this.saveUser(resp));
    this.ws.listen('GET_USERS').subscribe((resp: UserPacket[]) => this.saveUsers(resp));
  }

  saveUser(user: UserPacket): void {
    this.auth.saveUser(user);
  }
  saveUsers(users: UserPacket[]): void {
    for (const user of users) {
      this.auth.saveUser(user);
    }
    this.contexts['lobby'].usersFetched();
  }

  handlePong(login: LoginPacket): void {
    if (login.success) {
      this.auth.login(login);
    }
  }

  getUsers(): void {
    this.ws.emit('GET_USERS', null);
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
      this.auth.login(resp);
      this.toastr.success('Success', 'Logged as ' + resp.username + '!');
      this.router.navigate(['/lobby']);
    } else {
      this.toastr.error('Failed', 'Name might be taken!');
    }
  }

  // ------------------ lobby ------------------
  initLobby(): void {
    this.ws.listen('LOBBY_GAMES').subscribe((resp: GamePacket[]) => this.handleGames(resp));
    this.ws.listen('LOBBY_GAME').subscribe((resp: GamePacket) => this.setRoom(resp));
    this.ws.listen('LOBBY_JOIN_GAME').subscribe((resp: GamePacket) => this.setRoom(resp));
    this.ws.listen('LOBBY_START_GAME').subscribe((resp: GamePacket) => this.handleStartGame(resp));
  }

  getGames(): void {
    this.ws.emit('LOBBY_GAMES', null);
  }
  handleGames(games: GamePacket[]): void {
    const gameContext = this.contexts['lobby'];
    if (gameContext) {
      for (const game of games) {
        this.ws.emit('GET_USER', game.players);
      }
      gameContext.handleGames(games);
    }
  }
  hostGame(mode: string): void {
    this.ws.emit('LOBBY_HOST_GAME', mode);
  }
  
  getRoom(id: string): void {
    this.ws.emit('LOBBY_GAME', id);
  }
  setRoom(game: GamePacket): void {
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
  handleStartGame(game: GamePacket): void {
    this.toastr.success('Host ' + game.host + ' starting the game!');
    const roomContext = this.contexts['room'];
    if (roomContext) {
      roomContext.handleStartGame(game);
    }
  }

  // ------------------ game ------------------
  initGame(): void {
    this.ws.listen('GET_MAP').subscribe((resp: MapPacket[]) => this.contexts['game'].setMap(resp));
  }

  getMap(id: string): void {
    this.ws.emit('GET_MAP', id);
  }
}