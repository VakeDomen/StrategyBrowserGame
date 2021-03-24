export interface ArmyMovementPacket {
    game_id: string;
    army_id: string;
    tiles: [number, number][];
}