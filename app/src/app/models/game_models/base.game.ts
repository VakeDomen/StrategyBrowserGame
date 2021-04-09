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
        this.defense = 0;
        this.speed = 0;
    }

    calcStats(): void {
        const tile = Cache.getTile(this.x, this.y);
        if (tile) {
            this.defense = Cache.getBaseType(this.base_type as number)?.defense as number +  tile.defense;
            this.speed = Cache.getBaseType(this.base_type as number)?.speed as number + Math.max(-90, tile.defense);
        } else {
            this.defense = 0;
            this.speed = 0;
        }
    }

}