import { DbItem } from './core/db.item';
export class TileItem extends DbItem { 
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    favorable_terrain_level: number;
    orientation: number;
    base: string | null;

    constructor(data: any) {
        super(data);
        this.game_id = data.game_id;
        this.x = data.x;
        this.y = data.y;
        this.tile_type = data.tile_type;
        this.favorable_terrain_level = data.favorable_terrain_level;
        this.orientation = data.orientation;
        this.base = data.base;
    }
} 