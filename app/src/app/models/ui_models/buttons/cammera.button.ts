import { Game } from "../../game";
import { GUI } from "../GUI";
import { Button } from "../core/button.ui";

export class CameraZoomButton implements Button {

    static width: number = 40;
    static height: number = 40;
    static xOffset: number = 10;
    static yOffset: number = 850;

    private game: Game;
    private hovered:boolean = false;
    private zoomOptions: number[];

    icon: HTMLImageElement;
    bg: HTMLImageElement;
    bghover: HTMLImageElement;
    isClicked = false;

    
    constructor(game: Game) {
        this.game = game;
        this.bg = new Image()
        this.bghover = new Image()
        this.icon = new Image()
        this.icon.src = "../../../assets/ui/camera_zoom_icon.png";
        this.bg.src = "../../../assets/ui/red.png";
        this.bghover.src = "../../../assets/ui/red_pressed.png";
        this.zoomOptions = game.getZoomOptions();
    }
    
    async load(): Promise<void> {
        await Promise.all([
            this.bg.onload,
            this.bghover.onload,
            this.icon.onload,
        ]);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let img;
        if (this.isClicked) {
            img = this.bghover;
        } else {
            if (this.hovered) {
                ctx.fillStyle = 'white';
                ctx.fillRect(9, 849, 42, 42);
            }
            img = this.bg;
        }
        ctx.drawImage(
            img, 
            CameraZoomButton.xOffset, 
            CameraZoomButton.yOffset, 
            CameraZoomButton.width, 
            CameraZoomButton.height
        );
        ctx.drawImage(
            this.icon, 
            CameraZoomButton.xOffset + 5, 
            CameraZoomButton.yOffset + 5, 
            CameraZoomButton.width - 10, 
            CameraZoomButton.width - 10
        );
        ctx.strokeText(
            `${this.zoomOptions[0]}`, 
            37, 
            865, 
            10
        );
        ctx.fillStyle = 'black';
    }
    checkHover(x: number, y: number): boolean {
        this.hovered = x >= CameraZoomButton.xOffset && 
            x <= CameraZoomButton.xOffset + CameraZoomButton.width && 
            y >= CameraZoomButton.yOffset &&
            y <= CameraZoomButton.yOffset + CameraZoomButton.height;
        return this.hovered;
    }

    setClicked(b: boolean) {
        this.isClicked = b;
    }

    handleClick(): boolean {
        const zoom = this.zoomOptions.shift();
        if (zoom) {
            this.zoomOptions.push(zoom);
            this.game.setZoom(this.zoomOptions[0]);
            return true;
        }
        return false;
    }
}