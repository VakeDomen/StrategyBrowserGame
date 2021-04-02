import { TileItem } from '../db_items/tile.item';
import { TilePacket } from '../packets/tile.packet';
import { Export } from './core/export.item';
export class Tile implements Export {
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    favorable_terrain_level: number;
    orientation: number;
    building: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.game_id = data.game_id;
        this.x = data.x;
        this.y = data.y;
        this.tile_type = data.tile_type ? data.tile_type : 0;
        this.favorable_terrain_level = data.favorable_terrain_level;
        this.orientation = data.orientation ? data.orientation : 0;
        this.building = data.building ? data.building : null;
    }
    exportPacket(): TilePacket {
        return {
            id: this.id,
            game_id: this.game_id,
            x: this.x,
            y: this.y,
            tile_type: this.tile_type,
            favorable_terrain_level: this.favorable_terrain_level,
            orientation: this.orientation,
            base: this.building,
        } as TilePacket;
    }
    exportItem(): TileItem {
        return new TileItem(this);
    }

}