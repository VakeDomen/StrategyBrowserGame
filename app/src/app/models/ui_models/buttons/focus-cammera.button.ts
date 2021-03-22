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
        const tile = this.game.getMap().getSelectedTile();
        const army = this.game.getSelectedArmy();
        
        let img;
        if (this.isClicked && (tile || army)) {
            img = this.bghover;
        } else {
            if (this.hovered && (tile || army)) {
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
        if (!(tile || army)) {
            ctx.globalAlpha = 0.3;
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
        if (!tile) {
            ctx.globalAlpha = 1;
        }
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
        let tile = this.game.getMap().getSelectedTile();
        const army = this.game.getSelectedArmy();
        if (!tile && army) {
            tile = this.game.getMap().getTile(army.x, army.y);
        }
        if (tile) {
            this.game.getCamera().setGoal(...tile.calcCenter());
            return true;
        }
        return false;
    }
}