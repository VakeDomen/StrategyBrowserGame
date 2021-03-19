import { Drawable } from "../core/drawable.abstract";
import { TilePacket } from "../packets/tile.packet";

export class Tile implements Drawable {
    // pixel coordinates of hex corners in the image
    //     1   2
    // 0           3
    //     5   4
    private static hexBorders: [number, number][]= [
        [150, 342],
        [203, 297],
        [308, 297],
        [360, 342],
        [308, 388],
        [203, 388],
    ];
    public static hexMiddle: [number, number] = [255, 342];
    public static hexWidth: number = Tile.hexBorders[3][0] - Tile.hexBorders[0][0];
    public static hexHeight: number = Tile.hexBorders[5][1] - Tile.hexBorders[1][1]; 
    public static hexXoffset: number = Tile.hexBorders[2][0] - Tile.hexBorders[0][0];
    public static hexYoffset: number = Tile.hexBorders[1][1] - Tile.hexBorders[0][1];
    
    private img: HTMLImageElement;
    
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    orientation: number;
    building: string | null;
    
    

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
    }

    async load(): Promise<void> {
        await this.img.onload;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const color = ctx.fillStyle;
        const offsets: [number, number] = [this.calcImageXOffset(), this.calcImageYOffset()];
        ctx.drawImage(this.img, ...offsets);
        ctx.fillText(`${this.x} ${this.y}`, offsets[0]+235, offsets[1]+356);
		ctx.strokeStyle = color;
    }

    calcCenter(): [number, number] {
        return [
            this.calcImageXOffset() + Tile.hexMiddle[0],
            this.calcImageYOffset() + Tile.hexMiddle[1],
        ]
    }

    calcImageXOffset(): number {
        let offset = 0;
        offset += this.x * Tile.hexXoffset;
        return offset;
    }

    calcImageYOffset(): number {
        let offset = 0;
        offset += this.y * Tile.hexHeight;
        offset += Math.abs(this.x * Tile.hexYoffset);
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