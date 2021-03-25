import { Cache } from "src/app/services/cache.service";
import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { Button } from "../core/button.ui";

export class MoveArmyButton extends Button {

    private army: Army;

    constructor(x: number, y: number, width: number, height: number, army: Army) {
        super(x, y, width, height, 0,"../../../assets/ui/move.png");
        this.army = army;
    }

    handleClick(): void {
        Game.state = 'army_movement_select';
        Cache.selectedArmy = this.army;
    }
}