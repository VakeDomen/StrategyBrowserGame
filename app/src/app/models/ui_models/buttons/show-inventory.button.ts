import { Cache } from "src/app/services/cache.service";
import { Game } from "../../game";
import { Button } from "../core/button.ui";

export class ShowArmyInventoryButton extends Button {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height, 0,"../../../assets/ui/crate.png");
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
    }

    handleClick(): boolean {
        if (this.hovered && this.visible && !this.disabled) {
            if (Cache.selectedArmy) {
                Cache.selectedArmy.displayInvnetory = true;
            }
            return true;
        }
        return false;
    }
}