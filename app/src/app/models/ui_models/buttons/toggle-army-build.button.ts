import { Cache } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";

export class ToggleArmyBuildButton extends Button {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height, 0,"../../../assets/ui/buttons/build.png");
    }


    handleClick(): boolean {
        if (this.hovered && this.visible && !this.disabled) {
            if (Cache.selectedArmy) {
                Cache.selectedArmy.displayBuild = !Cache.selectedArmy.displayBuild;
            }
            return true;
        }
        return false;
    }
}