import { Cache } from "src/app/services/cache.service";
import { Base } from "../../game_models/base.game";
import { PlayerPacket } from "../../packets/player.packet";
import { UserPacket } from "../../packets/user.packet";
import { Window } from "../core/window.ui";
import { Stat } from "../../game_models/stat.game";

export class SelectedBaseOverviewWindow extends Window {

    private player: PlayerPacket | undefined;
    private user: UserPacket | undefined;
    private base: Base | undefined;
    private pop: Stat | undefined;
    private defense: Stat | undefined;
    private speed: Stat | undefined;


    constructor() {
        super(-300, 740, 300, 150, `${unescape(Cache.selectedBase?.name as string)} (${Cache.selectedBase?.x} | ${Cache.selectedBase?.y})`, 3);
        super.goalX = 10;
        this.player = Cache.getPlayerById(Cache.selectedBase?.player_id as string);
        this.user = Cache.getUserById(this.player?.user_id as string);
        this.base = Cache.selectedBase;
        if (this.base) {
            this.pop = new Stat('size', this.base.size, this.x + 10, this.y + 3 + 50, 0);
            this.defense = new Stat('defense', this.base.defense, this.x + 110, this.y + 3 + 50, 0);
            this.speed = new Stat('speed', this.base.speed, this.x + 200, this.y + 3 + 50, 0);
        }
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        if (Cache.selectedBase) {
            this.goalX = 10;
            this.refresh()
        } else {
            this.goalX = this.originX;
            return;
        }
        if (Cache.selectedBase != this.base) {
            this.base = Cache.selectedBase;
            this.base?.calcStats();
            this.pop = new Stat('size', this.base.size, this.x + 10, this.y + 3 + 50, 0);
            this.defense = new Stat('defense', 100 + this.base.defense, this.x + 110, this.y + 3 + 50, 0, true);
            this.speed = new Stat('speed', 100 + this.base.speed, this.x + 200, this.y + 3 + 50, 0, true);
        }
        this.checkHover(x, y); 
        if (this.pop) this.pop.update(x, y);
        if (this.defense) this.defense.update(x, y);
        if (this.speed) this.speed.update(x, y);
    }

    onClose(): void {
        Cache.selectedBase = undefined;
    }

    refresh(): void {
        super.title = `${unescape(Cache.selectedBase?.name as string)} (${Cache.selectedBase?.x} | ${Cache.selectedBase?.y})`;
        this.player = Cache.getPlayerById(Cache.selectedBase?.player_id as string);
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
        ctx.fillText(
            `Type: `, 
            this.x + (Window.HEADER_START_WIDTH / 2) , 
            this.y + Window.HEADER_HEIGHT + 30,
            this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
        );
        ctx.fillText(
            `${Cache.getTile(this.base?.x as number, this.base?.y as number)?.tag} ${Cache.getBaseType(this.base?.base_type as number)?.display_name}`, 
            this.x + (Window.HEADER_START_WIDTH / 2) + 50, 
            this.y + Window.HEADER_HEIGHT + 30,
            this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
        );
        this.drawActions(ctx);
    }
          
    postAnimationStep() {
        if (Cache.selectedBase) {
            if (this.pop) this.pop.setGoal(this.x + 10, this.y + 3 + 50);
            if (this.defense) this.defense.setGoal(this.x + 110, this.y + 3 + 50);
            if (this.speed) this.speed.setGoal(this.x + 200, this.y + 3 + 50);
        }
    }

    drawActions(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedBase?.player_id === Cache.getMe().id) {
            if (this.pop) this.pop.draw(ctx);
            if (this.defense) this.defense.draw(ctx);
            if (this.speed) this.speed.draw(ctx);
        }

    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            Cache.selectedBase = undefined;
        }
    }
}