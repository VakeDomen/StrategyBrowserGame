import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { CameraZoomButton } from "./buttons/cammera.button";
import { Camera } from "./camera";

export class GUI implements Drawable {

    private game: Game;

    redUiBox: HTMLImageElement;
    redUiBoxClicked: HTMLImageElement;

    private cameraZoomButton: CameraZoomButton;

    constructor(game: Game) {
        this.game = game;
        this.redUiBox = new Image()
        this.redUiBoxClicked = new Image()
        this.redUiBox.src = "../../../assets/ui/red.png";
        this.redUiBoxClicked.src = "../../../assets/ui/red_clicked.png";
        this.cameraZoomButton = new CameraZoomButton(this, game);
    }

    async load(): Promise<void> {
        await Promise.all([
            this.redUiBox.onload,
            this.redUiBoxClicked.onload,
        ]);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.cameraZoomButton.draw(ctx);   
    }

    checkHover(x: number, y: number, mousePressed?: boolean): boolean {
        if (this.cameraZoomButton.checkHover(x, y)) {
            this.cameraZoomButton.setClicked(!!mousePressed);
            return true;
        }
        return false;
    }

    checkClick(x: number, y: number, mousePressed?: boolean): boolean {
        if (this.cameraZoomButton.checkHover(x, y)) {
            this.cameraZoomButton.handleClick();
            return true;
        }
        return false;
    }

}