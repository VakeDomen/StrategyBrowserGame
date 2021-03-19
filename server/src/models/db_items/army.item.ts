import { DbItem } from './core/db.item';

export class ArmyItem extends DbItem {
    player_id: string;
    x: number;
    y: number;
    name: string;
    constructor(data: any) {
        super(data);
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
    }
}