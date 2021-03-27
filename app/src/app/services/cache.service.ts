import { Injectable } from '@angular/core';
import { Army } from '../models/game_models/army.game';
import { Tile } from '../models/game_models/tile.game';
import { PlayerPacket } from '../models/packets/player.packet';
import { ResourcePacket } from '../models/packets/resource.packet';
import { TileTypePacket } from '../models/packets/tile-type.packet';
import { UserPacket } from '../models/packets/user.packet';

@Injectable({
  providedIn: 'root'
})
export class Cache {

  static path: Tile[] | undefined;
  private static _selectedArmy: Army | undefined;
  private static _selectedTile: Tile | undefined;
  
  private static gameId: string;
  private static myUserId: string;  
  private static hostId: string;
  private static me: PlayerPacket;
  private static users: Map<string, UserPacket>; // userId
  private static players: Map<string, PlayerPacket> // playerId
  private static armies: Map<string, Army[]> // playerId
  private static tileTypes: TileTypePacket[];
  private static tiles: Map<number, Map<number, Tile>>;
  private static resources: ResourcePacket[];

  constructor() {
    Cache.users = new Map();
    Cache.players = new Map();
    Cache.armies = new Map()
    Cache.gameId = '';
    Cache.hostId = '';
    Cache.myUserId = '';
    Cache.me = {} as PlayerPacket;
    Cache.tileTypes = [];
    Cache.tiles = new Map();
  }

  public static setResources(resources: ResourcePacket[]): void {
    this.resources = resources;
  }

  public static getResources(): ResourcePacket[] {
    return this.resources;
  }

  public static setTileTypes(types: TileTypePacket[]): void {
    this.tileTypes = types;
  }

  public static getTileType(id: number): TileTypePacket | undefined {
    for (const type of this.tileTypes) {
      if (type.id == id) {
        return type;
      }
    }
    return undefined;
  }

  public static saveTile(tile: Tile) {
    if (!this.tiles.get(tile.x)) {
      const map = new Map();
      map.set(tile.y, tile);
      this.tiles.set(tile.x, map);
    } else {
      this.tiles.get(tile.x)?.set(tile.y, tile);
    }
  }

  public static getTile(x: number, y: number): Tile | undefined {
    if (this.tiles.get(x)) {
      return this.tiles.get(x)?.get(y);
    }
    return undefined;
  }

  public static getAllArmies(): Army[] {
    let arm: Army[] = [];
    for (const armies of Cache.armies.values()) {
      arm = arm.concat(armies);
    }
    return arm;
  }
  public static getPlayerArmies(playerId: string): Army[] | undefined {
    return Cache.armies.get(playerId);
  }

  public static getArmy(id: string): Army | undefined {
    for (const army of Cache.getAllArmies()) {
      if (army.id == id) {
        return army;
      }
    }
    return undefined;
  }

  public static saveArmy(army: Army): void {
    if (!Cache.armies.get(army.player_id)) {
      Cache.armies.set(army.player_id, [army]);
    } else {
        Cache.armies.get(army.player_id)?.push(army);
    }
  }

  public static setHostId(id: string): void {
    Cache.hostId = id;
  }

  public static getHostId(): string {
    return Cache.hostId;
  }

  public static setMe(player: PlayerPacket) {
    Cache.me = player;
  }

  public static getMe(): PlayerPacket {
    return Cache.me;
  }

  public static setMyUserId(id: string): void {
    Cache.myUserId = id;
  }

  public static getMyUserId(): string {
    return Cache.myUserId;
  }

  public static setGameId(id: string): void {
    Cache.gameId = id;
  }

  public static getGameId(): string {
    return Cache.gameId;
  }

  public static saveUser(user: UserPacket): void {
    Cache.users.set(user.id, user);
  }

  public static getUserById(id: string): UserPacket | undefined {
    return Cache.users.get(id);
  }

  public static savePlayer(player: PlayerPacket): void {
    Cache.players.set(player.id, player);
  }

  public static getPlayerById(id: string): PlayerPacket | undefined {
    return Cache.players.get(id);
  }

  
  public static get selectedArmy(): Army | undefined {
    return Cache._selectedArmy;
  }

  public static set selectedArmy(value: Army | undefined) {
    if (value != undefined) {
      this.selectedTile = undefined
    }
    const prevArmy = Cache._selectedArmy;
    if (prevArmy) {
      prevArmy.displayInvnetory = false;
    }
    Cache._selectedArmy = value;
  }

  public static get selectedTile(): Tile | undefined {
    return Cache._selectedTile;
  }
  public static set selectedTile(value: Tile | undefined) {
    if (value != undefined) {
      this.selectedArmy = undefined
    }
    Cache._selectedTile = value;
  }
}
