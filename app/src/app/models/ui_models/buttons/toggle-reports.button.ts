import { Cache } from "src/app/services/cache.service";
import { Game } from "../../game";
import { Button } from "../core/button.ui";

export class ToggleReportsButton extends Button {

    constructor() {
        super(1600 - 160, 10, 40, 40, 2, "../../../assets/ui/buttons/scroll.png");
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
            `${Cache.unreadReports}`, 
            super.x + 5, 
            super.y + 15, 
            10
        );
    }
    
    handleClick(): boolean {
        if (this.hovered) {
            Cache.sideWindow = 'reports';
        }
        return false;
    }
}