import { Game } from "../../game";
import { Button } from "../core/button.ui";

export class CameraZoomButton extends Button {

    private game: Game;
    private zoomOptions: number[];

    
    constructor(game: Game) {
        super(10, 10, 40, 40, 1, "../../../assets/ui/camera_zoom_icon.png");
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
    
    handleClick(): boolean {
        if (this.hovered) {
            const zoom = this.zoomOptions.shift();
            if (zoom) {
                this.zoomOptions.push(zoom);
                this.game.setZoom(this.zoomOptions[0]);
            }
            return true;
        }
        return false;
    }
}