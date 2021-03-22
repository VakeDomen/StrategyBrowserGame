import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { CameraZoomButton } from "./buttons/cammera.button";
import { CameraFocusButton } from "./buttons/focus-cammera.button";
import { SelectedTileOverviewWindow } from "./windows/selected-tile-overview.window";
import { Camera } from "./camera";
import { Tile } from "../game_models/tile.game";
import { Army } from "../game_models/army.game";
import { SelectedArmyOverviewWindow } from "./windows/selected-army-overview.window copy";

export class GUI implements Drawable {

    private game: Game;

    redUiBox: HTMLImageElement;
    redUiBoxClicked: HTMLImageElement;
    isHovered: boolean = false;

    private cameraZoomButton: CameraZoomButton;
    private cameraFocusButton: CameraFocusButton;
    private selectedTileOverview: SelectedTileOverviewWindow | undefined;
    private selectedArmyOverview: SelectedArmyOverviewWindow | undefined;

    constructor(game: Game) {
        this.game = game;
        this.redUiBox = new Image()
        this.redUiBoxClicked = new Image()
        this.redUiBox.src = "../../../assets/ui/red.png";
        this.redUiBoxClicked.src = "../../../assets/ui/red_clicked.png";
        this.cameraZoomButton = new CameraZoomButton(game);
        this.cameraFocusButton = new CameraFocusButton(game);
    }

    async load(): Promise<void> {
        await Promise.all([
            this.redUiBox.onload,
            this.redUiBoxClicked.onload,
            this.cameraZoomButton.load(),
            this.cameraFocusButton.load(),
        ]);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.cameraZoomButton.draw(ctx);   
        this.cameraFocusButton.draw(ctx); 
        if (this.selectedTileOverview) {
            this.selectedTileOverview.draw(ctx);  
        }
        if (this.selectedArmyOverview) {
            this.selectedArmyOverview.draw(ctx);  
        }
    }

    checkHover(x: number, y: number, mousePressed?: boolean): boolean {
        if (this.cameraZoomButton.checkHover(x, y)) {
            this.cameraZoomButton.setClicked(!!mousePressed);
            this.isHovered = true;
            return true;
        }
        if (this.cameraFocusButton.checkHover(x, y)) {
            this.cameraFocusButton.setClicked(!!mousePressed);
            this.isHovered = true;
            return true;
        }
        if (this.selectedTileOverview) {
            if (this.selectedTileOverview.checkHover(x, y)) {
                this.selectedTileOverview.setClicked(!!mousePressed);
                this.isHovered = true;
                return true;
            }
        }
        if (this.selectedArmyOverview) {
            if (this.selectedArmyOverview.checkHover(x, y)) {
                this.selectedArmyOverview.setClicked(!!mousePressed);
                this.isHovered = true;
                return true;
            }
        }
        this.isHovered = false;
        return false;
    }

    checkClick(x: number, y: number, mousePressed?: boolean): boolean {
        if (this.cameraZoomButton.checkHover(x, y)) {
            this.cameraZoomButton.handleClick();
            return true;
        }
        if (this.cameraFocusButton.checkHover(x, y)) {
            this.cameraFocusButton.handleClick();
            return true;
        }
        if (this.selectedTileOverview) {
            if (this.selectedTileOverview.checkHover(x, y)) {
                this.selectedTileOverview.handleClick(x, y);
                return true;
            }
        }
        if (this.selectedArmyOverview) {
            if (this.selectedArmyOverview.checkHover(x, y)) {
                this.selectedArmyOverview.handleClick(x, y);
                return true;
            }
        }
        return false;
    }

    armySelected(army: Army): void {
        this.tileUnselected();
        if (this.selectedArmyOverview) {
            this.selectedArmyOverview.setArmy(army);
        } else {
            this.selectedArmyOverview = new SelectedArmyOverviewWindow(this.game, this, army);
        }
    }

    armyUnselected(): void {
        this.game.undeselctArmy();
        this.selectedArmyOverview = undefined;
    }

    tileSelected(tile: Tile): void {
        this.armyUnselected();
        if (this.selectedTileOverview) {
            this.selectedTileOverview.setTile(tile);
        } else {
            this.selectedTileOverview = new SelectedTileOverviewWindow(this.game, this, tile);
        }
    }

    tileUnselected(): void {
        this.game.getMap().unselectTile();
        this.selectedTileOverview = undefined;
    }

}