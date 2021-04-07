import { fetch, insert } from "../../db/database.handler";
import { Tile } from "./tile.game";
import * as conf from '../../db/database.config.json';
import { Export } from "./core/export.item";
import { GameItem } from "../db_items/game.item";
import { v4 as uuidv4 } from 'uuid';
import random from 'random'
import { Army } from "./army.game";
import { GamePacket } from "../packets/game.packet";
import { PlayerItem } from "../db_items/player.item";
import { UserItem } from "../db_items/user.item";
import { EventHandler } from "../../helpers/event.handler";
import { Event } from "../events/core/event";
import { BaseItem } from '../db_items/base.item';
import { Base } from "./base.game";
import { Battalion } from "./battalion.game";
import { encode } from "node:punycode";

const seedrandom = require('seedrandom')

export class Game implements Export {
    id: string;
    name: string;
    host: string;
    users: string[];
    running: boolean;
    seed: string;

    map_radius: number;

    board: Map<number, Tile[]>; // column no. -> column tiles
    armies: Map<string, Army[]>; // player_id -> player armies
    eventHandler: EventHandler;
    bases: Base[];

    constructor(data: any) {
        this.id = data.id;
        this.host = data.host;
        this.name = data.name;
        this.users = data.players;
        this.running = data.running;
        this.seed = data.seed;
        this.map_radius = data.map_radius ? data.map_radius : 3;
        this.bases = data.bases;

        this.board = new Map();
        this.armies = new Map();
        this.eventHandler = new EventHandler(this);
        this.eventHandler.start();
        random.use(seedrandom(this.seed));
    }
    exportPacket() {
        return {
            id: this.id,
            host: this.host,
            players: this.users,
            running: this.running
        } as GamePacket;
    }

    exportItem(): GameItem {
        return new GameItem({
            id: this.id, 
            host: this.host, 
            name: this.name ? this.name : this.id, 
            started: '',
            seed: this.seed,
            running: true,
            map_radius: this.map_radius,
        });
    }

    pushEvent(event: Event): void {
        this.eventHandler.push(event);
    }
    
    generateSeed(): void {
        this.seed = uuidv4().replace('-', '');
    }

    async generateStartingTowns(): Promise<void> {
        if (!this.bases) {
            this.bases = [];
        }
        for (const user_id of this.users) {
            const user = (await fetch<UserItem>(conf.tables.user, new UserItem({id: user_id}))).pop();
            const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: this.id, user_id: user_id}));
            const player = players.pop();
            if (player) {
                const x = random.int(-this.map_radius + 1, this.map_radius -1);
                const y = random.int(0, 2 * (this.map_radius - 1) - Math.abs(x));
                const base = new Base({
                    player_id: player.id,
                    x: x,
                    y: y,
                    base_type: 1,
                    name: escape(`${user?.username}'s base`),
                    size: 200,
                });
                await base.saveItem();
                const tile = (this.board.get(x) as Tile[])[y];
                tile.base = base.id;
                await tile.saveItem();
                this.bases.push(base);
            }

        }
    }

    async generateStartingArmies(): Promise<void> {
        for (const user_id of this.users) {
            const user = (await fetch<UserItem>(conf.tables.user, new UserItem({id: user_id}))).pop();
            const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: this.id, user_id: user_id}));
            const player = players.pop();
            if (player) {
                const x = random.int(-this.map_radius + 1, this.map_radius -1);
                const y = random.int(0, 2 * (this.map_radius - 1) - Math.abs(x));
                const army = new Army({
                    player_id: player.id,
                    x: x,
                    y: y,
                    name: escape(`${user?.username}'s army`),
                });
                await army.saveItem();
                army.battalions.push(new Battalion({
                    army_id: army.id,
                    size: 500
                }));
                await army.saveItem();
                this.armies.set(player.id as string, [army]);
            }
        }
    }

    async generateMap(): Promise<void> {
        console.log('Generating map!')
        const board: Map<number, Tile[]> = new Map();
        let rows;
        for (let column = -this.map_radius + 1 ; column < this.map_radius ; column++) {
            let col: Tile[] = [];
            if (column <= 0) {
                rows = this.map_radius * 2 - 1 + column;
            } else {
                rows = this.map_radius * 2 - 1 - column;
            }

            for (let row = 0 ; row < rows ; row++) {
                col.push(new Tile({
                    x: column, 
                    y: row, 
                    game_id: this.id,
                    orientation: Math.floor(Math.random() * Math.floor(2)),
                    tile_type: 0,
                    building: '',
                }));
            }
            board.set(column, col);
        }
        this.randomizeMapLandscape(board);
        for (const columnIndex of board) {
            await Promise.all(columnIndex[1].map(async (tile: Tile) => tile.saveItem()));
        }
        this.board = board;
    }

    private randomizeMapLandscape(board: Map<number, Tile[]>): void {
        const normal = random.normal(0, 3);
        for (const row of board.values()) {
            for (const tile of row) {
                tile.tile_type = Math.min(Math.abs(Math.round(normal())), 7);
                if (tile.tile_type == 0) tile.tile_type++;
                tile.favorable_terrain_level = Math.round(normal());
            }
        }
    }

}
