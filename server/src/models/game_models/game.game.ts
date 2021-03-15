export class Game {
    id: string;
    host: string;
    players: string[];
    running: boolean;

    constructor(data: any) {
        this.id = data.id;
        this.host = data.host;
        this.players = data.players;
        this.running = data.running;
    }
}