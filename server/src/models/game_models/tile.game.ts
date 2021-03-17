import { TileItem } from '../db_items/tile.item';
import { Export } from './core/export.item';
export class Tile implements Export {
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    orientation: number;
    building: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.game_id = data.game_id;
        this.x = data.x;
        this.y = data.y;
        this.tile_type = 0;
        this.orientation = 0;
        this.building = null;
    }
    exportItem(): TileItem {
        return new TileItem(this);
    }

}