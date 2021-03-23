import { GamePacket } from "./packets/game.packet";
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ElementRef } from "@angular/core";
import { LoadingSpinner } from "./ui_models/loading";
import { MapPacket } from "./packets/map.packet";
import { GameMap } from "./game_models/map.game";
import { Camera } from "./ui_models/camera";
import { Army } from "./game_models/army.game";
import { ArmyPacket } from "./packets/army.packet";
import { GUI } from "./ui_models/GUI";
import { Tile } from "./game_models/tile.game";
import { PlayerPacket } from "./packets/player.packet";
import { UserPacket } from "./packets/user.packet";
import { CacheService } from "../services/cache.service";
import { ArmyMovementPacket } from "./packets/army-movement.packet";

export class Game {

    // loding checks
    private loaded: boolean = false;
    private loadedMap: boolean = false;
    private loadedPlayers: boolean = false;
    private mouseSetUp: boolean = false;
    private loadedArmies: boolean = false;
    private loadedGUI: boolean = false;
    private loadedUsers: boolean = false;

    private view: 'map' | 'base';
    private canvas: ElementRef
    private guiCanvas: ElementRef
    private GUI: GUI | undefined;
    
    private clickMovmentTreshold: number = 10;
    private mousePressed: boolean = false;
    
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
    private cache: CacheService;
    
    // game data
    private running: boolean;

    // loop timers
    private _lastDrawTimestamp: number;
    private _lastUpdateTimestamp: number;
    private _drawLoopTime: number = 1;
    private _updateLoopTime: number = 5;

    private map: GameMap;
    private selectedArmy: Army | undefined;


    constructor(myId: string, data: GamePacket, ws: SocketHandlerService, canvas: ElementRef, gui: ElementRef, cache: CacheService) {
        console.log('Initializing game...')
        this.cache = cache;
        this.cache.setMyUserId(myId);
        this.cache.setGameId(data.id);
        this.cache.setHostId(data.host);
        this.loaded = false;
        this.canvas = canvas;
        this.guiCanvas = gui;
        this.ws = ws;
        this.running = data.running;
        this._lastDrawTimestamp = new Date().getTime();
        this._lastUpdateTimestamp = new Date().getTime();
        this.view = 'map';
        this.map = new GameMap({} as MapPacket);
        this.camera = new Camera(800, 450, this);
    }

    private async updateLoop(): Promise<void> {
        while(this.running) {
            this._lastUpdateTimestamp = new Date().getTime();
            // update code here
            if (this.GUI?.checkHover(this.mouseX, this.mouseY, this.mousePressed)) {
                const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
                await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
                continue;
            }
            if (this.findHoverArmy(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY))) {
                const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
                await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
                continue;
            }
            this.map.findHover(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
            
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
                    this.cache.getAllArmies().forEach((army: Army) => army.draw(canvasContext));
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
        this.ws.getMap(this.cache.getGameId());
        this.ws.getPlayers(this.cache.getGameId());
        this.ws.getArmies(this.cache.getGameId());
        this.ws.getGameUsers(this.cache.getGameId());
        this.setupUI();
        this.setupMouse()
    }

    setPlayers(players: PlayerPacket[]): void {
        for (const player of players) {
            if (player.user_id == this.cache.getMyUserId()) {
                this.cache.setMe(player);
            }
            this.cache.savePlayer(player);
        }
        this.loadedPlayers = true;
        this.checkLoaded();
    }
    
    setUsers(users: UserPacket[]): void {
        for (const user of users) {
            this.cache.saveUser(user);
        }
        this.loadedUsers = true;
        this.checkLoaded();
    }

    async setArmies(packet: ArmyPacket[]) {
        for (const armyPacket of packet) {
            const army = new Army(armyPacket);
            await army.load();
            this.cache.saveArmy(army);
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
            this.loadedGUI &&
            this.loadedUsers;
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
                (this.mouseDownEvent.x / window.innerWidth) * 1600,
                (this.mouseDownEvent.y / window.innerHeight) * 900
            );
            // drag
            if (dist > this.clickMovmentTreshold) {
                // this.handleClick();
                // return;
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
        const army = this.findClickedArmy(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
        if (army) {
            army.setSelected(true);
            this.GUI?.armySelected(army);
            this.selectedArmy = army;
            return;
        }
        const tile = this.findClickedTile(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
        if (tile) {
            this.map.selectTile(tile);
            this.GUI?.tileSelected(tile);
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
        this.GUI = new GUI(this, this.cache);
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
        if (this.mousePressed && this.mouseDownEvent && !this.GUI?.isHovered) {
            this.handleCameraDrag();
            return;
        }
    }

    private findClickedTile(x: number, y: number): Tile | undefined {
        return this.map.findClick(x, y);
    }
    
    private findClickedArmy(x: number, y: number): Army | undefined {
        for (const army of this.cache.getAllArmies()) {
            if (army.isPointOnArmy(x, y)) {
                return army
            }
        }
        return undefined;
    }

    private findHoverArmy(x: number, y: number): boolean {
        let found = false;
        for (const army of this.cache.getAllArmies()) {
            const hover = army.isPointOnArmy(x, y);
            found = (found || hover);
            army.setHovered(hover);
        }
        return found;
    }
    
    undeselctArmy(): void {
        this.selectedArmy?.setSelected(false);
        this.selectedArmy = undefined;
    }

    setSelectedArmy(army: Army): void {
        this.selectedArmy?.setSelected(false);
        this.selectedArmy = army;
        this.selectedArmy.setSelected(true);
    }

    moveArmy(army: Army): void {
        const tile: Tile = this.map.getRandomTile();
        const packet: ArmyMovementPacket = { 
            game_id: this.cache.getGameId() as string,
            army_id: army.id,
            x: tile.x,
            y: tile.y
        };
        console.log('sending packet', packet)
        this.ws.moveArmy(packet);
    }

    getCamera(): Camera {
        return this.camera;
    }

    getZoomOptions(): number[] {
        return this.cameraZoomOptions;
    }

    getSelectedArmy(): Army | undefined {
        return this.selectedArmy;
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