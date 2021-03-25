import { Battalion } from './battalion.game';
import { Drawable } from '../core/drawable.abstract';
import { Tile } from './tile.game';
import { Cache } from 'src/app/services/cache.service';
import { EventPacket } from '../packets/event.packet';
export class Army implements Drawable{
    id: string;
    player_id: string;
    x: number;
    y: number;
    name: string;
    battalions: Battalion[];

    moveEvent: EventPacket | undefined;

    private _hovered: boolean = false;    
    private img: HTMLImageElement;
    private imgWidth: number = 212;
    private imgHeight: number = 218;
    
    private moveIcon: HTMLImageElement;

    constructor(data: any) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
        this.battalions = [];

        this.img = new Image();
        this.moveIcon = new Image();
        this.img.src = this.getAssetRoute();
        this.moveIcon.src = '../../../assets/ui/move.png';
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
            ctx.save(); // save state
            ctx.fillStyle = 'white';
            if (this.hovered && Cache.selectedArmy != this) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            }
            const w = 80;
            const h = 28;
            const cx = offsets[0] + this.imgWidth / 4;
            const cy = offsets[1] + this.imgHeight / 2;
            ctx.beginPath();
            var lx = cx - w/2,
                rx = cx + w/2,
                ty = cy - h/2,
                by = cy + h/2;
            var magic = 0.551784;
            var xmagic = magic*w/2;
            var ymagic = h*magic/2;
            ctx.moveTo(cx,ty);
            ctx.bezierCurveTo(cx+xmagic,ty,rx,cy-ymagic,rx,cy);
            ctx.bezierCurveTo(rx,cy+ymagic,cx+xmagic,by,cx,by);
            ctx.bezierCurveTo(cx-xmagic,by,lx,cy+ymagic,lx,cy);
            ctx.bezierCurveTo(lx,cy-ymagic,cx-xmagic,ty,cx,ty);
            ctx.fill();
            ctx.restore(); // restore to original state
        }

        ctx.drawImage(
            this.img, 
            ...offsets, 
            this.imgWidth / 2, 
            this.imgHeight / 2
        );

        if (this.moveEvent) {
            ctx.save(); // save state
            ctx.fillStyle = 'rgba(35, 206, 235, 0.9)';
            const w = 32;
            const h = 32;
            const cx = offsets[0] + 16;
            const cy = offsets[1] + 16;
            ctx.beginPath();
            var lx = cx - w/2,
                rx = cx + w/2,
                ty = cy - h/2,
                by = cy + h/2;
            var magic = 0.551784;
            var xmagic = magic*w/2;
            var ymagic = h*magic/2;
            ctx.moveTo(cx,ty);
            ctx.bezierCurveTo(cx+xmagic,ty,rx,cy-ymagic,rx,cy);
            ctx.bezierCurveTo(rx,cy+ymagic,cx+xmagic,by,cx,by);
            ctx.bezierCurveTo(cx-xmagic,by,lx,cy+ymagic,lx,cy);
            ctx.bezierCurveTo(lx,cy-ymagic,cx-xmagic,ty,cx,ty);
            ctx.fill();
            ctx.restore(); // restore to original state
            ctx.drawImage(
                this.moveIcon, 
                ...offsets, 
                30, 
                30
            );
            const timeLeft = Math.floor((this.moveEvent.trigger_time - new Date().getTime()) / 1000);
            const displayTime = `${Math.floor(timeLeft / 3600)}:${Math.floor(timeLeft / 60)}:${timeLeft%60}`;
            ctx.fillStyle = 'black';
            ctx.fillText(displayTime, offsets[0], offsets[1] + 40);
        }
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