import { BasePacket } from "../packets/base.packet";

export class Base {
    
    id: string;
    player_id: string;
	x: number;
    y: number;
    base_type: number;
    name: string;

    constructor(basePacket: BasePacket) {
        this.id = basePacket.id;
        this.player_id = basePacket.player_id;
        this.x = basePacket.x;
        this.y = basePacket.y;
        this.base_type = basePacket.base_type;
        this.name = basePacket.name;
        console.log(this)
    }

}