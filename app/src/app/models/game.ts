import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";
import { LoadingSpinner } from "./ui_models/loading";
import { MapPacket } from "./packets/map.packet";
import { PlayersPacket } from "./packets/players.packet";
import { GameMap } from "./game_models/map.game";

export class Game {

    private loaded: boolean = false;
    private loadedMap: boolean = false;
    private loadedPlayers: boolean = false;

    private running: boolean;
    private view: 'map' | 'base';

    private canvas: ElementRef

    private ws: SocketHandlerService;
    
    private id: string;
    private host: string;
    private playerIds: string[];

    private _lastDrawTimestamp: number;
    private _lastUpdateTimestamp: number;
    private _drawLoopTime: number = 100;
    private _updateLoopTime: number = 100;

    private map: GameMap;


    constructor(data: GamePacket, ws: SocketHandlerService, canvas: ElementRef) {
        console.log('Initializing game...')
        this.loaded = false;
        this.canvas = canvas;
        this.ws = ws;
        this.id = data.id;
        this.host = data.host;
        this.playerIds = data.players;
        this.running = data.running;
        this._lastDrawTimestamp = new Date().getTime();
        this._lastUpdateTimestamp = new Date().getTime();
        this.view = 'map';
        this.map = new GameMap({} as MapPacket);
    }

    async start(): Promise<void> {
        this.initLoops();
        this.ws.setCotext('game', this);
        this.ws.getMap(this.id);
        this.ws.getPlayers(this.id);
    }

    setPlayers(players: PlayersPacket): void {
        this.loadedPlayers = true;
        this.checkLoaded();
    }

    setMap(map: MapPacket) {
        this.map = new GameMap(map);
        this.loadedMap = true;
        this.checkLoaded();
    }
    private checkLoaded(): void {
        this.loaded = this.loadedMap && this.loadedPlayers;
    }

    private initLoops(): void {
        this.drawLoop();
        this.updateLoop();
    }

    
    private async drawLoop(): Promise<void> {
        const spinner = new LoadingSpinner(this.canvas);
        const canvasContext = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
        if (!canvasContext) {
            return;
        }
        while (!this.loaded) {
            this._lastUpdateTimestamp = new Date().getTime();
            canvasContext.fillRect(0, 0, 1600, 900);
            spinner.draw(canvasContext);
            canvasContext.stroke();
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
        canvasContext.fillRect(0, 0, 1600, 900);
        while(1) {
            this._lastDrawTimestamp = new Date().getTime();
            // draw code here
            // clear
            // canvasContext.fillRect(0, 0, 1600, 900);
            switch (this.view) {
                case 'map':
                    this.map.draw(canvasContext); 
                    break;
                case 'base':
                
                    break;
                default:
                    break;
            }
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