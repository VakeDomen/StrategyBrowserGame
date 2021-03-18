export class Camera {
    x: number;
    y: number;

    goalX: number;
    goalY: number;

    maxStep: number = 50;

    constructor(x: number, y: number) {
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
            if (cameraSpeedLock && distToGoal > this.maxStep) {
                const ratio = this.maxStep / distToGoal;
                xStep = ratio * xStep;
                yStep = ratio * yStep;
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
}