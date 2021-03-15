export abstract class GameModel {
    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract update(): void;
}