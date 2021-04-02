import { insert, update } from '../../db/database.handler';
import { TileItem } from '../db_items/tile.item';
import { TilePacket } from '../packets/tile.packet';
import { Export } from './core/export.item';
import { Save } from './core/save.item';
import * as conf from '../../db/database.config.json';
export class Tile implements Export, Save {
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    favorable_terrain_level: number;
    orientation: number;
    base: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.game_id = data.game_id;
        this.x = data.x;
        this.y = data.y;
        this.tile_type = data.tile_type ? data.tile_type : 0;
        this.favorable_terrain_level = data.favorable_terrain_level;
        this.orientation = data.orientation ? data.orientation : 0;
        this.base = data.base ? data.base : null;
    }
    async saveItem() {
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            this.id = item.id as string;
            await insert(conf.tables.tile, item);
        } else {
            await update(conf.tables.tile, item);
        }
        return item;
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
            base: this.base,
        } as TilePacket;
    }
    exportItem(): TileItem {
        return new TileItem(this);
    }

}