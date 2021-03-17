import { DbItem } from './core/db.item';
export class GameItem extends DbItem {

    name: string;
    host: string;
    started: string;
    running: boolean;
    seed: string;
    map_radius: number;

    constructor(data: any) {
        super(data);
        this.name = data.name;
        this.host = data.host;
        this.started = data.started;
        this.running = data.running;
        this.seed = data.seed;
        this.map_radius = data.map_radius;
    }

    parseStarted(started?: Date): void {
        if (started) {
            this.started = started.toISOString().slice(0, 19).replace('T', ' ');
        }
        this.started = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}