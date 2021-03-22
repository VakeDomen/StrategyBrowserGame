export interface GamePacket {
    id: string;
    host: string;
    name: string;
    players: string[];
    running: boolean;
}