import { Game } from "../../game";
import { Button } from "../core/button.ui";
import { Cache } from "src/app/services/cache.service";
import { Tile } from "../../game_models/tile.game";

export class CameraFocusButton extends Button {

    private game: Game;
    
    constructor(game: Game) {
        super(60, 10, 40, 40, 1, "../../../assets/ui/camera_pin.png");
        this.game = game;
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        this.disabled = !(Cache.selectedTile || Cache.selectedArmy || Cache.selectedBase);
    }

    handleClick(): boolean {
        if (this.hovered) {
            // const army = Cache.selectedArmy;
            // if (army) {
            //     const 
            //     this.game.getCamera().setGoal(...tile?.calcCenter() as [number, number]);
            //     return true;
            // }
            let tile: Tile | undefined;

            if (Cache.selectedArmy) {
                tile = this.game.getMap().getTile(Cache.selectedArmy.x, Cache.selectedArmy.y);
            }
            if (Cache.selectedTile) {
                tile = Cache.selectedTile;
            }
            if (Cache.selectedBase) {
                tile = this.game.getMap().getTile(Cache.selectedBase.x, Cache.selectedBase.y);
            }
            if (tile) {
                this.game.getCamera().setGoal(...tile.calcCenter());
                return true;
            }
        }
        return false;
    }
}