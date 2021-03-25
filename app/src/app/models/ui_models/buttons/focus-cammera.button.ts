import { Game } from "../../game";
import { Button } from "../core/button.ui";
import { Cache } from "src/app/services/cache.service";

export class CameraFocusButton extends Button {

    private game: Game;
    
    constructor(game: Game) {
        super(60, 850, 40, 40, 3, "../../../assets/ui/camera_pin.png");
        this.game = game;
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        this.disabled = !(Cache.selectedTile || Cache.selectedArmy);
    }

    handleClick(): boolean {
        if (this.hovered) {
            const army = Cache.selectedArmy;
            if (army) {
                const tile = this.game.getMap().getTile(army.x, army.y);
                this.game.getCamera().setGoal(...tile?.calcCenter() as [number, number]);
                return true;
            }
            let tile = Cache.selectedTile;
            if (tile) {
                this.game.getCamera().setGoal(...tile.calcCenter());
                return true;
            }
        }
        return false;
    }
}