import { Drawable } from "../core/drawable.abstract";

export class LoadingSpinner implements Drawable {

    canvas: any;
    animationStep = 0;

    constructor(canvas: any) {
        this.canvas = canvas;
    }
    protected checkHover(x: number, y: number): boolean {
        return false;
    }

    handleClick(x: number, y: number): boolean {
        return false;
    }

    update(x: number, y: number): void {}

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        // ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        ctx.translate(this.canvas.nativeElement.width / 2, this.canvas.nativeElement.height / 2);
        ctx.scale(0.4, 0.4);
        ctx.rotate(-Math.PI / 2);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        var step = this.animationStep;
        ctx.fillStyle = "black";
        ctx.save();
        ctx.rotate(step * Math.PI / 30);
        ctx.strokeStyle = "#33ccff";
        ctx.fillStyle = "#33ccff";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(68, 0);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'gray';
        ctx.arc(0, 0, 80, 0, Math.PI * 2, true);
        ctx.restore();
        this.animationStep += 1;
    }
}