import { Game } from "../../game";
import { Button } from "../core/button.ui";
import { Cache } from "src/app/services/cache.service";

export class CameraFocusButton extends Button {

    private game: Game;
    
    constructor(game: Game) {
        super(60, 850, 40, 40, 3, "../../../assets/ui/camera_pin.png");
        this.game = game;
    }

    handleClick(): boolean {
        let tile = this.game.getMap().getSelectedTile();
        const army = Cache.selectedArmy;
        if (!tile && army) {
            tile = this.game.getMap().getTile(army.x, army.y);
        }
        if (tile) {
            this.game.getCamera().setGoal(...tile.calcCenter());
            return true;
        }
        return false;
    }
}