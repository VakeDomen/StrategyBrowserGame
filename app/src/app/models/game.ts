import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";
import { LoadingSpinner } from "./ui_models/loading";
import { MapPacket } from "./packets/map.packet";
import { PlayersPacket } from "./packets/players.packet";
import { GameMap } from "./game_models/map.game";
import { Camera } from "./ui_models/camera";
import { Army } from "./game_models/army.game";
import { ArmyPacket } from "./packets/army.packet";
import { GUI } from "./ui_models/GUI";
import { Tile } from "./game_models/tile.game";

export class Game {

    // loding checks
    private loaded: boolean = false;
    private loadedMap: boolean = false;
    private loadedPlayers: boolean = false;
    private mouseSetUp: boolean = false;
    private loadedArmies: boolean = false;
    private loadedGUI: boolean = false;

    private view: 'map' | 'base';
    private canvas: ElementRef
    private guiCanvas: ElementRef
    private GUI: GUI | undefined;
    
    private clickMovmentTreshold: number = 10;
    private ignoreNextClick: boolean = false;
    private mousePressed: boolean = false;
    // private mousePressedTime: number;
    
    // camera
    private mouseDownEvent: MouseEvent | undefined;
    private mouseX: number = 0;
    private mouseY: number = 0;
    private preMoveCameraX: number | undefined;
    private preMoveCameraY: number | undefined;
    private camera: Camera;
    private cameraZoom: number = 1;
    private cameraZoomOptions: number[] = [1, 2, 4];
    
    private ws: SocketHandlerService;
    
    // game data
    private id: string;
    private running: boolean;
    private host: string;
    private playerIds: string[];
    private armies: Map<string, Army[]>; // player_id -> player's armies

    // loop timers
    private _lastDrawTimestamp: number;
    private _lastUpdateTimestamp: number;
    private _drawLoopTime: number = 1;
    private _updateLoopTime: number = 5;

    private map: GameMap;


    constructor(data: GamePacket, ws: SocketHandlerService, canvas: ElementRef, gui: ElementRef) {
        console.log('Initializing game...')
        this.loaded = false;
        this.canvas = canvas;
        this.guiCanvas = gui;
        this.ws = ws;
        this.id = data.id;
        this.host = data.host;
        this.playerIds = data.players;
        this.running = data.running;
        this._lastDrawTimestamp = new Date().getTime();
        this._lastUpdateTimestamp = new Date().getTime();
        this.view = 'map';
        this.map = new GameMap({} as MapPacket);
        this.camera = new Camera(800, 450, this);
        this.armies = new Map();
    }

