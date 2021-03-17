import { insert } from "../../db/database.handler";
import { Tile } from "./tile.game";
import * as conf from '../../db/database.config.json';
import { Export } from "./core/export.item";
import { GameItem } from "../db_items/game.item";
import { v4 as uuidv4 } from 'uuid';

export class Game implements Export {
    id: string;
    host: string;
    players: string[];
    running: boolean;
    seed: string;

    map_radius: number;

    board: Map<number, Tile[]>;

    constructor(data: any) {
        this.id = data.id;
        this.host = data.host;
        this.players = data.players;
        this.running = data.running;
        this.seed = data.seed;
        this.map_radius = 3;

        this.board = new Map();
    }

    exportItem(): GameItem {
        return new GameItem({
            id: this.id, 
            host: this.host, 
            name: this.id, 
            started: '',
            seed: this.seed,
            running: true,
            map_radius: this.map_radius,
        });
    }
    
    generateSeed(): void {
        this.seed = uuidv4().replace('-', '');
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
                    x: row, 
                    y: column, 
                    game_id: this.id,
                    orientation: 0,
                    tile_type: 0,
                    building: '',
                }));
            }
            board.set(column, col);
        }
        for (const columnIndex of board) {
            await Promise.all(columnIndex[1].map(async (tile: Tile) => {
                let insertable = tile.exportItem().generateId();
                return await insert(conf.tables.tile, insertable);
            }));
        }
        this.board = board;
    }

}
