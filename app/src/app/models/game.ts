import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";
import { LoadingSpinner } from "./ui_models/loading";
import { MapPacket } from "./packets/map.packet";

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
        console.log('Iniializing game...')
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
        this.ws.setCotext('game', this);
        this.ws.getMap(this.id);
        this.loaded = true;
    }

    setMap(map: MapPacket) {
        console.log(map);
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
            // draw code here
            // clear
            canvasContext.fillRect(0, 0, 1600, 900);

            // end draw code
            const deltaTime = (new Date().getTime() - this._lastDrawTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._drawLoopTime - deltaTime));
        }
    }
    
    private async updateLoop(): Promise<void> {
        while(this.running) {
            this._lastUpdateTimestamp = new Date().getTime();
            // update code here
            

            // end update code
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
    }

    private async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    
}