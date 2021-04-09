import { Battalion } from './battalion.game';
import { Drawable } from '../core/drawable.abstract';
import { Tile } from './tile.game';
import { Cache } from 'src/app/services/cache.service';
import { EventPacket } from '../packets/event.packet';
import { ArmyInventoryPacket } from '../packets/army-inventory.packet';
import { BattalionPacket } from '../packets/battalion.packet';
export class Army implements Drawable{
    id: string;
    player_id: string;
    x: number;
    y: number;
    name: string;
    battalions: Battalion[];
    inventory: ArmyInventoryPacket;

    size: number;
    attack: number;
    defense: number;
    speed: number;
    carry: number;
    build: number;

    displayInvnetory: boolean = false;
    displayBattalions: boolean = false;
    displayBuild: boolean = false;

    moveEvent: EventPacket | undefined;
    buildEvent: EventPacket | undefined;

    private _hovered: boolean = false;    
    private img: HTMLImageElement;
    private imgWidth: number = 212;
    private imgHeight: number = 218;
    
    private moveIcon: HTMLImageElement;
    private buildIcon: HTMLImageElement;
    private banner: HTMLImageElement;
    private bannerHover: HTMLImageElement;
    private colorBanner: HTMLImageElement;

    constructor(data: any) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
        this.battalions = data.battalions.map((bat: BattalionPacket) => new Battalion(bat));
        this.inventory = data.inventory;

        this.img = new Image();
        this.moveIcon = new Image();
        this.buildIcon = new Image();
        this.banner = new Image();
        this.bannerHover = new Image();
        this.colorBanner = new Image();
        const myColor = Cache.getPlayerById(this.player_id)?.color;
        this.colorBanner.src = `../../../assets/ui/banner${myColor ?? 1}.png`;
        if (this.player_id == Cache.getMe().id) {
            this.banner.src = `../../../assets/ui/black_banner1.png`;
            this.bannerHover.src = `../../../assets/ui/black_banner1_glow.png`;
        }
        this.img.src = this.getAssetRoute();
        this.moveIcon.src = '../../../assets/ui/move.png';
        this.buildIcon.src = '../../../assets/ui/buttons/build.png';

        this.size = this.calcSizeValue();
        this.attack = this.calcAttackValue();
        this.defense = this.calcDefenseValue();
        this.speed = this.calcSpeedValue();
        this.carry = this.calcCarryValue();
        this.build = this.calcBuildValue();
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
            const cx = offsets[0] + 95;
            const cy = offsets[1] + 45;
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
                offsets[0] + 79,
                offsets[1] + 29,
                30, 
                30
            );
            const timeLeft = Math.floor((this.moveEvent.trigger_time - new Date().getTime()) / 1000);
            if (timeLeft >= 0) {
                const displayTime = `${Math.floor(timeLeft / 3600)}:${Math.floor(timeLeft / 60)}:${timeLeft%60}`;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText(displayTime, offsets[0] + 95, offsets[1] + 75);
                ctx.textAlign = 'start';
            }
        }

        if (this.buildEvent) {
            ctx.save(); // save state
            ctx.fillStyle = 'rgba(35, 206, 235, 0.9)';
            const w = 32;
            const h = 32;
            const cx = offsets[0] + 95;
            const cy = offsets[1] + 45;
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
                this.buildIcon, 
                offsets[0] + 79,
                offsets[1] + 29,
                30, 
                30
            );
            const timeLeft = Math.floor((this.buildEvent.trigger_time - new Date().getTime()) / 1000);
            if (timeLeft >= 0) {
                const displayTime = `${Math.floor(timeLeft / 3600)}:${Math.floor(timeLeft / 60)}:${timeLeft%60}`;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText(displayTime, offsets[0] + 95, offsets[1] + 75);
                ctx.textAlign = 'start';
            }
        }

        // color banner

        ctx.fillRect(
            this.calcImageXOffset() - 70,
            this.calcImageYOffset() + 28 - this.imgHeight / 2,
            30,
            30
        );
        ctx.drawImage(
            this.colorBanner,
            this.calcImageXOffset() - 70,
            this.calcImageYOffset() + 28 - this.imgHeight / 2,
            30,
            30
        );
        if (this.player_id == Cache.getMe().id) {
            ctx.drawImage(
                this.hovered ? this.bannerHover : this.banner,
                this.calcImageXOffset() - 80,
                this.calcImageYOffset() - this.imgHeight  / 2,
                160,
                30
            );  
            
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            const font = ctx.font;
            ctx.font = "bold 17px Arial"
            ctx.fillText(
                `${unescape(this.name)}`, 
                this.calcImageXOffset(),
                this.calcImageYOffset() + 16 - this.imgHeight / 2,
                90
            );
            ctx.font = font;
            ctx.textAlign = 'start';
            ctx.fillStyle = 'black';
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
        if (this.hovered) {
            Cache.selectedArmy == this;
            return true;
        }
        return false;
    }
    
    public get hovered(): boolean {
        return this._hovered;
    }
    public set hovered(value: boolean) {
        this._hovered = value;
    }

    calcAttackValue(): number {
        return this.battalions.map((battalion: Battalion) => battalion.attack).reduce((sum: number, item: number) => sum += item, 0);
    }

    calcDefenseValue(): number {
        return this.battalions.map((battalion: Battalion) => battalion.defense).reduce((sum: number, item: number) => sum += item, 0);
    }
    
    calcSpeedValue(): number {
        return Math.min(...this.battalions.map((battalion: Battalion) => battalion.speed));
    }

    calcCarryValue(): number {
        return this.battalions.map((battalion: Battalion) => battalion.carry).reduce((sum: number, item: number) => sum += item, 0);
    }

    calcBuildValue(): number {
        return this.battalions.map((battalion: Battalion) => battalion.build).reduce((sum: number, item: number) => sum += item, 0);
    }
    
    calcSizeValue(): number {
        return this.battalions.map((battalion: Battalion) => battalion.size).reduce((sum: number, item: number) => sum += item, 0);
    }
}