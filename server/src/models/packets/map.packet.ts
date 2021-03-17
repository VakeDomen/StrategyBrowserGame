import { TilePacket } from "./tile.packet";

export interface MapPacket {
    game_id: string;
    radius: number;
    tiles: TilePacket[] 
}