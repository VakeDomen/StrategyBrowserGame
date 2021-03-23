import { Game } from "../../game";
import { GUI } from "../GUI";
import { Button } from "../core/button.ui";

export class CameraZoomButton extends Button {

    private game: Game;
    private zoomOptions: number[];

    
    constructor(game: Game) {
        super(10, 850, 40, 40, 3, "../../../assets/ui/camera_zoom_icon.png");
        this.game = game;
        this.zoomOptions = game.getZoomOptions();
    }

    drawIcon(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(
            super.icon, 
            super.x + 5, 
            super.y + 5, 
            super.width - 10, 
            super.height - 10
        );
        ctx.strokeText(
            `${this.zoomOptions[0]}`, 
            super.x + 30, 
            super.y + 15, 
            10
        );
    }
    
    handleClick(): void {
        const zoom = this.zoomOptions.shift();
        if (zoom) {
            this.zoomOptions.push(zoom);
            this.game.setZoom(this.zoomOptions[0]);
        }
    }
}