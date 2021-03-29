import { Cache } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";

export class ShowArmyBattalionsButton extends Button {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height, 0,"../../../assets/ui/banner.png");
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
    }

    handleClick(): boolean {
        if (this.hovered && this.visible && !this.disabled) {
            if (Cache.selectedArmy) {
                Cache.selectedArmy.displayBattalions = !Cache.selectedArmy.displayBattalions;
            }
            return true;
        }
        return false;
    }
}