    private async updateLoop(): Promise<void> {
        while(this.running) {
            this._lastUpdateTimestamp = new Date().getTime();
            // update code here
            if (!this.GUI?.checkHover(this.mouseX, this.mouseY, this.mousePressed)) {
                // console.log("no hover")
                this.map.findHover(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
            }
            
            // end update code
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
    }

    private async drawLoop(): Promise<void> {
        const spinner = new LoadingSpinner(this.canvas);
        const canvasContext = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
        const guiContext = (<HTMLCanvasElement>this.guiCanvas.nativeElement).getContext('2d');
        
        if (!canvasContext || !guiContext) {
            return;
        }
        while (!this.loaded) {
            this._lastUpdateTimestamp = new Date().getTime();
            spinner.draw(canvasContext);
            canvasContext.stroke();
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }
        while(1) {
            this._lastDrawTimestamp = new Date().getTime();
            this.clearCanvas(guiContext)
            const zoom = this.cameraZoom;
            canvasContext.scale(1 / zoom, 1 / zoom)
            // draw code here
            this.clearCanvas(canvasContext)
            switch (this.view) {
                case 'map':
                    this.map.draw(canvasContext); 
                    this.armies.forEach((armies: Army[]) => armies.map((army: Army) => army.draw(canvasContext)));
                    break;
                case 'base':     
                    break;
                default:
                    break;
                }
                        // end draw code
            this.camera.adjust(canvasContext, !this.mousePressed);
            canvasContext.scale(zoom, zoom);
            this.drawUI(guiContext);
            guiContext.scale(1, 1)
            const deltaTime = (new Date().getTime() - this._lastDrawTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._drawLoopTime - deltaTime));
        }
    }

    async start(): Promise<void> {
        this.initLoops();
        this.ws.setCotext('game', this);
        this.ws.getMap(this.id);
        this.ws.getPlayers(this.id);
        this.ws.getArmies(this.id);
        this.setupUI();
        this.setupMouse()
    }

    setPlayers(players: PlayersPacket): void {
        this.loadedPlayers = true;
        this.checkLoaded();
    }

    async setArmies(packet: ArmyPacket[]) {
        for (const armyPacket of packet) {
            const army = new Army(armyPacket);
            await army.load();
            if (!this.armies.get(armyPacket.player_id)) {
                this.armies.set(armyPacket.player_id, [army]);
            } else {
                this.armies.get(armyPacket.player_id)?.push(army);
            }
        }
        this.loadedArmies = true;
        this.checkLoaded()
    }

    async setMap(map: MapPacket) {
        this.map = new GameMap(map);
        await this.map.load();
        this.loadedMap = true;
        this.checkLoaded();
    }
    private checkLoaded(): void {
        this.loaded = this.loadedMap && 
            this.loadedPlayers &&
            this.mouseSetUp &&
            this.loadedArmies && 
            this.loadedGUI;
    }

    private initLoops(): void {
        this.drawLoop();
        this.updateLoop();
    }

    
    private clearCanvas(context: CanvasRenderingContext2D) {
        context.save();
        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        // Restore the transform
        context.restore();
    }

    private drawUI(ctx: CanvasRenderingContext2D): void {
        if(this.GUI) {
            this.GUI.draw(ctx);
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
    }
    
    handleMouseUp(event: MouseEvent): void {
        if (this.mouseDownEvent) {
            const dist = this.distToMouse(
                (this.mouseDownEvent.screenX / window.innerWidth) * 1600,
                (this.mouseDownEvent.screenY / window.innerHeight) * 900
            );
            // drag
            if (dist < this.clickMovmentTreshold) {
                // this.handleClick();
                return;
            }
            // click
            else {
                this.handleClick();
            }
            this.mousePressed = false;
            this.mouseDownEvent = undefined;
            this.preMoveCameraX = undefined;
        }
    }

    private handleClick(): void {
        if (this.GUI?.checkClick(this.mouseX, this.mouseY)) {
            return;
        }
        const tile = this.findClickedTile(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
        if (tile) {
            console.log(tile.x, tile.y)
            this.map.selectTile(tile);
            return;
        }
    }

    private distToMouse(x: number, y: number): number {
        return Math.sqrt(Math.pow(x - this.mouseX, 2) + Math.pow(y - this.mouseY, 2));
    }

    private setupMouse(): void {
        this.guiCanvas.nativeElement.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMove(event));
        this.mouseSetUp = true;
        this.checkLoaded()
    }

    private async setupUI(): Promise<void> {
        this.GUI = new GUI(this);
        await this.GUI.load();
        this.loadedGUI = true;
        this.checkLoaded()
    }

    private handleCameraDrag(): void {
        if (this.mouseDownEvent && this.preMoveCameraX && this.preMoveCameraY) {
            const startX = (this.mouseDownEvent.x / window.innerWidth) * 1600;
            const startY = (this.mouseDownEvent.y / window.innerHeight) * 900;
            this.camera.setGoal(
                this.preMoveCameraX + (startX - this.mouseX) * this.cameraZoom,
                this.preMoveCameraY + (startY - this.mouseY) * this.cameraZoom
            );
        }
    }

    private onMouseMove(event: MouseEvent) { 
        this.mouseX = (event.offsetX / window.innerWidth) * 1600;
        this.mouseY = (event.offsetY / window.innerHeight) * 900;
        if (this.mousePressed && this.mouseDownEvent) {
            this.handleCameraDrag();
            return;
        }
    }

    private findClickedTile(x: number, y: number): Tile | undefined {
        return this.map.findClick(x, y);
    }

    getCamera(): Camera {
        return this.camera;
    }

    getZoomOptions(): number[] {
        return this.cameraZoomOptions;
    }

    setZoom(zoom: number): void {
        if (this.cameraZoomOptions.includes(zoom)) {
            const tile = this.map.getTile(0, this.map.radius - 1);
            this.camera.setZoom(zoom);
            this.cameraZoom = zoom;
        }
    }
    getZoom(): number {
        return this.cameraZoom;
    }

    getMap(): GameMap {
        return this.map;
    }
}