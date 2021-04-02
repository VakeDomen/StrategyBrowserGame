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
import { Cache } from "../services/cache.service";
import { ArmyMovementPacket } from "./packets/army-movement.packet";
import { ArmyMoveEventPacket } from "./packets/move-army.event.packet";
import { EventPacket } from "./packets/event.packet";
import { ResourcePacket } from "./packets/resource.packet";
import { BasePacket } from "./packets/base.packet";
import { Base } from "./game_models/base.game";

export class Game {
    static state: 'loading' | 'view' | 'army_movement_select' | 'path_view';

    // loding checks
    private loaded: boolean = false;
    private loadedMap: boolean = false;
    private loadedPlayers: boolean = false;
    private mouseSetUp: boolean = false;
    private loadedArmies: boolean = false;
    private loadedGUI: boolean = false;
    private loadedUsers: boolean = false;
    private loadedResources: boolean = false;
    private loadedBases: boolean = false;

    private view: 'map' | 'base';
    private canvas: ElementRef
    private guiCanvas: ElementRef
    private GUI: GUI;
    
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
    
    // game data
    private running: boolean;

    // loop timers
    private _lastDrawTimestamp: number;
    private _lastUpdateTimestamp: number;
    private _drawLoopTime: number = 1;
    private _updateLoopTime: number = 5;

    private map: GameMap;


    constructor(myId: string, data: GamePacket, ws: SocketHandlerService, canvas: ElementRef, gui: ElementRef, cache: Cache) {
        console.log('Initializing game...')
        Cache.setMyUserId(myId);
        Cache.setGameId(data.id);
        Cache.setHostId(data.host);
        this.loaded = false;
        this.canvas = canvas;
        this.guiCanvas = gui;
        this.GUI = new GUI(this);
        this.ws = ws;
        this.running = data.running;
        this._lastDrawTimestamp = new Date().getTime();
        this._lastUpdateTimestamp = new Date().getTime();
        this.view = 'map';
        Game.state = 'loading';
        this.map = new GameMap({} as MapPacket);
        this.camera = new Camera(800, 450, this);
        Cache.setCamera(this.camera);
    }

