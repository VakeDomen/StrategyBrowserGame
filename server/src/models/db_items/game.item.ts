import { DbItem } from './core/db.item';
export class GameMetaData extends DbItem {

    name: string;
    host: string;
    started: string;
    running: boolean;

    constructor(data: any) {
        super(data);
        this.name = data.name;
        this.host = data.host;
        this.started = data.started ? data.started.toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.running = data.running;
    }
}