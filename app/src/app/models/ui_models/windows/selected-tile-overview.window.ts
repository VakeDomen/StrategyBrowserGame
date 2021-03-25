import { Drawable } from "../../core/drawable.abstract";
import { Game } from "../../game";
import { Tile } from "../../game_models/tile.game";
import { Window } from "../core/window.ui";
import { GUI } from "../GUI";

export class SelectedTileOverviewWindow extends Window implements Drawable {

    private gui: GUI;


    constructor(gui: GUI, tile: Tile) {
        super(-300, 690, 250, 150, `Tile (${tile.x} | ${tile.y})`, 2);
        super.goalX = 10;
        this.gui = gui;
    }

    setTile(tile: Tile): void {
        super.title = `Tile (${tile.x} | ${tile.y})`;
    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            this.gui.tileUnselected();
        }
    }
}