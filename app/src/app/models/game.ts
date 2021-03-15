import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";
import { LoadingSpinner } from "./ui_models/loading";
import { Player } from "./game_models/payler";

export class Game {

    private loaded = false;
    private running: boolean;

    private canvas: ElementRef

    private ws: SocketHandlerService;
    
    private id: string;
    private host: string;
    private playerIds: string[];

    private _lastDrawTimestamp: number;
    private _lastUpdateTimestamp: number;
    private _drawLoopTime: number = 100;
    private _updateLoopTime: number = 100;

    constructor(data: GamePacket, ws: SocketHandlerService, canvas: ElementRef) {
        this.loaded = false;
        this.canvas = canvas;
        this.ws = ws;
        this.id = data.id;
        this.host = data.host;
        this.playerIds = data.players;
        this.running = data.running;
        this._lastDrawTimestamp = new Date().getTime();
        this._lastUpdateTimestamp = new Date().getTime();
    }

    async start(): Promise<void> {
        this.initLoops();
        await this.delay(1000);
        this.loaded = true;
    }

    private initLoops(): void {
        this.drawLoop();
        this.updateLoop();
    }

    
    private async drawLoop(): Promise<void> {
        const spinner = new LoadingSpinner();
        const canvasContext = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
        if (!canvasContext) {
            return;
        }
        while (!this.loaded) {
            this._lastUpdateTimestamp = new Date().getTime();
            spinner.rawProgressIndicator(this.canvas, canvasContext)
            canvasContext.stroke();
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
        while(1) {
            this._lastDrawTimestamp = new Date().getTime();
            if (canvasContext) {
                canvasContext.fillRect(0,0, 100, 100);
                canvasContext.stroke()
                
            }
            const deltaTime = (new Date().getTime() - this._lastDrawTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._drawLoopTime - deltaTime));
        }
    }
    
    private async updateLoop(): Promise<void> {
        while(this.running) {
            this._lastUpdateTimestamp = new Date().getTime();
           
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
    }

    private async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    
}