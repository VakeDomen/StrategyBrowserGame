import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";

export class Game {

    private loaded = false;
    private ws: SocketHandlerService;
    private id: string;
    private host: string;
    private players: string[];
    private running: boolean;
    private canvas: ElementRef

    constructor(data: GamePacket, ws: SocketHandlerService, canvas: ElementRef) {
        this.loaded = false;
        this.ws = ws;
        this.id = data.id;
        this.host = data.host;
        this.players = data.players;
        this.running = data.running;
        this.canvas = canvas;
        this.draw();

    }

    draw(): void {
        const canvasContext = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
        console.log('heyhe')
        if (canvasContext) {
            canvasContext.fillRect(0,0, 100, 100);
            canvasContext.stroke()

        }
    }

    update(): void {
    }
}