export abstract class Drawable {
    abstract update(x: number, y: number): void;
    abstract draw(ctx: CanvasRenderingContext2D): void;
    // abstract checkHover(x: number, y: number): boolean;
    abstract handleClick(x: number, y: number): boolean;
    abstract load(): Promise<void>;
}