import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { CameraZoomButton } from "./buttons/cammera.button";
import { CameraFocusButton } from "./buttons/focus-cammera.button";
import { SelectedTileOverviewWindow } from "./windows/selected-tile-overview.window";
import { Camera } from "./camera";
import { Tile } from "../game_models/tile.game";
import { Army } from "../game_models/army.game";
import { SelectedArmyOverviewWindow } from "./windows/selected-army-overview.window";
import { CacheService } from "src/app/services/cache.service";
import { ArmyListButton } from "./buttons/army-list.button";
import { ArmyListWindow } from "./windows/army-list.window";

export class GUI implements Drawable {

    private game: Game;
    private cache: CacheService;

    isHovered: boolean = false;

    // buttons
    private cameraZoomButton: CameraZoomButton;
    private cameraFocusButton: CameraFocusButton;
    private armyListButton: ArmyListButton;

    // windows
    private selectedTileOverview: SelectedTileOverviewWindow | undefined;
    private selectedArmyOverview: SelectedArmyOverviewWindow | undefined;
    private armyListWindow: ArmyListWindow | undefined;

    constructor(game: Game, cache: CacheService) {
        this.cache = cache
        this.game = game;
        this.cameraZoomButton = new CameraZoomButton(game);
        this.cameraFocusButton = new CameraFocusButton(game);
        this.cameraFocusButton.disabled = !(this.selectedArmyOverview || this.selectedTileOverview)
        this.armyListButton = new ArmyListButton(cache, this);
    }

    async load(): Promise<void> {
        await Promise.all([
            this.cameraZoomButton.load(),
            this.cameraFocusButton.load(),
        ]);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.cameraZoomButton.draw(ctx);   
        this.cameraFocusButton.draw(ctx); 
        this.armyListButton.draw(ctx);

        if (this.selectedTileOverview) {
            this.selectedTileOverview.draw(ctx);  
        }
        if (this.selectedArmyOverview) {
            this.selectedArmyOverview.draw(ctx);  
        }
        if (this.armyListWindow) {
            this.armyListWindow.draw(ctx);
        }
    }

    checkHover(x: number, y: number, mousePressed?: boolean): boolean {
        if (this.cameraZoomButton.checkHover(x, y)) {
            this.cameraZoomButton.isClicked = !!mousePressed;
            this.isHovered = true;
            return true;
        }
        if (this.cameraFocusButton.checkHover(x, y)) {
            this.cameraFocusButton.isClicked = !!mousePressed;
            this.isHovered = true;
            return true;
        }
        if (this.armyListButton.checkHover(x, y)) {
            this.armyListButton.isClicked = !!mousePressed;
            this.isHovered = true;
            return true;
        }
        if (this.selectedTileOverview) {
            if (this.selectedTileOverview.checkHover(x, y)) {
                this.selectedTileOverview.isClicked = !!mousePressed;
                this.isHovered = true;
                return true;
            }
        }
        if (this.selectedArmyOverview) {
            if (this.selectedArmyOverview.checkHover(x, y)) {
                this.selectedArmyOverview.isClicked = !!mousePressed;
                this.isHovered = true;
                return true;
            }
        }
        if (this.armyListWindow) {
            if (this.armyListWindow.checkHover(x, y)) {
                this.armyListWindow.isClicked == !!mousePressed;
                this.isHovered = true;
                return true;
            }
        }
        this.isHovered = false;
        return false;
    }

    checkClick(x: number, y: number, mousePressed?: boolean): boolean {
        if (this.armyListButton.checkHover(x, y)) {
            this.armyListButton.handleClick();
            return true;
        }
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
        if (this.armyListWindow) {
            if (this.armyListWindow.checkHover(x, y)) {
                this.armyListWindow.handleClick(x, y);
                return true;
            }
        }
        return false;
    }

    createArmyListWindow(armies: Army[] | undefined): void {
        this.armyListWindow = new ArmyListWindow(armies, this, this.game);
    }

    armySelected(army: Army): void {
        this.tileUnselected();
        if (this.selectedArmyOverview) {
            this.selectedArmyOverview.setArmy(army);
        } else {
            this.selectedArmyOverview = new SelectedArmyOverviewWindow(this.cache,this.game, this, army);
        }
        this.cameraFocusButton.disabled = !(this.selectedArmyOverview || this.selectedTileOverview)
    }

    armyUnselected(): void {
        Game.selectedArmy = undefined;
        this.selectedArmyOverview = undefined;
        this.cameraFocusButton.disabled = !(this.selectedArmyOverview || this.selectedTileOverview)
    }

    tileSelected(tile: Tile): void {
        this.armyUnselected();
        if (this.selectedTileOverview) {
            this.selectedTileOverview.setTile(tile);
        } else {
            this.selectedTileOverview = new SelectedTileOverviewWindow(this, tile);
        }
        this.cameraFocusButton.disabled = !(this.selectedArmyOverview || this.selectedTileOverview)
    }

    tileUnselected(): void {
        this.game.getMap().unselectTile();
        this.selectedTileOverview = undefined;
        this.cameraFocusButton.disabled = !(this.selectedArmyOverview || this.selectedTileOverview)
    }

}