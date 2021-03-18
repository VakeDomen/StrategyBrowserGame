import { ThrowStmt } from "@angular/compiler";
import { Drawable } from "../core/drawable.abstract";
import { TilePacket } from "../packets/tile.packet";

export class Tile implements Drawable {
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    orientation: number;
    building: string | null;
    
    
    // pixel coordinates of hex corners in the image
    //     1   2
    // 0           3
    //     5   4
    private hexBorders: [number, number][];
    private img: HTMLImageElement;
    private hexWidth: number;
    private hexHeight: number;
    private hexXoffset: number;
    private hexYoffset: number;

    constructor(tile: TilePacket) {
        this.img = new Image();
        this.img.src = '../../../assets/tiles/building_cabin_E.png';
        this.id = tile.id;
        this.game_id = tile.game_id;
        this.x = tile.x;
        this.y = tile.y;
        this.tile_type = tile.tile_type;
        this.orientation = tile.orientation;
        this.building = tile.building;
        this.hexBorders = [
            [150, 342],
            [203, 297],
            [308, 297],
            [360, 342],
            [308, 388],
            [203, 388],
        ];
        this.hexWidth = this.hexBorders[3][0] - this.hexBorders[0][0];
        this.hexHeight = this.hexBorders[5][1] - this.hexBorders[1][1]; 
        this.hexXoffset = this.hexBorders[2][0] - this.hexBorders[0][0];
        this.hexYoffset = this.hexBorders[1][1] - this.hexBorders[0][1];
    }

    async load(): Promise<void> {
        await this.img.onload;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const color = ctx.fillStyle;
        ctx.drawImage(this.img, 0, 0);
        ctx.strokeStyle = "#FF0000";
		ctx.beginPath();
		ctx.moveTo(...this.hexBorders[0]);
		for(let i = 1 ; i < this.hexBorders.length ; i++){
			ctx.lineTo(...this.hexBorders[i])
		}
		ctx.closePath();
		ctx.stroke();
        ctx.strokeStyle = color;
    }
}