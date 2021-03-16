import { Tile } from "./tile.game";

export class Game {
    id: string;
    host: string;
    players: string[];
    running: boolean;
    seed: string;

    map_radius: number;

    board: Tile[][];

    constructor(data: any) {
        this.id = data.id;
        this.host = data.host;
        this.players = data.players;
        this.running = data.running;
        this.seed = data.seed;
        this.map_radius = data.map_radius;

        this.board = [];
    }

    generateMap(): void {
        const board: Tile[][] = []
        for (let i = 0 ; i < this.map_radius ; i++) {
            for (let j = 0 ; j < this.map_radius ; j++) {
            
            }   
        }
    }

}
