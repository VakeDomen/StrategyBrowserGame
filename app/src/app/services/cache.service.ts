import { Injectable } from '@angular/core';
import { Army } from '../models/game_models/army.game';
import { Base } from '../models/game_models/base.game';
import { Tile } from '../models/game_models/tile.game';
import { BaseTypePacket } from '../models/packets/base-type.packet';
import { PlayerPacket } from '../models/packets/player.packet';
import { ResourcePacket } from '../models/packets/resource.packet';
import { TileTypePacket } from '../models/packets/tile-type.packet';
import { UserPacket } from '../models/packets/user.packet';
import { Camera } from '../models/ui_models/camera';

@Injectable({
  providedIn: 'root'
})
export class Cache {
  
  public static soundOn: boolean = true;

  static path: Tile[] | undefined;
  private static _selectedArmy: Army | undefined;
  private static _selectedTile: Tile | undefined;
  private static _selectedBase: Base | undefined;
  
  private static gameId: string;
  private static myUserId: string;  
  private static hostId: string;
  private static me: PlayerPacket;
  private static users: Map<string, UserPacket>; // userId
  private static players: Map<string, PlayerPacket> // playerId
  private static armies: Map<string, Army[]> // playerId
  private static tileTypes: TileTypePacket[];
  private static baseTypes: BaseTypePacket[];
  private static tiles: Map<number, Map<number, Tile>>;
  private static resources: ResourcePacket[];
  private static bases: Map<string, Base[]>; // playerId
  private static camera: Camera;

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
    Cache.bases = new Map();
  }

  static getPlayerBases(id: string): Base[] | undefined {
    return this.bases.get(id);
  }

  static getMyBase(id: string): Base | undefined {
    const me = Cache.me?.id as string;
    const myBases = this.bases.get(me);
    if (myBases) {
      return myBases[id as any];
    }
    return undefined;
  }

  static getBase(id: string): Base | undefined {
    for (const bases of this.bases.values()) {
      for (const base of bases) {
        if (base.id == id) return base;
      }
    }
    return undefined;
  }
 
  public static saveBase(base: Base) {
    if (!Cache.bases.get(base.player_id)) {
      Cache.bases.set(base.player_id, [base]);
    } else {
      let found = false;
      for (let i = 0 ; i < (Cache.bases.get(base.player_id) as Base[]).length ; i++) {
        if ((Cache.bases.get(base.player_id) as Base[])[i].id == base.id) {
          (Cache.bases.get(base.player_id) as Base[])[i] = base
          found = true;
          break;
        }
      }
      if (!found) {
       Cache.bases.get(base.player_id)?.push(base);
      }
    }
  }

  static setBaseTypes(baseTypes: BaseTypePacket[]) {
    this.baseTypes = baseTypes;
  }

  public static setCamera(camera: Camera): void {
    this.camera = camera;
  }

  public static getCamera(): Camera {
    return this.camera;
  }

  public static setResources(resources: ResourcePacket[]): void {
    this.resources = resources;
  }

  public static getBaseType(id: number): BaseTypePacket | undefined {
    for (const baseType of this.baseTypes) {
      if (baseType.id == id) {
        return baseType;
      }
    }
    return undefined;
  }

  public static getResources(): ResourcePacket[] {
    return this.resources;
  }

  public static getResource(id: number) {
    return this.resources[id - 1];
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

  public static deleteArmy(id: string): void {
    const army = Cache.getArmy(id);
    if (army) {
      const playerArmies = this.armies.get(army.player_id);
      if (!playerArmies) {
        return;
      }
      for (let i = 0 ; i < playerArmies.length ; i++) {
        if (army.id == playerArmies[i].id) {
          playerArmies.splice(i, 1);
          break;
        }
      }
    }
  }

  public static saveArmy(army: Army): void {
    if (!Cache.armies.get(army.player_id)) {
      Cache.armies.set(army.player_id, [army]);
    } else {
      let found = false;
      for (let i = 0 ; i < (Cache.armies.get(army.player_id) as Army[]).length ; i++) {
        if ((Cache.armies.get(army.player_id) as Army[])[i].id == army.id) {
          (Cache.armies.get(army.player_id) as Army[])[i] = army
          found = true;
          break;
        }
      }
      if (!found) {
        Cache.armies.get(army.player_id)?.push(army);
      }
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
      this.selectedTile = undefined;
      this.selectedBase = undefined;
    }
    const prevArmy = Cache._selectedArmy;
    if (prevArmy) {
      prevArmy.displayInvnetory = false;
      prevArmy.displayBattalions = false;
    }
    Cache._selectedArmy = value;
  }

  public static get selectedBase(): Base | undefined {
    return Cache._selectedBase;
  }

  public static set selectedBase(value: Base | undefined) {
    if (value != undefined) {
      this.selectedTile = undefined;
      this.selectedArmy = undefined;
    }
    const prevBase = Cache._selectedBase;
    if (prevBase) {
      // prevBase.displayInvnetory = false;
      // prevBase.displayBattalions = false;
    }
    Cache._selectedBase = value;
  }

  public static get selectedTile(): Tile | undefined {
    return Cache._selectedTile;
  }
  public static set selectedTile(value: Tile | undefined) {
    if (value != undefined) {
      this.selectedArmy = undefined;
      this.selectedBase = undefined;
    }
    Cache._selectedTile = value;
  }

  public static getStatIcon(stat: string): string {
    switch (stat) {
      case 'size':
        return "../../../assets/resources/pop.png";
      case 'attack':
        return "../../../assets/army/attack.png";
      case 'defense':
        return "../../../assets/army/defense.png";
      case 'speed':
        return "../../../assets/army/speed.png";
      case 'carry':
        return "../../../assets/army/carry.png";
      case 'build':
        return "../../../assets/army/construct.png";
      default:
        return "../../../assets/resources/pop.png"
    }
  }

  public static getResourceIcon(id: number): string {
    switch (id) {
        case 1: 
            return "../../../assets/resources/food.png"
        case 2:
            return "../../../assets/resources/wood.png"
        case 3:
            return "../../../assets/resources/stone.png"
        case 4:
            return "../../../assets/resources/ore.png"
        case 5:
            return "../../../assets/resources/cart.png"
        case 6:
            return "../../../assets/resources/horse.png"
        case 7:
            return "../../../assets/resources/mail-armor.png"
        case 8:
            return "../../../assets/resources/scale-armor.png"
        case 9:
            return "../../../assets/resources/plate-armor.png"
        case 10:
            return "../../../assets/resources/crude-bow.png"
        case 11:
            return "../../../assets/resources/recurve-bow.png"
        case 12:
            return "../../../assets/resources/longbow.png"
        case 13:
            return "../../../assets/resources/shortsword.png"
        case 14:
            return "../../../assets/resources/longsword.png"
        case 15:
            return "../../../assets/resources/zweihander.png"
        case 16:
            return "../../../assets/resources/pike.png"
        case 17:
            return "../../../assets/resources/halberd.png"
        case 18:
            return "../../../assets/resources/poleaxe.png"
        case 19:
            return "../../../assets/resources/buckler.png"
        case 20:
            return "../../../assets/resources/kite-shield.png"
        case 21:
            return "../../../assets/resources/tower-shield.png"
        case 22:
            return "../../../assets/resources/tools_1.png"
        case 23:
            return "../../../assets/resources/tools_2.png"
        case 24:
            return "../../../assets/resources/tools_3.png"
        default:
            return "../../../assets/resources/pop.png"
    }
}
}
