import { Game } from "../game";

export class Camera {

    private game: Game;

    x: number;
    y: number;

    private goalX: number;
    private goalY: number;

    private maxStep: number = 50;
    private zoom: number;
    private jumpNextFrame: boolean = false;

    constructor(x: number, y: number, game: Game) {
        this.game = game;
        this.zoom = game.getZoom();
        this.x = x;
        this.y = y;
        this.goalX = x;
        this.goalY = y;
    }

    resetGoal(): void {
        this.goalX = this.x;
        this.goalY = this.y;
    }

    adjust(ctx: CanvasRenderingContext2D, cameraSpeedLock?: boolean): void {
        const distToGoal = Math.sqrt(Math.pow(this.goalX - this.x, 2) + Math.pow(this.goalY - this.y, 2));
        if (distToGoal > 0) {
            let xStep = this.goalX - this.x;
            let yStep = this.goalY - this.y;
            if (!this.jumpNextFrame && (cameraSpeedLock && distToGoal > this.maxStep)) {
                const ratio = this.maxStep / distToGoal;
                xStep = ratio * xStep;
                yStep = ratio * yStep;
            }
            if (this.jumpNextFrame) {
                this.jumpNextFrame = false;
            }
            ctx.translate( -xStep, -yStep);
            this.x += xStep;
            this.y += yStep;
        }
    }

    setGoal(x: number, y: number): void {
        this.goalX = x;
        this.goalY = y;
    }

    setZoom(zoom: number): void {
        this.x = zoom / this.zoom * this.x;
        this.y = zoom / this.zoom * this.y;
        this.jumpNextFrame = true;
        this.zoom = zoom;
    }

    pixelToCoordinate(x: number, y: number): [number, number] {
        return [
            ((x * this.zoom) + this.x - (800 * this.zoom)), 
            ((y * this.zoom) + this.y - (450 * this.zoom)) 
        ];
    }
}