import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { CameraZoomButton } from "./buttons/cammera.button";
import { CameraFocusButton } from "./buttons/focus-cammera.button";
import { SelectedTileOverviewWindow } from "./windows/selected-tile-overview.window";
import { Tile } from "../game_models/tile.game";
import { Army } from "../game_models/army.game";
import { SelectedArmyOverviewWindow } from "./windows/selected-army-overview.window";
import { Cache } from "src/app/services/cache.service";
import { ArmyListButton } from "./buttons/army-list.button";
import { ArmyInventoryWindow } from "./windows/army-inventory.window";
import { Button } from "selenium-webdriver";
import { ArmyBattalionsWindow } from "./windows/army-battalions.window";

export class GUI implements Drawable {

    private game: Game;

    isHovered: boolean = false;

    // buttons
    private buttons: Array<Drawable>;
    
    // windows
    private windows: Array<Drawable>;
    
    constructor(game: Game) {
        this.game = game;
        const cameraZoomButton = new CameraZoomButton(game);
        const cameraFocusButton = new CameraFocusButton(game);
        cameraFocusButton.disabled = !(Cache.selectedTile || Cache.selectedArmy);
        const armyListButton = new ArmyListButton(this);
        this.buttons = [
            cameraZoomButton,
            cameraFocusButton,
            armyListButton,
        ]
        this.windows = [
            new SelectedArmyOverviewWindow(),
            new SelectedTileOverviewWindow(),
            new ArmyInventoryWindow(),
            new ArmyBattalionsWindow(),
        ];
    }
    
    async load(): Promise<void> {
        await Promise.all([
            this.buttons.map((button: Drawable) => button.load()),
            this.windows.map((window: Drawable) => window.load()),
        ]);
    }

    update(x: number, y: number): void {
        for (const window of this.windows) {
            if (window) {
                window.update(x, y);
            } 
        }
        for (const button of this.buttons) {
            if (button) {
                button.update(x, y);
            }
        }    
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const window of this.windows) {
            if (window) {
                window.draw(ctx);
            } 
        }
        for (const button of this.buttons) {
            if (button) {
                button.draw(ctx);
            }
        }
    }



    handleClick(x: number, y: number, mousePressed?: boolean): boolean {
        const buttons = this.buttons.map((button: Drawable) => {
            return button.handleClick(x, y);
        });
        const windows = this.windows.map((window: Drawable) => {
            return window.handleClick(x, y);
        });
        return buttons.includes(true) || windows.includes(true);
    }

    removeWindow(toRemove: Drawable): void {
        for (let window of this.windows) {
            if (toRemove === window) {
                delete this.windows[this.windows.indexOf(toRemove)];
            }
        }
        for (let button of this.buttons) {
            if (toRemove === button) {
                delete this.buttons[this.buttons.indexOf(toRemove)];
            }
        }
    }

    addWindow(window: Drawable): void {
        this.windows.push(window);
    }

    
}