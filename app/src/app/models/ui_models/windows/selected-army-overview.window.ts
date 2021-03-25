import { Cache } from "src/app/services/cache.service";
import { Drawable } from "../../core/drawable.abstract";
import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { PlayerPacket } from "../../packets/player.packet";
import { UserPacket } from "../../packets/user.packet";
import { MoveArmyButton } from "../buttons/move-army.button";
import { Button } from "../core/button.ui";
import { Window } from "../core/window.ui";
import { GUI } from "../GUI";

export class SelectedArmyOverviewWindow extends Window implements Drawable {

    private gui: GUI;
    private player: PlayerPacket | undefined;
    private user: UserPacket | undefined;

    private moveButton: Button;

    constructor(gui: GUI) {
        super(-300, 690, 250, 150, `${unescape(Cache.selectedArmy?.name as string)} (${Cache.selectedArmy?.x} | ${Cache.selectedArmy?.y})`, 4);
        super.goalX = 10;
        this.gui = gui;
        this.player = Cache.getPlayerById(Cache.selectedArmy?.player_id as string);
        this.user = Cache.getUserById(this.player?.user_id as string);
        this.moveButton = new MoveArmyButton(this.x + 10, this.y + 40, 40, 40, Cache.selectedArmy as Army);
    }

    refresh(): void {
        super.title = `${unescape(Cache.selectedArmy?.name as string)} (${Cache.selectedArmy?.x} | ${Cache.selectedArmy?.y})`;
        this.player = Cache.getPlayerById(Cache.selectedArmy?.player_id as string);
        this.user = Cache.getUserById(this.player?.user_id as string);
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        ctx.fillText(
            `Player: `, 
            this.x + (Window.HEADER_START_WIDTH / 2) , 
            this.y + Window.HEADER_HEIGHT + 15,
            this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
        );
        ctx.fillText(
            `${this.user?.username}`, 
            this.x + (Window.HEADER_START_WIDTH / 2) + 50, 
            this.y + Window.HEADER_HEIGHT + 15,
            this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
        );
        this.drawActions(ctx);

    }

    drawActions(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedArmy?.player_id === Cache.getMe().id) {
            this.moveButton.x = this.x + 10;
            this.moveButton.y = this.y + 40;
            this.moveButton.draw(ctx);
        }

    }

    checkBodyHover(x: number, y: number): void {
        this.moveButton.checkHover(x, y);
    }

    handleBodyClick(x: number, y: number): void {
        if (this.moveButton.checkHover(x, y)) {
            this.moveButton.handleClick();
        }
    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            this.gui.armyUnselected();
        }
    }
}