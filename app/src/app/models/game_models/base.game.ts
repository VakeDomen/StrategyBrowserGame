import { Cache } from "src/app/services/cache.service";
import { BasePacket } from "../packets/base.packet";
import { TileTypePacket } from "../packets/tile-type.packet";

export class Base {
    
    id: string;
    player_id: string;
	x: number;
    y: number;
    base_type: number;
    name: string;
    size: number;
    defense: number;
    speed: number;

    constructor(basePacket: BasePacket) {
        this.id = basePacket.id;
        this.player_id = basePacket.player_id;
        this.x = basePacket.x;
        this.y = basePacket.y;
        this.base_type = basePacket.base_type;
        this.name = basePacket.name;
        this.size = basePacket.size; 
        const tile = Cache.getTile(this.x, this.y);
        if (tile) {
            console.log(tile)
            this.defense = Cache.getBaseType(this.base_type as number)?.defense as number +  (Cache.getTileType(tile.tile_type) as TileTypePacket).defense + tile.favorable_terrain_level * 5;
            this.speed = Cache.getBaseType(this.base_type as number)?.speed as number + Math.max(-90, (Cache.getTileType(tile.tile_type) as TileTypePacket).speed + tile.favorable_terrain_level * 5);
        } else {
            this.defense = 0;
            this.speed = 0;
        }
        console.log(this)
    }

    calcStats(): void {
        const tile = Cache.getTile(this.x, this.y);
        console.log('tile', tile)
        if (tile) {
            console.log(tile)
            this.defense = Cache.getBaseType(this.base_type as number)?.defense as number +  tile.defense;
            this.speed = Cache.getBaseType(this.base_type as number)?.speed as number + Math.max(-90, tile.defense);
        } else {
            this.defense = 0;
            this.speed = 0;
        }
    }

}