import { Cache } from "src/app/services/cache.service";
import { Battalion } from "../../game_models/battalion.game";
import { BaseTypePacket } from "../../packets/base-type.packet";
import { ArmyBaseButton } from "../buttons/army-building.button";
import { BattalionUIComponent } from "../components/battalion.component";
import { Button } from "../core/button.ui";
import { Window } from "../core/window.ui";

export class ArmyBuildWindow extends Window {

    private baseButtons: Button[];

    constructor() {
        super(-300, 660, 300, 70, `Build`, 4);
        this.baseButtons = this.generateButtons();
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        if (Cache.selectedArmy?.displayBuild) {
            this.goalX = 10;
            if (!this.baseButtons.length) {
                this.baseButtons = this.generateButtons();
            }
        } else {
            this.goalX = this.originX;
        }
        for (const btn of this.baseButtons) {
            btn.x = this.x + ((this.baseButtons.indexOf(btn) + 1) * 50) - 40;
            btn.update(x, y);
        } 
    }

    onClose(): void {
        if (Cache.selectedArmy){
            Cache.selectedArmy.displayBuild = false;
        }
    }


    drawBody(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedArmy) {
            for (const btn of this.baseButtons) {
                btn.draw(ctx);
            }
        }
    }

    handleBodyClick() {
        if (Cache.selectedArmy) {
            for (const btn of this.baseButtons) {
                btn.handleClick();
            }
        }
    }

    generateButtons(): Button[] {
        const buttons = [];
        const type1 = Cache.getBaseType(1);
        if (type1) {
            buttons.push(new ArmyBaseButton(type1, this.x + 10, this.y + 25))
        }
        const type2 = Cache.getBaseType(2);
        if (type2) {
            buttons.push(new ArmyBaseButton(type2, this.x + 10, this.y + 25))
        }
        const type3 = Cache.getBaseType(3);
        if (type3) {
            buttons.push(new ArmyBaseButton(type3, this.x + 10, this.y + 25))
        }
        const type4 = Cache.getBaseType(4);
        if (type4) {
            buttons.push(new ArmyBaseButton(type4, this.x + 10, this.y + 25))
        }
        return buttons;
    }

}