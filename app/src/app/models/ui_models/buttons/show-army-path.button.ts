import { Cache } from "src/app/services/cache.service";
import { Game } from "../../game";
import { Button } from "../core/button.ui";

export class ShowArmyPathButton extends Button {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height, 0,"../../../assets/ui/path.png");
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        this.visible = Game.state != 'path_view';
        this.disabled = !Cache.selectedArmy?.moveEvent;
    }

    handleClick(): boolean {
        if (this.hovered && this.visible && !this.disabled) {
            Game.state = 'path_view';
            return true;
        }
        return false;
    }
}