import { Cache } from "src/app/services/cache.service";
import { Window } from "../core/window.ui";

export class SelectedTileOverviewWindow extends Window {

    private food: HTMLImageElement;
    private wood: HTMLImageElement;
    private stone: HTMLImageElement;
    private ore: HTMLImageElement;
    private speed: HTMLImageElement;
    private defense: HTMLImageElement;

    constructor() {
        super(-300, 740, 300, 150, `Tile (${Cache.selectedTile?.x} | ${Cache.selectedTile?.y})`, 2);
        this.goalX = 10;
        this.food = new Image();
        this.wood = new Image();
        this.stone = new Image();
        this.ore = new Image();
        this.speed = new Image();
        this.defense = new Image();
        this.food.src = "../../../assets/resources/food.png";
        this.wood.src = "../../../assets/resources/wood.png";
        this.stone.src = "../../../assets/resources/stone.png";
        this.ore.src = "../../../assets/resources/ore.png";
        this.speed.src = "../../../assets/army/speed.png";
        this.defense.src = "../../../assets/army/defense.png";
    }

    update(x: number, y: number): void {
        if (Cache.selectedTile) {
            this.title = `${Cache.selectedTile?.tag} (${Cache.selectedTile?.x} | ${Cache.selectedTile?.y})`;
            this.goalX = 10;
        } else {
            this.goalX = this.originX;
        }
        this.checkHover(x, y);
    }

    getIcon(index: number): HTMLImageElement | undefined {
        switch (index) {
            case 2:
                return this.food;
            case 3:
                return this.wood;
            case 4:
                return this.stone;
            case 5:
                return this.ore;
            case 6:
                return this.speed;
            case 7:
                return this.defense;
            default:
                return undefined;
        }
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        const wording = [
            ['Favorable terain level: ', Cache.selectedTile?.favorable_terrain_level],
            ["", ''], 
            ["    Food: ", Cache.selectedTile?.food], 
            ["    Wood: ", Cache.selectedTile?.wood], 
            ["    Stone: ", Cache.selectedTile?.stone], 
            ["    Ore: ", Cache.selectedTile?.ore],
            ["    Speed: ", `${Cache.selectedTile?.speed}%`],
            ["    Defense bonus: ", `${Cache.selectedTile?.defense}%`]
        ];
        for (let i = 0 ; i < wording.length ; i++) {
            const tilestat = wording[i];
            // if (tilestat[1] == 0 && tilestat[0] != 'Favorable terain level: ') {
            //     continue;
            // }
            const icon = this.getIcon(i);
            if (icon) {
                ctx.drawImage(
                    icon,
                    this.x + (Window.HEADER_START_WIDTH / 2) , 
                    this.y + Window.HEADER_HEIGHT + 15 * (i) + 2,
                    16,
                    16
                )
            }

            ctx.textAlign = "start";
            ctx.fillText(
                `${tilestat[0]}`, 
                this.x + (Window.HEADER_START_WIDTH / 2) , 
                this.y + Window.HEADER_HEIGHT + 15 * (i + 1),
                this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
            );
            ctx.textAlign = "end";
            ctx.fillText(
                `${tilestat[1]}`, 
                this.x + (Window.HEADER_START_WIDTH / 2) + 275, 
                this.y + Window.HEADER_HEIGHT + 15 * (i + 1),
                this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
            );
            ctx.textAlign = 'start';
        }
    }

    onClose(): void {
        Cache.selectedTile = undefined;
    }
}