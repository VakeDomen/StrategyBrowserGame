import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";
import { LoadingSpinner } from "./ui_models/loading";
import { MapPacket } from "./packets/map.packet";
import { PlayersPacket } from "./packets/players.packet";
import { GameMap } from "./game_models/map.game";
import { Camera } from "./ui_models/camera";

export class Game {

    private loaded: boolean = false;
    private loadedMap: boolean = false;
    private loadedPlayers: boolean = false;

    private running: boolean;
    private view: 'map' | 'base';

    private clickMovmentTreshold: number = 10;
    private ignoreNextClick: boolean = false;
    private mousePressed: boolean = false;
    // private mousePressedTime: number;
    private mouseDownEvent: MouseEvent | undefined;
    private mouseX: number = 0;
    private mouseY: number = 0;
    private preMoveCameraX: number = 0;
    private preMoveCameraY: number = 0;
    private canvas: ElementRef
    private camera: Camera;

    private ws: SocketHandlerService;
    
    private id: string;
    private host: string;
    private playerIds: string[];

    private _lastDrawTimestamp: number;
    private _lastUpdateTimestamp: number;
    private _drawLoopTime: number = 1;
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
        this.camera = new Camera(800, 450);
        this.camera.setGoal(0, 3800)
        // this.camera.goalY = 500;
        // this.mousePressedTime = new Date().getTime();
    }

    async start(): Promise<void> {
        this.initLoops();
        this.ws.setCotext('game', this);
        this.ws.getMap(this.id);
        this.ws.getPlayers(this.id);
        this.setupMouse()
    }

    setPlayers(players: PlayersPacket): void {
        this.loadedPlayers = true;
        this.checkLoaded();
    }

    async setMap(map: MapPacket) {
        this.map = new GameMap(map);
        await this.map.load();
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
            // canvasContext.fillRect(0, 0, 1600, 900);
            spinner.draw(canvasContext);
            canvasContext.stroke();
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
        // canvasContext.fillRect(0, 0, 1600, 900);
        while(1) {
            this._lastDrawTimestamp = new Date().getTime();
            // draw code here
            // clear
            this.clearCanvas(canvasContext)
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
            this.camera.adjust(canvasContext, !this.mousePressed);
            canvasContext.fillRect(800, 450, 5, 5)
            const deltaTime = (new Date().getTime() - this._lastDrawTimestamp) / 1000;
            // console.log(this._drawLoopTime - deltaTime)
            await this.delay(Math.max(deltaTime, this._drawLoopTime - deltaTime));
        }
    }

    private clearCanvas(context: CanvasRenderingContext2D) {
        context.save();
        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        // Restore the transform
        context.restore();
    }
    
    private async updateLoop(): Promise<void> {
        while(this.running) {
            this._lastUpdateTimestamp = new Date().getTime();
            // update code here
            // console.log(this.mouseX, this.mouseY)

            // end update code
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
    }

    private async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    handleMouseDown(event: MouseEvent): void {
        this.mousePressed = true;
        this.preMoveCameraX = this.camera.x;
        this.preMoveCameraY = this.camera.y;
        this.mouseDownEvent = event;
        console.log('down')
    }
    handleMouseUp(event: MouseEvent): void {
        console.log('up')
        
        if (this.mouseDownEvent) {
            const dist = this.distToMouse(
                (this.mouseDownEvent.screenX / window.innerWidth) * 1600,
                (this.mouseDownEvent.screenY / window.innerHeight) * 900
            );
            if (dist < this.clickMovmentTreshold) {
                this.handleClick(
                    (this.mouseDownEvent.screenX / window.innerWidth) * 1600,
                    (this.mouseDownEvent.screenY / window.innerHeight) * 900
                );
                return;
            }
            this.mousePressed = false;
        }
        this.ignoreNextClick = true;
    }

    private handleClick(x: number, y: number): void {

    }

    distToMouse(x: number, y: number): number {
        return Math.sqrt(Math.pow(x - this.mouseX, 2) + Math.pow(y - this.mouseY, 2));
    }

    setupMouse(): void {
        this.canvas.nativeElement.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMove(event));
    }

    handleDrag(x: number, y: number, dist?: number): void {
        if (this.mouseDownEvent) {
            this.camera.goalX = this.preMoveCameraX + (this.mouseDownEvent.screenX - x);
            this.camera.goalY = this.preMoveCameraY + (this.mouseDownEvent.screenY - y);
        }
    }

    onMouseMove(event: MouseEvent) { 
        this.mouseX = (event.screenX / window.innerWidth) * 1600;
        this.mouseY = (event.screenY / window.innerHeight) * 900;
        
        if (this.mousePressed && this.mouseDownEvent) {
            const clickX = (this.mouseDownEvent.screenX / window.innerWidth) * 1600;
            const clickY = (this.mouseDownEvent.screenY / window.innerHeight) * 900;
            this.handleDrag(this.mouseX, this.mouseY);
        }
    }
    

}