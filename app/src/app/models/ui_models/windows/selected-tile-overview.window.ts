import { Drawable } from "../../core/drawable.abstract";
import { Game } from "../../game";
import { Tile } from "../../game_models/tile.game";
import { Window } from "../core/window.ui";
import { GUI } from "../GUI";

export class SelectedTileOverviewWindow extends Window implements Drawable {

    private gui: GUI;
    private tile: Tile;
    private game: Game;


    constructor(game: Game, gui: GUI, tile: Tile) {
        super(-300, 690, 300, 150, `Tile (${tile.x} | ${tile.y})`, 3);
        super.goalX = 10;
        this.tile = tile;
        this.game = game;
        this.gui = gui;
    }

    setTile(tile: Tile): void {
        this.tile = tile;
        super.title = `Tile (${tile.x} | ${tile.y})`;
    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            this.gui.tileUnselected();
        }
    }
}