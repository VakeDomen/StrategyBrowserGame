import { Battalion } from './battalion.game';
import { Drawable } from '../core/drawable.abstract';
import { Tile } from './tile.game';
import { Cache } from 'src/app/services/cache.service';
export class Army implements Drawable{
    id: string;
    player_id: string;
    x: number;
    y: number;
    name: string;
    battalions: Battalion[];

    private _hovered: boolean = false;    
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
    update(x: number, y: number): void {
        this.checkHover(x, y);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const offsets: [number, number] = [
            this.calcImageXOffset() - this.imgWidth / 4, 
            this.calcImageYOffset() - this.imgHeight / 2
        ];
        if (Cache.selectedArmy == this || this.hovered) {
            ctx.fillStyle = 'white';
            if (this.hovered && Cache.selectedArmy != this) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            }
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

    checkHover(x: number, y: number): boolean {
        this.hovered = x > this.calcImageXOffset() - this.imgWidth / 4 && 
            x < this.calcImageXOffset() - this.imgWidth / 4  + this.imgWidth / 2 &&
            y > this.calcImageYOffset() - this.imgHeight / 2 && 
            y < this.calcImageYOffset() - this.imgHeight / 2 + this.imgHeight / 2;
        return this.hovered;
    }

    getSelected(): boolean {
        return Cache.selectedArmy == this;
    }

    handleClick(x: number, y: number): boolean {
        return this.hovered
    }
    
    public get hovered(): boolean {
        return this._hovered;
    }
    public set hovered(value: boolean) {
        this._hovered = value;
    }
}