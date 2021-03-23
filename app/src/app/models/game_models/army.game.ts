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

    private isHovered: boolean = false;
    private isSelected: boolean = false;
    
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
        if (this.isSelected) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(
                offsets[0] + this.imgWidth / 4,
                offsets[1] + this.imgHeight / 2,
                15, 
                45, 
                Math.PI / 2, 
                0, 
                2 * Math.PI
            );
            ctx.fill();
            ctx.fillStyle = 'black';
        }

        ctx.drawImage(
            this.img, 
            ...offsets, 
            this.imgWidth / 2, 
            this.imgHeight / 2
        );
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

    isPointOnArmy(x: number, y: number): boolean {
        return x > this.calcImageXOffset() - this.imgWidth / 4 && 
            x < this.calcImageXOffset() - this.imgWidth / 4  + this.imgWidth / 2 &&
            y > this.calcImageYOffset() - this.imgHeight / 2 && 
            y < this.calcImageYOffset() - this.imgHeight / 2 + this.imgHeight / 2;
    }

    setSelected(b: boolean): void {
        this.isSelected = b;
    }
    setHovered(b: boolean): void {
        this.isHovered = b;
    }

    getSelected(): boolean {
        return this.isSelected;
    }
}