import { Drawable } from "../../core/drawable.abstract";

export abstract class Button implements Drawable {
    
    abstract icon: HTMLImageElement | undefined;
    abstract bg: HTMLImageElement;
    abstract bghover: HTMLImageElement;
    
    
    draw(ctx: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }
    abstract checkHover(x: number, y: number): void;

}