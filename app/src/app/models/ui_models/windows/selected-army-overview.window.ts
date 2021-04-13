import { Cache } from "src/app/services/cache.service";
import { Army } from "../../game_models/army.game";
import { PlayerPacket } from "../../packets/player.packet";
import { UserPacket } from "../../packets/user.packet";
import { MoveArmyButton } from "../buttons/move-army.button";
import { ShowArmyPathButton } from "../buttons/show-army-path.button";
import { HideArmyPathButton } from "../buttons/hide-army-path.button";
import { Button } from "../core/button.ui";
import { Window } from "../core/window.ui";
import { ShowArmyInventoryButton } from "../buttons/show-inventory.button";
import { ShowArmyBattalionsButton } from "../buttons/show-army-battalions.button";
import { Stat } from "../../game_models/stat.game";
import { ToggleArmyBuildButton } from "../buttons/toggle-army-build.button";

export class SelectedArmyOverviewWindow extends Window {

    private player: PlayerPacket | undefined;
    private user: UserPacket | undefined;
    private army: Army | undefined;

    private moveButton: Button;
    private showPath: Button;
    private hidePath: Button;
    private showInventory: Button;
    private showBattalions: Button;
    private showBuildMenu: Button;

    private pop: Stat | undefined;
    private attack: Stat | undefined;
    private defense: Stat | undefined;
    private speed: Stat | undefined;
    private carry: Stat | undefined;
    private build: Stat | undefined;

    constructor() {
        super(-300, 740, 300, 150, `${unescape(Cache.selectedArmy?.name as string)} (${Cache.selectedArmy?.x} | ${Cache.selectedArmy?.y})`, 4);
        super.goalX = 10;
        this.player = Cache.getPlayerById(Cache.selectedArmy?.player_id as string);
        this.user = Cache.getUserById(this.player?.user_id as string);
        this.moveButton = new MoveArmyButton(this.x + 10, this.y + 40, 40, 40, Cache.selectedArmy as Army);
        this.showPath = new ShowArmyPathButton(this.x + 60, this.y + 40, 40, 40);
        this.hidePath = new HideArmyPathButton(this.x + 60, this.y + 40, 40, 40);
        this.showInventory = new ShowArmyInventoryButton(this.x + 110, this.y + 40, 40, 40);
        this.showBattalions = new ShowArmyBattalionsButton(this.x + 160, this.y + 40, 40, 40);
        this.showBuildMenu = new ToggleArmyBuildButton(this.x + 210, this.y + 40, 40, 40);
        this.army = Cache.selectedArmy;
        if (this.army) {
            this.pop = new Stat('size', this.army.size, this.x + 10, this.y + 3 + 40, 0);
            this.attack = new Stat('attack', this.army.attack, this.x + 10, this.y + 36 + 40, 0);
            this.defense = new Stat('defense', this.army.defense, this.x + 100, this.y + 36 + 40, 0);
            this.speed = new Stat('speed', this.army.speed, this.x + 200, this.y + 18 + 40, 0);
            this.carry = new Stat('carry', this.army.carry, this.x + 10, this.y + 18 + 40, 0);
            this.build = new Stat('build', this.army.build, this.x + 100, this.y + 18 + 40, 0);
        }
    }

    update(x: number, y: number): void {
        this.checkHover(x, y);
        if (Cache.selectedArmy) {
            this.goalX = 10;
            this.refresh()
        } else {
            this.goalX = this.originX;
            return;
        }
        if (Cache.selectedArmy != this.army) {
            this.army = Cache.selectedArmy;
            this.pop = new Stat('size', this.army.size, this.x + 10, this.y + 3 + 40, 0);
            this.attack = new Stat('attack', this.army.attack, this.x + 10, this.y + 36 + 40, 0);
            this.defense = new Stat('defense', this.army.defense, this.x + 100, this.y + 36 + 40, 0);
            this.speed = new Stat('speed', this.army.speed, this.x + 200, this.y + 18 + 40, 0);
            this.carry = new Stat('carry', this.army.carry, this.x + 10, this.y + 18 + 40, 0);
            this.build = new Stat('build', this.army.build, this.x + 100, this.y + 18 + 40, 0);
        }
        this.checkHover(x, y);
        this.moveButton.update(x, y);
        this.showPath.update(x, y);
        this.hidePath.update(x, y);
        this.showInventory.update(x, y);
        this.showBattalions.update(x, y);
        this.showBuildMenu.update(x, y);
        if (this.pop) this.pop.update(x, y);
        if (this.attack) this.attack.update(x, y);
        if (this.defense) this.defense.update(x, y);
        if (this.speed) this.speed.update(x, y);
        if (this.carry) this.carry.update(x, y);
        if (this.build) this.build.update(x, y);
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
        const clicks = [
            this.moveButton.handleClick(),
            this.showPath.handleClick(),
            this.hidePath.handleClick(),
            this.showInventory.handleClick(),
            this.showBattalions.handleClick(),
            this.showBuildMenu.handleClick(),
        ];
        return clicks.includes(true);
    }
          
    postAnimationStep() {
        if (Cache.selectedArmy) {
            if (this.pop) this.pop.setGoal(this.x + 10, this.y + 3 + 40);
            if (this.attack) this.attack.setGoal(this.x + 10, this.y + 36 + 40);
            if (this.defense) this.defense.setGoal(this.x + 100, this.y + 36 + 40);
            if (this.speed) this.speed.setGoal(this.x + 200, this.y + 18 + 40);
            if (this.carry) this.carry.setGoal(this.x + 10, this.y + 18 + 40);
            if (this.build) this.build.setGoal(this.x + 100, this.y + 18 + 40);
        }
    }

    drawActions(ctx: CanvasRenderingContext2D): void {
        if (Cache.selectedArmy?.player_id === Cache.getMe().id) {
            this.moveButton.x = this.x + 10;
            this.moveButton.y = this.y + 100;
            this.moveButton.draw(ctx);
            this.showPath.x = this.x + 60;
            this.showPath.y = this.y + 100;
            this.showPath.draw(ctx);
            this.hidePath.x = this.x + 60;
            this.hidePath.y = this.y + 100;
            this.hidePath.draw(ctx);
            this.showInventory.x = this.x + 110;
            this.showInventory.y = this.y + 100;
            this.showInventory.draw(ctx);
            this.showBattalions.x = this.x + 160;
            this.showBattalions.y = this.y + 100;
            this.showBattalions.draw(ctx);
            this.showBuildMenu.x = this.x + 210;
            this.showBuildMenu.y = this.y + 100;
            this.showBuildMenu.draw(ctx);
            
            if (this.pop) this.pop.draw(ctx);
            if (this.attack) this.attack.draw(ctx);
            if (this.defense) this.defense.draw(ctx);
            if (this.speed) this.speed.draw(ctx);
            if (this.carry) this.carry.draw(ctx);
            if (this.build) this.build.draw(ctx);
        }

    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            Cache.selectedArmy = undefined;
        }
    }
}