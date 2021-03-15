import { DbItem } from './core/db.item';
export class GameMetaData extends DbItem {

    name: string;
    started: Date;
    host: string;

    constructor(data: any) {
        super(data);
        this.name = data.name;
        this.started = data.started;
        this.host = data.host;
    }
}