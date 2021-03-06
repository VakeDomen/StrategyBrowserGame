import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { CameraZoomButton } from "./buttons/cammera.button";
import { CameraFocusButton } from "./buttons/focus-cammera.button";
import { SelectedTileOverviewWindow } from "./windows/selected-tile-overview.window";
import { Tile } from "../game_models/tile.game";
import { Army } from "../game_models/army.game";
import { SelectedArmyOverviewWindow } from "./windows/selected-army-overview.window";
import { Cache } from "src/app/services/cache.service";
import { ArmyListButton } from "./buttons/army-list.button";
import { ArmyInventoryWindow } from "./windows/army-inventory.window";
import { ArmyBattalionsWindow } from "./windows/army-battalions.window";
import { BaseListButton } from "./buttons/base-list.button";
import { PlayerNameBanner } from "./components/player-name-banner.component";
import { SelectedBaseOverviewWindow } from "./windows/selected-base-overview.window";
import { ToggleSoundButton } from "./buttons/togge-sound.button";
import { ArmyBuildWindow } from "./windows/army-build.window";
import { ToggleReportsButton } from "./buttons/toggle-reports.button";
import { ArmyListWindow } from "./windows/army-list.window";
import { BaseListWindow } from "./windows/base-list.window";
import { ReportListWindow } from "./windows/report-list.window";
import { SelectedReportOverviewWindow } from "./windows/selected-report-overview.window";

export class GUI implements Drawable {

    isHovered: boolean = false;

    private elements: Array<Drawable>;
    
    constructor(game: Game) {
        this.elements = [
            new CameraZoomButton(game),
            new CameraFocusButton(game),
            new ToggleSoundButton(),
            new ArmyListButton(this),
            new BaseListButton(this),
            new ToggleReportsButton(),
            new SelectedArmyOverviewWindow(),
            new SelectedTileOverviewWindow(),
            new SelectedBaseOverviewWindow(),
            new ArmyListWindow(undefined),
            new BaseListWindow(undefined),
            new ReportListWindow(),
            new ArmyInventoryWindow(),
            new ArmyBattalionsWindow(),
            new ArmyBuildWindow(),
            new SelectedReportOverviewWindow(),
            new PlayerNameBanner(),
        ];
    }
    
    async load(): Promise<void> {
        await Promise.all([
            this.elements.map((el: Drawable) => el.load()),
        ]);
    }

    update(x: number, y: number): void {
        for (const el of this.elements) {
            if (el) {
                el.update(x, y);
            } 
        }  
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const el of this.elements) {
            if (el) {
                el.draw(ctx);
            } 
        }
    }

    handleClick(x: number, y: number, mousePressed?: boolean): boolean {
        const elts = this.elements.map((el: Drawable) => {
            return el.handleClick(x, y);
        });
        return elts.includes(true);
    }

    removeElement(toRemove: Drawable): void {
        for (let el of this.elements) {
            if (toRemove === el) {
                delete this.elements[this.elements.indexOf(toRemove)];
            }
        }
    }

    addElement(window: Drawable): void {
        this.elements.push(window);
    }

    
}