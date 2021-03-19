import { BattalionPacket } from "./battalion.packet";

export interface ArmyPacket {
    id: string;
    player_id: string;
    name: string;
    x: number;
    y: number;
    battalions: BattalionPacket[];
}