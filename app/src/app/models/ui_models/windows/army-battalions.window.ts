import { Cache } from "src/app/services/cache.service";
import { Battalion } from "../../game_models/battalion.game";
import { BattalionUIComponent } from "../components/battalion.component";
import { Window } from "../core/window.ui";

export class ArmyBattalionsWindow extends Window {

    private batWindows: BattalionUIComponent[];

    private displayedBattalionsReference: Battalion[] | undefined;

    constructor() {
        super(-300, 220, 300, 300, `Army battalions (0/5)`, 4);
        this.displayedBattalionsReference = Cache.selectedArmy?.battalions;
        this.batWindows = this.generateBattalionComponents();
    }

    private generateBattalionComponents(): BattalionUIComponent[] {
        if (!Cache.selectedArmy || !Cache.selectedArmy.battalions || !Cache.selectedArmy.displayBattalions) {
            return [];
        }
        const windows: BattalionUIComponent[] = [];
        for (let i = 0 ; i < 5 ; i++) {
            windows.push(new BattalionUIComponent(
                Cache.selectedArmy.battalions[i], 
                this.x, 
                Window.HEADER_HEIGHT + ((this.height - 2 * Window.HEADER_HEIGHT) / 5 * i) + this.y,
                this.width, 
                this.height / 5
            ));
        }
        return windows;
    }

    update(x: number, y: number): void {
        if (Cache.selectedArmy?.displayBattalions) {
            if (Cache.selectedArmy?.displayInvnetory) {
                this.goalY = 220;
            } else {
                this.goalY = 430;
            }
            if (this.displayedBattalionsReference != Cache.selectedArmy?.battalions) {
                this.displayedBattalionsReference = Cache.selectedArmy?.battalions;
                this.batWindows = this.generateBattalionComponents();
            }
            this.goalX = 10;
            this.title = `Army battalions (${Cache.selectedArmy.battalions.length}/5)`
            this.batWindows.forEach((wind: BattalionUIComponent) => wind.update(x, y));
        } else {
            this.goalX = this.originX;
        }
        this.checkHover(x, y);
    }

    onClose(): void {
        if (Cache.selectedArmy){
            Cache.selectedArmy.displayBattalions = false;
        }
    }

    postAnimationStep() {
        for (let i = 0 ; i < 5 ; i++) {
            const bat = this.batWindows[i];
            bat.goalX = this.x;
            bat.goalY = Window.HEADER_HEIGHT + ((this.height - 2 * Window.HEADER_HEIGHT) / 5 * i) + this.y;
        }
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedArmy) {
            for (const bat of this.batWindows) {
                bat.draw(ctx);
            }
        }
    }
}