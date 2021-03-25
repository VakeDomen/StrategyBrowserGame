import { Cache } from "src/app/services/cache.service";
import { Army } from "../../game_models/army.game";
import { PlayerPacket } from "../../packets/player.packet";
import { UserPacket } from "../../packets/user.packet";
import { MoveArmyButton } from "../buttons/move-army.button";
import { ShowArmyPathButton } from "../buttons/show-army-path.button";
import { HideArmyPathButton } from "../buttons/hide-army-path.button";
import { Button } from "../core/button.ui";
import { Window } from "../core/window.ui";

export class SelectedArmyOverviewWindow extends Window {

    private player: PlayerPacket | undefined;
    private user: UserPacket | undefined;

    private moveButton: Button;
    private showPath: Button;
    private hidePath: Button;

    constructor() {
        super(-250, 690, 250, 150, `${unescape(Cache.selectedArmy?.name as string)} (${Cache.selectedArmy?.x} | ${Cache.selectedArmy?.y})`, 4);
        super.goalX = 10;
        this.player = Cache.getPlayerById(Cache.selectedArmy?.player_id as string);
        this.user = Cache.getUserById(this.player?.user_id as string);
        this.moveButton = new MoveArmyButton(this.x + 10, this.y + 40, 40, 40, Cache.selectedArmy as Army);
        this.showPath = new ShowArmyPathButton(this.x + 50, this.y + 40, 40, 40);
        this.hidePath = new HideArmyPathButton(this.x + 50, this.y + 40, 40, 40);
    }

    update(x: number, y: number): void {
        if (Cache.selectedArmy) {
            this.goalX = 10;
            this.refresh()
        } else {
            this.goalX = this.originX;
        }
        this.checkHover(x, y);
        this.moveButton.update(x, y);
        this.showPath.update(x, y);
        this.hidePath.update(x, y);
    }

    onClose(): void {
        Cache.selectedArmy = undefined;
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

    handleBodyClick(x: number, y: number) {
        this.moveButton.handleClick();
        this.showPath.handleClick();
        this.hidePath.handleClick();
    }
            

    drawActions(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedArmy?.player_id === Cache.getMe().id) {
            this.moveButton.x = this.x + 10;
            this.moveButton.y = this.y + 40;
            this.moveButton.draw(ctx);
            this.showPath.x = this.x + 50;
            this.showPath.y = this.y + 40;
            this.showPath.draw(ctx);
            this.hidePath.x = this.x + 50;
            this.hidePath.y = this.y + 40;
            this.hidePath.draw(ctx);
        }

    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            Cache.selectedArmy = undefined;
        }
    }
}