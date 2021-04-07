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
import { PlayersPacket } from '../models/packets/players.packet';
import { Cache } from './cache.service';
import { StartGamePacket } from '../models/packets/start-game.packet';
import { ArmyPacket } from '../models/packets/army.packet';
import { ArmyMovementPacket } from '../models/packets/army-movement.packet';
import { EventPacket } from '../models/packets/event.packet';
import { ResourcePacket } from '../models/packets/resource.packet';
import { BasePacket } from '../models/packets/base.packet';
import { BaseTypePacket } from '../models/packets/base-type.packet';


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
    private cache: Cache,
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
    if (this.contexts[tag]) {
      console.log(`Context '${tag}' already exists!`);
    }
    this.contexts[tag] = context;
  }

  // ------------------ errors ------------------

  initErrors(): void {
    this.ws.listen('GAME_NOT_EXIST').subscribe(resp => this.handleGameNotExist());
    this.ws.listen('ROOM_NOT_EXIST').subscribe(resp => this.handleRoomNotExist());
    this.ws.listen('PLAYER_NOT_EXIST').subscribe(resp => this.handlePlayerNotExist());
    this.ws.listen('USER_NOT_EXIST').subscribe(resp => this.handlePlayerNotExist());
    this.ws.listen('UNAUTHORIZED').subscribe((resp) => this.handleUnauthorized());
  }

  handleUnauthorized(): void {
    console.log('unathorized');
    this.router.navigate(['/']);
  }

  handleGameNotExist(): void {
    this.toastr.error('Game does not exist!');
    this.router.navigate(['lobby']);
  }  
  handleRoomNotExist(): void {
    this.toastr.error('Room does not exist!');
    this.router.navigate(['lobby']);
  }
  handlePlayerNotExist(): void {
    this.toastr.error('Player does not exist!');
  }

  ping() {  
    this.ws.emit('PING', this.auth.getId());
  }
            


  // ------------------ auth ------------------

  initAuth(): void {
    this.ws.listen('LOGIN').subscribe(resp => this.loginHandle(resp));
    this.ws.listen('PONG').subscribe((resp: LoginPacket) => this.handlePong(resp));
    this.ws.listen('GET_USER').subscribe((resp: UserPacket) => this.saveUser(resp));
    this.ws.listen('GET_USERS').subscribe((resp: UserPacket[]) => this.saveUsers(resp));
  }

  saveUser(user: UserPacket): void {
    Cache.saveUser(user);
  }

  saveUsers(users: UserPacket[]): void {
    for (const user of users) {
      Cache.saveUser(user);
    }
    if (this.contexts['lobby']) {
      this.contexts['lobby'].usersFetched();
    } else {
      console.log('missing lobby context!');
    }
  }

  handlePong(login: LoginPacket): void {
    console.log('pong: ', login.success);
    if (login.success) {
      this.auth.login(login);
    }
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
    this.ws.listen('STARTED_GAMES').subscribe((resp: GamePacket[]) => this.handleStartedGames(resp));
    this.ws.listen('GET_GAME').subscribe((resp: GamePacket) => this.handleGetGame(resp));
  }

  handleGetGame(game: GamePacket): void {
    if (!game.running) {
      this.handleGameNotExist();
    } else {
      this.contexts['game'].setGame(game);
    }
  }

  handleStartedGames(games: GamePacket[]): void {
    const gameContext = this.contexts['lobby'];
    if (gameContext) {
      gameContext.handleStartedGames(games);
    }
  }

  getParticipatedGames(): void {
    this.ws.emit('STARTED_GAMES', null);
  }

  getGames(): void {
    this.ws.emit('LOBBY_GAMES', null);
  }

  getUsers(): void {
    this.ws.emit('GET_USERS', null);
  }

  handleGames(games: GamePacket[]): void {
    const gameContext = this.contexts['lobby'];
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
  getGame(id: string): void {
    this.ws.emit('GET_GAME', id);
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
  startGame(packet: StartGamePacket): void {
    this.ws.emit('LOBBY_START_GAME', packet);
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
    this.ws.listen('GET_PLAYERS').subscribe((resp: PlayersPacket[]) => this.contexts['game'].setPlayers(resp));
    this.ws.listen('GET_ARMIES').subscribe((resp: ArmyPacket[]) => this.contexts['game'].setArmies(resp));
    this.ws.listen('GET_ARMY').subscribe((resp: ArmyPacket) => this.contexts['game'].setArmy(resp));
    this.ws.listen('GET_BASES').subscribe((resp: BasePacket[]) => this.contexts['game'].setBases(resp));
    this.ws.listen('ARMY_DEFEATED').subscribe((id: string) => this.contexts['game'].removeArmy(id));
    this.ws.listen('GET_GAME_USERS').subscribe((resp: UserPacket[]) => this.contexts['game'].setUsers(resp));
    this.ws.listen('QUEUED_EVENT').subscribe((resp: EventPacket) => this.contexts['game'].handleNewEvent(resp));
    this.ws.listen('ARMY_MOVE_EVENT').subscribe((resp: ArmyMovementPacket) => this.contexts['game'].updateArmy(resp));
    this.ws.listen('GET_RESOURCE_TYPES').subscribe((resp: ResourcePacket[]) => this.contexts['game'].setResources(resp));
    this.ws.listen('GET_BASE_TYPES').subscribe((resp: BaseTypePacket[]) => this.contexts['game'].setBaseTypes(resp));
  }

  moveArmy(armyPacket: ArmyMovementPacket): void {
    this.ws.emit('ARMY_MOVE', armyPacket);
  }

  getMap(id: string): void {
    this.ws.emit('GET_MAP', id);
  }

  getPlayers(id: string): void {
    this.ws.emit('GET_PLAYERS', id);
  }

  getArmies(id: string): void {
    this.ws.emit('GET_ARMIES', id);
  }

  getGameUsers(id: string): void {
    this.ws.emit('GET_GAME_USERS', id);
  }

  getResourceTypes(): void {
    this.ws.emit('GET_RESOURCE_TYPES', null);
  }

  getBases(id: string) {
    this.ws.emit('GET_BASES', id);
  }

  getBaseTypes() {
    this.ws.emit('GET_BASE_TYPES', null);
  }

}