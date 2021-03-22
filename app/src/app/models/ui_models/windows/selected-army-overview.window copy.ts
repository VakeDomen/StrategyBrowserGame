import { Drawable } from "../../core/drawable.abstract";
import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { Window } from "../core/window.ui";
import { GUI } from "../GUI";

export class SelectedArmyOverviewWindow extends Window implements Drawable {

    private gui: GUI;
    private army: Army;
    private game: Game;


    constructor(game: Game, gui: GUI, army: Army) {
        super(-300, 690, 300, 150, `${army.name} (${army.x} | ${army.y})`, 4);
        super.goalX = 10;
        this.army = army;
        this.game = game;
        this.gui = gui;
    }

    setArmy(army: Army): void {
        this.army = army;
        super.title = `${army.name} (${army.x} | ${army.y})`;
    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            this.gui.armyUnselected();
        }
    }
}