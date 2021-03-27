export interface TilePacket {
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    favorable_terrain_level: number;
    orientation: number;
    building: string | null;  
}