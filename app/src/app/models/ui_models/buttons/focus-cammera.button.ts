import { Game } from "../../game";
import { GUI } from "../GUI";
import { Button } from "./button.ui";

export class CameraFocusButton implements Button {

    private game: Game;
    private hovered:boolean = false;
    private zoomOptions: number[];

    private cameraZoomIcon: HTMLImageElement;
    icon: HTMLImageElement;
    hoverIcon: HTMLImageElement;
    isClicked = false;
    
    constructor(gui: GUI, game: Game) {
        this.game = game;
        this.gui = gui;
        this.icon = new Image()
        this.hoverIcon = new Image()
        this.cameraZoomIcon = new Image()
        this.cameraZoomIcon.src = "../../../assets/ui/camera_zoom_icon.png";
        this.icon.src = "../../../assets/ui/red.png";
        this.hoverIcon.src = "../../../assets/ui/red_pressed.png";
        this.zoomOptions = game.getZoomOptions();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // const xOffset = (this.game.getCamera().x - 800) * this.game.getZoom();
        // const yOffset = (this.game.getCamera().y - 450) * this.game.getZoom();
        const xOffset = 0;
        const yOffset = 0;
        let img;
        if (this.isClicked) {
            img = this.hoverIcon;
        } else {
            if (this.hovered) {
                ctx.fillStyle = 'white';
                ctx.fillRect(xOffset + 9, yOffset + 849, 42, 42);
            }
            img = this.icon;
        }
        ctx.drawImage(img, xOffset + 10, yOffset + 850, 40, 40);
        ctx.drawImage(this.cameraZoomIcon, xOffset + 15, yOffset + 855, 30, 30);
        ctx.strokeText(`${this.zoomOptions[0]}`, xOffset + 37, yOffset + 865, 10);
        // console.log('drawing', this.cameraZoomIcon, xOffset + 15, yOffset + 855, 30, 30)
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