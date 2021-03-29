import { Cache } from "src/app/services/cache.service";
import { ResourcePacket } from "../packets/resource.packet";
import { Window } from "../ui_models/core/window.ui";

export class Stat extends Window {
    
    icon: HTMLImageElement;
    stat: string;
    value: number;
    textWidth: number;

    constructor(stat: string, value: number, x: number, y: number, width?: number, height?: number) {
        super(x, y, 16, 16, '', 0);
        this.textWidth = width ? width : 50;
        this.icon = new Image();
        this.icon.src = Cache.getStatIcon(stat);
        this.stat = stat;
        this.value = value;
    }

    async load(): Promise<void> {
        await this.icon.onload;
    }
    
    drawBody(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(
            this.icon,
            this.x,
            this.y, 
            this.width,
            this.height
        );
        ctx.fillText(`${this.value}`, this.x + 16, this.y + 14, this.textWidth - 16);
        if (this.hovered) {
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(35, 206, 235, 0.9)';
            ctx.fillRect(this.hoverX as number + 20, this.hoverY as number, 80, 20)
            ctx.fillStyle = 'black';
            ctx.fillText(
                `${this.stat}`, 
                this.hoverX as number + 60, 
                this.hoverY as number + 17,
                80
            );
            ctx.textAlign = 'start';
        }
    };

    drawHeader() {}
    drawBackground() {}
    
}