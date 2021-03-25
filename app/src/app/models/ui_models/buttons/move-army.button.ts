import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { Button } from "../core/button.ui";

export class MoveArmyButton extends Button {

    constructor(x: number, y: number, width: number, height: number, army: Army) {
        super(x, y, width, height, 0,"../../../assets/ui/move.png");
    }

    handleClick(): boolean {
        if (this.hovered) {
            Game.state = 'army_movement_select';
            return true;
        }
        return false;
    }
}