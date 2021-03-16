import { DbItem } from './core/db.item';
export class TileItem extends DbItem { 
    x: number;
    y: number;
    type: number;
    orientation: number;
    building: string | null;

    constructor(data: any) {
        super(data);
        this.x = data.x;
        this.y = data.y;
        this.type = 0;
        this.orientation = 0;
        this.building = null;
    }
} 