import { Game } from "../../game";
import { Button } from "../core/button.ui";

export class HideArmyPathButton extends Button {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height, 0,"../../../assets/ui/path_corssed.png");
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        this.visible = Game.state == 'path_view';
    }

    handleClick(): boolean {
        if (this.hovered && this.visible) {
            Game.state = 'view';
            return true;
        }
        return false;
    }

}