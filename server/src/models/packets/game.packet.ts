export interface GamePacket {
    id: string;
    host: string;
    players: string[];
    running: boolean;
}