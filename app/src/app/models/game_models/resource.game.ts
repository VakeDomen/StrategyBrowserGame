import { Cache } from "src/app/services/cache.service";
import { ResourcePacket } from "../packets/resource.packet";
import { Window } from "../ui_models/core/window.ui";

export class Resource extends Window {
    
    icon: HTMLImageElement;
    resource: ResourcePacket;

    constructor(x: number, y: number, resource: number, width?: number, height?: number) {
        super(x, y, width ? width : 16, height ? height : 16, '', 0);
        this.icon = new Image();
        this.icon.src = Cache.getResourceIcon(resource);
        this.resource = Cache.getResource(resource);
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
        if (this.hovered) {
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(35, 206, 235, 0.9)';
            ctx.fillRect(this.hoverX as number + 20, this.hoverY as number, 80, 20)
            ctx.fillStyle = 'black';
            ctx.fillText(
                `${this.resource ? this.resource.display_name : 'Population size'}`, 
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