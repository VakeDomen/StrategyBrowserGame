import { Cache } from "src/app/services/cache.service";
import { Window } from "../core/window.ui";

export class SelectedTileOverviewWindow extends Window {

    constructor() {
        super(-250, 690, 250, 150, `Tile (${Cache.selectedTile?.x} | ${Cache.selectedTile?.y})`, 2);
        this.goalX = 10;
    }

    update(x: number, y: number): void {
        if (Cache.selectedTile) {
            this.title = `Tile (${Cache.selectedTile?.x} | ${Cache.selectedTile?.y})`;
            this.goalX = 10;
        } else {
            this.goalX = this.originX;
        }
        this.checkHover(x, y);
    }

    onClose(): void {
        Cache.selectedTile = undefined;
    }
}