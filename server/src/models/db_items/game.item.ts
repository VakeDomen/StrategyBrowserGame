import { DbItem } from './core/db.item';
import { v4 as uuidv4 } from 'uuid';
export class GameMetaData extends DbItem {

    name: string;
    host: string;
    started: string;
    running: boolean;
    seed: string;

    constructor(data: any) {
        super(data);
        this.name = data.name;
        this.host = data.host;
        this.started = this.parseStarted(data);
        this.running = data.running;
        this.seed = data.seed ? data.seed : this.generateSeed();
    }

    private generateSeed(): string {
        return uuidv4().replace('-', '');
    }

    private parseStarted(data: any): string {
        if (data.started) {
            return data.started.toISOString().slice(0, 19).replace('T', ' ');
        }
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}