    private async updateLoop(): Promise<void> {
        while(this.running) {
            this._lastUpdateTimestamp = new Date().getTime();
            // update code here
            switch (Game.state) {
                case 'view':
                    this.GUI.update(this.mouseX, this.mouseY);
                    this.map.update(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
                    this.updateArmies(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY))
                    break;
                case 'army_movement_select':
                    this.GUI.update(this.mouseX, this.mouseY);
                    this.map.update(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
                    break;
                case 'path_view':
                    this.GUI.update(this.mouseX, this.mouseY);
                    this.map.update(...this.camera.pixelToCoordinate(this.mouseX, this.mouseY));
                    break;
                default:
                    this.GUI.update(this.mouseX, this.mouseY);
                    break;
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
        canvasContext?.save();
        guiContext?.save();
        if (!canvasContext || !guiContext) {
            return;
        }
        while (!this.loaded) {
            spinner.draw(canvasContext);
            canvasContext.stroke();
            const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
            await this.delay(Math.max(deltaTime, this._updateLoopTime - deltaTime));
        }

        canvasContext.restore();
        guiContext.restore();
        this.draw(canvasContext, guiContext);
    }


    async draw(canvasContext: CanvasRenderingContext2D, guiContext: CanvasRenderingContext2D) {
        const _lastUpdateTimestamp = new Date().getTime();
        this.clearCanvas(guiContext)
        const zoom = this.cameraZoom;
        canvasContext.scale(1 / zoom, 1 / zoom)
        // draw code here
        this.clearCanvas(canvasContext)
        switch (this.view) {
            case 'map':
                this.map.draw(canvasContext); 
                Cache.getAllArmies().forEach((army: Army) => army.draw(canvasContext));
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
        this.camera.inFrameTiles = 0;

        // FPS delay
        const deltaTime = (new Date().getTime() - this._lastUpdateTimestamp) / 1000;
        await this.delay(Math.max(deltaTime, this._drawLoopTime - deltaTime));
        window.requestAnimationFrame(() => this.draw(canvasContext, guiContext));
    }

    async start(): Promise<void> {
        this.initLoops();
        this.ws.setCotext('game', this);
        this.ws.getPlayers(Cache.getGameId());
        this.ws.getArmies(Cache.getGameId());
        this.ws.getGameUsers(Cache.getGameId());
        this.ws.getResourceTypes();
        this.ws.getBases(Cache.getGameId());
        this.setupUI();
        this.setupMouse()
    }

    setBases(bases: BasePacket[]): void {
        for (const basePacket of bases) {
            Cache.saveBase(new Base(basePacket));
        }
        this.loadedBases = true;
        this.checkLoaded();
        this.ws.getMap(Cache.getGameId());
    }

    setPlayers(players: PlayerPacket[]): void {
        for (const player of players) {
            if (player.user_id == Cache.getMyUserId()) {
                Cache.setMe(player);
            }
            Cache.savePlayer(player);
        }
        this.loadedPlayers = true;
        this.checkLoaded();
    }

    setResources(resources: ResourcePacket[]): void {
        Cache.setResources(resources);
        this.loadedResources = true;
        this.checkLoaded()
    }
    
    setUsers(users: UserPacket[]): void {
        for (const user of users) {
            Cache.saveUser(user);
        }
        this.loadedUsers = true;
        this.checkLoaded();
    }

    async setArmies(packet: ArmyPacket[]) {
        for (const armyPacket of packet) {
            const army = new Army(armyPacket);
            await army.load();
            Cache.saveArmy(army);
        }
        this.loadedArmies = true;
        this.checkLoaded()
    }    
    
    async setArmy(packet: ArmyPacket) {
        const army = new Army(packet);
        await army.load();
        Cache.saveArmy(army);
    }

    async removeArmy(id: string) {
        Cache.deleteArmy(id);
    }

    async setMap(map: MapPacket) {
        Cache.setTileTypes(map.tile_types)
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
            this.loadedUsers &&
            this.loadedResources &&
            this.loadedBases;
        if (this.loaded) {
            Game.state = 'view';
        }
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
        const army = this.findHoveredArmy();
        switch (Game.state) {
            case 'view':
                // click on HUD
                if (this.GUI.handleClick(this.mouseX, this.mouseY)) return;
                // click on army
                if (army) { Cache.selectedArmy = army; return; }
                // click on tile
                const tile = this.map.getHovered();
                if (tile) { Cache.selectedTile = tile; return; }
                return;
            case 'loading':
                return;
            case 'army_movement_select':
                if (this.GUI.handleClick(this.mouseX, this.mouseY)) return;
                if (Cache.selectedArmy && Cache.path) this.moveArmy();
                return;
            case 'path_view':
                // click on HUD
                if (this.GUI.handleClick(this.mouseX, this.mouseY)) return;
                return;
            default:
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
        if (this.mousePressed && this.mouseDownEvent && !this.GUI.isHovered) {
            this.handleCameraDrag();
            return;
        }
    }
    
    private findHoveredArmy(): Army | undefined {
        return Cache.getAllArmies()[Cache.getAllArmies().map((army: Army) => army.hovered).indexOf(true)];
    }

    updateArmies(x: number, y: number): void {
        Cache.getAllArmies().forEach((army: Army) => army.update(x, y));
    }

    updateArmy(packet: ArmyMoveEventPacket): void {
        const army = Cache.getArmy(packet.army_id);
        if (army) {
            if (packet.id == army.moveEvent?.id) {
                army.moveEvent = undefined;
            }
            army.x = packet.x;
            army.y = packet.y;
            Cache.path = undefined;
        }
    }


    moveArmy(): void {
        if (Cache.selectedArmy && Cache.path) {
            Cache.path.shift(); // remove the tile army is sitting on
            const packet: ArmyMovementPacket = { 
                game_id: Cache.getGameId() as string,
                army_id: Cache.selectedArmy.id,
                tiles: Cache.path.map((tile: Tile) => [tile.x, tile.y])
            };
            this.ws.moveArmy(packet);
            Cache.path = undefined;
            Game.state = 'view';
        }
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

    handleNewEvent(eventPacket: EventPacket): void {
        switch (eventPacket.event_type) {
            case 'ARMY_MOVE':
                const army = Cache.getArmy(eventPacket.body.army_id);
                if (army) {
                    army.moveEvent = eventPacket;
                }
                break;
        
            default:
                break;
        }
    }
}