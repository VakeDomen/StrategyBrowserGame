import { DbItem } from './core/db.item';

export class BattalionItem extends DbItem {
    army_id: string;
    size: number;
    constructor(data: any) {
        super(data);
        this.army_id = data.army_id;
        this.size = data.size;
    }
}