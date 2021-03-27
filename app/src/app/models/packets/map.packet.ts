import { TilePacket } from "./tile.packet";
import { TileTypePacket } from "./tile-type.packet";

export interface MapPacket {
    game_id: string;
    radius: number;
    tiles: TilePacket[];
    tile_types: TileTypePacket[];
}