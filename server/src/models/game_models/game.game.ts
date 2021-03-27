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
const seedrandom = require('seedrandom')

export class Game implements Export {
    id: string;
    name: string;
    host: string;
    players: string[];
    running: boolean;
    seed: string;

    map_radius: number;

    board: Map<number, Tile[]>; // column no. -> column tiles
    armies: Map<string, Army[]>; // player_id -> player armies
    eventHandler: EventHandler;

    constructor(data: any) {
        this.id = data.id;
        this.host = data.host;
        this.name = data.name;
        this.players = data.players;
        this.running = data.running;
        this.seed = data.seed;
        this.map_radius = data.map_radius ? data.map_radius : 3;

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
            players: this.players,
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

    async generateStartingArmies(): Promise<void> {
        for (const user_id of this.players) {
            const user = (await fetch<UserItem>(conf.tables.user, new UserItem({id: user_id}))).pop();
            const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: this.id, user_id: user_id}));
            const player = players.pop();
            if (player) {
                const army = new Army({
                    player_id: player.id,
                    x: random.int(-this.map_radius + 1, this.map_radius -1),
                    y: random.int(-this.map_radius + 1, this.map_radius -1),
                    name: `${user?.username}'s army`,
                });
                await army.saveItem();
                this.armies.set(player.id as string, [army]);
            }
        }
    }

    async generateMap(): Promise<void> {
        console.log('generating map')
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
            await Promise.all(columnIndex[1].map(async (tile: Tile) => {
                let insertable = tile.exportItem().generateId();
                return await insert(conf.tables.tile, insertable);
            }));
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
