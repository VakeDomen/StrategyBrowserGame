import { TileItem } from '../db_items/tile.item';
import { Export } from './core/export.item';
export class Tile implements Export {
    id: string;
    x: number;
    y: number;
    type: number;
    orientation: number;
    building: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.type = 0;
        this.orientation = 0;
        this.building = null;
    }
    exportItem(): TileItem {
        return new TileItem(this);
    }

}