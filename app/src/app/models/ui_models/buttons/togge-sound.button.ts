import { Cache } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";

export class ToggleSoundButton extends Button {

    private offIcon: HTMLImageElement;

    constructor() {
        super(110, 10, 40, 40, 1, "../../../assets/ui/buttons/sound.png");
        this.offIcon = new Image();
        this.offIcon.src = "../../../assets/ui/buttons/sound_off.png";
    }

    async afterLoad() {
        await this.offIcon.onload;
    }

    drawIcon(ctx: CanvasRenderingContext2D) {
        if (Cache.soundOn) {
            ctx.drawImage(
                this.icon, 
                this.x + 5, 
                this.y + 5, 
                this.width - 10, 
                this.height - 10
            );
        } else {
            ctx.drawImage(
                this.offIcon, 
                this.x + 5, 
                this.y + 5, 
                this.width - 10, 
                this.height - 10
            );
        }
    }

    handleClick(): boolean {
        if (this.hovered) {
            Cache.soundOn = !Cache.soundOn;
        }
        return this.hovered;
    }
}