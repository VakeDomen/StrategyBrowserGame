export class Player {
    
    name: string;
    playerNumber: number;
    playerOffset: number;

    constructor(name: string, playerNumber: number, totalPlayers: number) {
        this.name = name;
        this.playerNumber = playerNumber;
        this.playerOffset = playerNumber / (totalPlayers + 2)
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        const formerStyle = ctx.fillStyle;
        ctx.font = "30px Arial";
        ctx.fillStyle = '#ff6600';
        ctx.fillText(this.name, width * 0.04, (height + 1) * this.playerOffset);
        ctx.fillStyle = formerStyle;
        ctx.fill();
    }
}