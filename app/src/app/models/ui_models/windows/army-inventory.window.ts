import { Cache } from "src/app/services/cache.service";
import { Window } from "../core/window.ui";

export class ArmyInventoryWindow extends Window {

    private resourceIcons: HTMLImageElement[];
    private hoverIndex: number;

    constructor() {
        super(270, 800, 300, 200, `Army invnetory`, 4);
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
            this.resourceIcons[iconIndex].src = this.getResourceIcon(Number(iconIndex) + 1);
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
            this.goalY = 640;
            let totalCarry = 0;
            for (const bat of Cache.selectedArmy.battalions) {
                totalCarry += 20 * bat.size;
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
            this.title = `Army invnetory (${weight}kg/${totalCarry}kg)`

        } else {
            this.goalY = 900;
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
                    this.x + (Window.HEADER_START_WIDTH / 2) + 100 * (i % 3), 
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
                    this.x + (Window.HEADER_START_WIDTH / 2) + 20 + 100 * (i % 3), 
                    this.y + Window.HEADER_HEIGHT + 20 * Math.floor(i / 3 + 1),
                    80
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
                    80
                );
                ctx.textAlign = 'start';
            }
        }
    }

    checkBodyHover(x: number, y: number) {
        if (Cache.selectedArmy && Cache.selectedArmy.inventory) {
            this.hoverIndex = -1;
            const resources = Cache.getResources();
            const armyInventory: any = Cache.selectedArmy.inventory;
            for (let i = 0 ; i < resources.length ; i++) {
                if (
                    x > this.x + (Window.HEADER_START_WIDTH / 2) + 100 * (i % 3) && 
                    y > this.y + Window.HEADER_HEIGHT + 20 * Math.floor(i / 3) &&
                    x < 15 + this.x + (Window.HEADER_START_WIDTH / 2) + 100 * (i % 3) && 
                    y < this.y + Window.HEADER_HEIGHT + 20 * Math.floor(i / 3 + 1)
                ) {
                    this.hoverIndex = i;
                    break;
                }
            }
        }
    }

    private getResourceIcon(id: number): string {
        switch (id) {
            case 1: 
                return "../../../assets/resources/food.png"
            case 2:
                return "../../../assets/resources/wood.png"
            case 3:
                return "../../../assets/resources/stone.png"
            case 4:
                return "../../../assets/resources/ore.png"
            case 5:
                return "../../../assets/resources/cart.png"
            case 6:
                return "../../../assets/resources/horse.png"
            case 7:
                return "../../../assets/resources/mail-armor.png"
            case 8:
                return "../../../assets/resources/scale-armor.png"
            case 9:
                return "../../../assets/resources/plate-armor.png"
            case 10:
                return "../../../assets/resources/crude-bow.png"
            case 11:
                return "../../../assets/resources/recurve-bow.png"
            case 12:
                return "../../../assets/resources/longbow.png"
            case 13:
                return "../../../assets/resources/shortsword.png"
            case 14:
                return "../../../assets/resources/longsword.png"
            case 15:
                return "../../../assets/resources/zweihander.png"
            case 16:
                return "../../../assets/resources/pike.png"
            case 17:
                return "../../../assets/resources/halberd.png"
            case 18:
                return "../../../assets/resources/poleaxe.png"
            case 19:
                return "../../../assets/resources/buckler.png"
            case 20:
                return "../../../assets/resources/kite-shield.png"
            case 21:
                return "../../../assets/resources/tower-shield.png"
            case 22:
                return "../../../assets/resources/tools_1.png"
            case 23:
                return "../../../assets/resources/tools_2.png"
            case 24:
                return "../../../assets/resources/tools_3.png"
            default:
                return "../../../assets/resources/tools_3.png"
        }
    }
}