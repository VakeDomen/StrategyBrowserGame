import { Injectable } from '@angular/core';
import { PlayerPacket } from '../models/packets/player.packet';
import { UserPacket } from '../models/packets/user.packet';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private gameId: string;
  private myUserId: string;  
  private hostId: string;
  private me: PlayerPacket;
  private users: Map<string, UserPacket>;
  private players: Map<string, PlayerPacket>

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.gameId = '';
    this.hostId = '';
    this.myUserId = '';
    this.me = {} as PlayerPacket;
  }

  setHostId(id: string): void {
    this.hostId = id;
  }

  getHostId(): string {
    return this.hostId;
  }

  setMe(player: PlayerPacket) {
    this.me = player;
  }

  getMe(): PlayerPacket {
    return this.me;
  }

  setMyUserId(id: string): void {
    this.myUserId = id;
  }

  getMyUserId(): string {
    return this.myUserId;
  }

  setGameId(id: string): void {
    this.gameId = id;
  }

  getGameId(): string {
    return this.gameId;
  }

  saveUser(user: UserPacket): void {
    this.users.set(user.id, user);
  }

  getUserById(id: string): UserPacket | undefined {
    return this.users.get(id);
  }

  savePlayer(player: PlayerPacket): void {
    this.players.set(player.id, player);
  }

  getPlayerById(id: string): PlayerPacket | undefined {
    console.log(this.players)
    
    return this.players.get(id);
  }
}
