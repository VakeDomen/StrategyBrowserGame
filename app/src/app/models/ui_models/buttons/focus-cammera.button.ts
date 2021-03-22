import { Game } from "../../game";
import { GUI } from "../GUI";
import { Button } from "../core/button.ui";

export class CameraFocusButton implements Button {

    static width: number = 40;
    static height: number = 40;
    static xOffset: number = 70;
    static yOffset: number = 850;

    private game: Game;
    private hovered:boolean = false;

    icon: HTMLImageElement;
    bg: HTMLImageElement;
    bghover: HTMLImageElement;
    isClicked = false;
    
    constructor(game: Game) {
        this.game = game;
        this.bg = new Image()
        this.bghover = new Image()
        this.icon = new Image()
        this.icon.src = "../../../assets/ui/camera_pin.png";
        this.bg.src = "../../../assets/ui/red.png";
        this.bghover.src = "../../../assets/ui/red_pressed.png";
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
                ctx.fillRect(            
                    CameraFocusButton.xOffset - 1, 
                    CameraFocusButton.yOffset - 1,
                    CameraFocusButton.width + 2, 
                    CameraFocusButton.height + 2
                );
            }
            img = this.bg;
        }
        ctx.drawImage(
            img, 
            CameraFocusButton.xOffset, 
            CameraFocusButton.yOffset,
            CameraFocusButton.width, 
            CameraFocusButton.height
        );
        ctx.drawImage(
            this.icon, 
            CameraFocusButton.xOffset + 5, 
            CameraFocusButton.yOffset + 5,
            CameraFocusButton.width - 10, 
            CameraFocusButton.height - 10
        );
    }
    checkHover(x: number, y: number): boolean {
        this.hovered = x >= CameraFocusButton.xOffset && 
            x <= CameraFocusButton.xOffset + CameraFocusButton.width && 
            y >= CameraFocusButton.yOffset &&
            y <= CameraFocusButton.yOffset + CameraFocusButton.height;
        return this.hovered;
    }

    setClicked(b: boolean) {
        this.isClicked = b;
    }

    handleClick(): boolean {
        const tile = this.game.getMap().getTile(0, this.game.getMap().radius - 1);
        if (tile) {
            this.game.getCamera().setGoal(...tile.calcCenter());
            return true;
        }
        return false;
    }
}