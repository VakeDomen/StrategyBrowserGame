export interface Game {
    id: string;
    host: string;
    players: string[];
    running: boolean;
    mode: string;
}