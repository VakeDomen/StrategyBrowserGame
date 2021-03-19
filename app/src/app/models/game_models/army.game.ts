import { Battalion } from './battalion.game';
import { Drawable } from '../core/drawable.abstract';
import { Tile } from './tile.game';
export class Army implements Drawable{
    id: string;
    player_id: string;
    x: number;
    y: number;
    name: string;

    battalions: Battalion[];

    private img: HTMLImageElement;

    private imgWidth: number = 212;
    private imgHeight: number = 218;
    

    constructor(data: any) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
        this.battalions = [];

        this.img = new Image();
        this.img.src = this.getAssetRoute();
        
    }
    draw(ctx: CanvasRenderingContext2D): void {
        const offsets: [number, number] = [
            this.calcImageXOffset() - this.imgWidth / 4, 
            this.calcImageYOffset() - this.imgHeight / 2
        ];
        ctx.drawImage(this.img, ...offsets, this.imgWidth / 2, this.imgHeight / 2);
        
    }

    async load(): Promise<void> {
        await this.img.onload;
    }

    calcImageXOffset(): number {
        let offset = Tile.hexMiddle[0];
        offset += this.x * Tile.hexXoffset;
        return offset;
    }

    calcImageYOffset(): number {
        let offset = Tile.hexMiddle[1];
        offset += this.y * Tile.hexHeight;
        offset += Math.abs(this.x * Tile.hexYoffset);
        return offset;
    }

    private getAssetRoute(): string {
        return '../../../assets/army/warrior1.png';
    }

}