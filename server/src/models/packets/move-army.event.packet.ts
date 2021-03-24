import { EventPacket } from "./event.packet";

export interface ArmyMoveEventPacket extends EventPacket {
    army_id: string;
    x: number;
    y: number;
}