import { Cache } from "src/app/services/cache.service";
import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { Button } from "../core/button.ui";

export class MoveArmyButton extends Button {

    constructor(x: number, y: number, width: number, height: number, army: Army) {
        super(x, y, width, height, 0,"../../../assets/ui/move.png");
    }

    update(x: number, y: number): void {
        this.disabled = !!Cache.selectedArmy?.moveEvent || !!Cache.selectedArmy?.buildEvent;
        this.hovered = this.checkHover(x, y);
    }

    handleClick(): boolean {
        if (this.hovered && !this.disabled) {
            Game.state = 'army_movement_select';
            return true;
        }
        return false;
    }
}