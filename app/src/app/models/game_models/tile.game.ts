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
        this.img.src = this.getAssetRoute(tile.tile_type);
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
        const offsets: [number, number] = [this.calcImageXOffset(), this.calcImageYOffset()];
        // ctx.strokeRect(this.calcImageXOffset(), this.calcImageYOffset(), this.img.width, this.img.height)
        ctx.drawImage(this.img, ...offsets);
        // ctx.fillStyle = "#FF0000";
        // console.log(this.x, this.y, offsets)
        // ctx.font = "30px Arial";
        // ctx.fillText(`${this.x} ${this.y}`, offsets[0]+235, offsets[1]+356);
		
        // ctx.beginPath();
		// ctx.moveTo(this.hexBorders[0][0]+offsets[0], this.hexBorders[0][1]+offsets[1]);
		// for(let i = 1 ; i < this.hexBorders.length ; i++){
		// 	ctx.lineTo(this.hexBorders[i][0]+offsets[0], this.hexBorders[i][1]+offsets[1]);
		// }
		// ctx.closePath();
		// ctx.stroke();
        ctx.strokeStyle = color;
    }

    calcImageXOffset(): number {
        let offset = 0;
        offset += this.x * this.hexXoffset;
        return offset;
    }

    calcImageYOffset(): number {
        let offset = 0;
        offset += this.y * this.hexHeight;
        offset += Math.abs(this.x * this.hexYoffset);
        return offset;
    }

    getAssetRoute(type: number): string {
        switch (type) {
            case 1:
                return '../../../assets/tiles/grass_E.png';
            case 2:
                return '../../../assets/tiles/grass_forest_E.png';
            case 3:
                return '../../../assets/tiles/grass_hill_E.png';
            case 4:
                return '../../../assets/tiles/sand_rocks_E.png';
            case 5:
                return '../../../assets/tiles/stone_rocks_E.png';
            case 6:
                return '../../../assets/tiles/stone_hill_E.png';
            case 7:
                return '../../../assets/tiles/stone_mountain_E.png';
        
            default:
                return '../../../assets/tiles/grass_E.png';
        }
    }
}