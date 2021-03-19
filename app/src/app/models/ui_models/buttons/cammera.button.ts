import { Game } from "../../game";
import { GUI } from "../GUI";
import { Button } from "./button.ui";

export class CameraZoomButton implements Button {

    static width: number = 40;
    static height: number = 40;

    private game: Game;
    private hovered:boolean = false;
    private zoomOptions: number[];

    private cameraZoomIcon: HTMLImageElement;
    icon: HTMLImageElement;
    hoverIcon: HTMLImageElement;
    isClicked = false;

    
    constructor(gui: GUI, game: Game) {
        this.game = game;
        this.icon = new Image()
        this.hoverIcon = new Image()
        this.cameraZoomIcon = new Image()
        this.cameraZoomIcon.src = "../../../assets/ui/camera_zoom_icon.png";
        this.icon.src = "../../../assets/ui/red.png";
        this.hoverIcon.src = "../../../assets/ui/red_pressed.png";
        this.zoomOptions = game.getZoomOptions();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let img;
        if (this.isClicked) {
            img = this.hoverIcon;
        } else {
            if (this.hovered) {
                ctx.fillStyle = 'white';
                ctx.fillRect(9, 849, 42, 42);
            }
            img = this.icon;
        }
        ctx.drawImage(
            img, 
            10, 
            850, 
            CameraZoomButton.width, 
            CameraZoomButton.height
        );
        ctx.drawImage(
            this.cameraZoomIcon, 
            15, 
            855, 
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
        this.hovered = x >= 10 && 
            x <= 50 && 
            y >= 850 &&
            y <= 890;
        return this.hovered;
    }

    setClicked(b: boolean) {
        this.isClicked = b;
    }

    handleClick(): boolean {
        console.log('click')
        const zoom = this.zoomOptions.shift();
        console.log(zoom)
        if (zoom) {
            this.zoomOptions.push(zoom);
            this.game.setZoom(this.zoomOptions[0]);
            return true;
        }
        return false;
    }
}