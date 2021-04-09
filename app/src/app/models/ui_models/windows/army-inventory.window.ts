import { Cache } from "src/app/services/cache.service";
import { Window } from "../core/window.ui";

export class ArmyInventoryWindow extends Window {

    private resourceIcons: HTMLImageElement[];
    private hoverIndex: number;

    constructor() {
        super(-300, 530, 300, 200, `Army invnetory`, 4);
        // super.goalY = 740;
        this.resourceIcons = [
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
            new Image(), new Image(),
        ];
        for (const iconIndex in this.resourceIcons) {
            this.resourceIcons[iconIndex].src = Cache.getResourceIcon(Number(iconIndex) + 1);
        }
        this.hoverIndex = -1;
        this.hoverX = 0;
        this.hoverY = 0;
    }

    async load(): Promise<void> {
        await Promise.all(this.resourceIcons.map((icon: HTMLImageElement) => icon.onload));
    }

    update(x: number, y: number): void {
        if (Cache.selectedArmy?.displayInvnetory) {
            if (Cache.selectedArmy.displayBuild) {
                this.goalY = 530 - 80;
            } else {
                this.goalY = 530;
            }
            this.goalX = 10;
            let totalCarry = 0;
            for (const bat of Cache.selectedArmy.battalions) {
                totalCarry += bat.carry;
            }
            let weight = 0;
            const resources = Cache.getResources();
            const army: any = Cache.selectedArmy.inventory;
            for (let i = 0 ; i < resources.length ; i++) {
                let res = army[resources[i].tag];
                if (res > 0) {
                    weight += res * resources[i].weight;
                }
            }
            this.title = `Army inventory (${weight}kg/${totalCarry}kg)`

        } else {
            this.goalX = this.originX;
        }
        this.checkHover(x, y);
    }

    onClose(): void {
        if (Cache.selectedArmy){
            Cache.selectedArmy.displayInvnetory = false;
        }
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedArmy && Cache.selectedArmy.inventory) {
            const resources = Cache.getResources();
            const armyInventory: any = Cache.selectedArmy.inventory;
            for (let i = 0 ; i < resources.length ; i++) {
                ctx.drawImage(
                    this.resourceIcons[resources[i].id - 1],
                    this.x + (Window.HEADER_START_WIDTH / 2) + 90 * (i % 3), 
                    this.y + Window.HEADER_HEIGHT + 5 + 20 * Math.floor(i / 3),
                    16,
                    16
                );
                let res = armyInventory[resources[i].tag];
                if (res > 0) {
                    res += ` (${res * resources[i].weight}kg)`;
                }
                ctx.fillText(
                    `${res}`, 
                    this.x + (Window.HEADER_START_WIDTH / 2) + 20 + 90 * (i % 3), 
                    this.y + Window.HEADER_HEIGHT + 20 * Math.floor(i / 3 + 1),
                    70
                );
            }
            if (this.hoverIndex > -1) {
                ctx.fillStyle = 'rgba(35, 206, 235, 0.9)';
                ctx.fillRect(this.hoverX as number + 20, this.hoverY as number, 80, 20)
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center'
                ctx.fillText(
                    `${resources[this.hoverIndex].display_name}`, 
                    this.hoverX as number + 60, 
                    this.hoverY as number + 17,
                    70
                );
                ctx.textAlign = 'start';
            }
        }
    }

    checkBodyHover(x: number, y: number) {
        if (Cache.selectedArmy && Cache.selectedArmy.inventory) {
            this.hoverIndex = -1;
            const resources = Cache.getResources();
            for (let i = 0 ; i < resources.length ; i++) {
                if (
                    x > this.x + (Window.HEADER_START_WIDTH / 2) + 90 * (i % 3) && 
                    y > this.y + Window.HEADER_HEIGHT + 20 * Math.floor(i / 3) &&
                    x < 15 + this.x + (Window.HEADER_START_WIDTH / 2) + 90 * (i % 3) && 
                    y < this.y + Window.HEADER_HEIGHT + 20 * Math.floor(i / 3 + 1)
                ) {
                    this.hoverIndex = i;
                    break;
                }
            }
        }
    }
}