import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { Window } from "../core/window.ui";
import { GUI } from "../GUI";

export class ArmyListWindow extends Window {

    private armies: Army[] | undefined;
    private gui: GUI;
    private game: Game;

    constructor(armies: Army[] | undefined, gui: GUI, game: Game) {
        super(-300, 180, 250, 500, `Army list (${armies ? armies.length : 0})`, 4);
        super.goalX = 10;
        this.game = game;
        this.armies = armies;
        this.gui = gui;
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        if (!this.armies) {
            ctx.fillText(
                `You have no armies!`, 
                this.x + (Window.HEADER_START_WIDTH / 2) , 
                this.y + Window.HEADER_HEIGHT + 15,
                this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
            );
            return;
        }
        for (let i = 0 ; i < this.armies.length ; i++) {
            const army = this.armies[i];
            if (army.getSelected()) {
                const pre = ctx.fillStyle;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(
                    super.x + (Window.HEADER_START_WIDTH / 2) - 3, 
                    super.y + Window.HEADER_HEIGHT + i * 20,
                    super.width - Window.HEADER_END_WIDTH + 6,
                    20
                );
                ctx.fillStyle = pre;
            }
            if (super.isHovered) {
                if (
                    super.hoverX &&
                    super.hoverY &&
                    super.hoverX > super.x + (Window.HEADER_START_WIDTH / 2) - 3 &&
                    super.hoverY > super.y + Window.HEADER_HEIGHT + i * 20 &&
                    super.hoverX < super.x + (Window.HEADER_START_WIDTH / 2) - 3 + super.width - Window.HEADER_END_WIDTH + 6 &&
                    super.hoverY < super.y + Window.HEADER_HEIGHT + i * 20 + 20
                ) {
                    const pre = ctx.fillStyle;
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(
                        super.x + (Window.HEADER_START_WIDTH / 2) - 3, 
                        super.y + Window.HEADER_HEIGHT + i * 20,
                        super.width - Window.HEADER_END_WIDTH + 6,
                        20
                    );
                    ctx.fillStyle = pre;
                }
            }
            ctx.fillText(
                `(${army.x} | ${army.y}) ${unescape(army.name)}`, 
                super.x + (Window.HEADER_START_WIDTH / 2), 
                super.y + Window.HEADER_HEIGHT + 15 + i * 20,
                super.width - Window.HEADER_START_WIDTH - (Window.HEADER_END_WIDTH / 2)
            );
        }
    }

    handleBodyClick(x: number, y: number): void {
        if (!this.armies) {
            return;
        }
        console.log(`clicked on ${x} ${y}`);
        for (let i = 0 ; i < this.armies.length ; i++) {
            const army = this.armies[i];
            if (
                super.hoverX &&
                super.hoverY &&
                super.hoverX > super.x + (Window.HEADER_START_WIDTH / 2) - 3 &&
                super.hoverY > super.y + Window.HEADER_HEIGHT + i * 20 &&
                super.hoverX < super.x + (Window.HEADER_START_WIDTH / 2) - 3 + super.width - Window.HEADER_END_WIDTH + 6 &&
                super.hoverY < super.y + Window.HEADER_HEIGHT + i * 20 + 20
            ) {
               this.gui.armySelected(army);
               this.game.setSelectedArmy(army);
            }
        }
    } 

}