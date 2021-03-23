import { CacheService } from "src/app/services/cache.service";
import { Drawable } from "../../core/drawable.abstract";
import { Game } from "../../game";
import { Army } from "../../game_models/army.game";
import { PlayerPacket } from "../../packets/player.packet";
import { UserPacket } from "../../packets/user.packet";
import { Button } from "../core/button.ui";
import { Window } from "../core/window.ui";
import { GUI } from "../GUI";

export class SelectedArmyOverviewWindow extends Window implements Drawable {

    private gui: GUI;
    private game: Game; 
    private army: Army;
    private cache: CacheService;
    private player: PlayerPacket | undefined;
    private user: UserPacket | undefined;

    private moveButton: Button;

    constructor(cache: CacheService, game: Game, gui: GUI, army: Army) {
        super(-300, 690, 250, 150, `${unescape(army.name)} (${army.x} | ${army.y})`, 4);
        super.goalX = 10;
        this.army = army;
        this.game = game;
        this.cache = cache;
        this.gui = gui;
        this.player = this.cache.getPlayerById(this.army.player_id);
        this.user = this.cache.getUserById(this.player?.user_id as string);
        this.moveButton = new Button(
            this.x + 10,
            this.y + 40,
            30,
            30,
            3,
            "../../../assets/ui/move.png"
        )
    }

    setArmy(army: Army): void {
        this.army.setSelected(false);
        this.army = army;
        super.title = `${unescape(army.name)} (${army.x} | ${army.y})`;
        this.player = this.cache.getPlayerById(this.army.player_id);
        this.user = this.cache.getUserById(this.player?.user_id as string);
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
        this.moveButton.x = this.x + 10;
        this.moveButton.y = this.y + 40;
        this.moveButton.draw(ctx);

    }

    handleBodyClick(x: number, y: number) {
        if (
            x > this.moveButton.x && 
            x < this.moveButton.x + this.moveButton.width && 
            y > this.moveButton.y && 
            y < this.moveButton.y + this.moveButton.height
        ) {
            this.game.moveArmy(this.army);
        }
    }

    animationCompleted(): void {
        if (this.x == this.originX && this.y == this.originY) {
            this.gui.armyUnselected();
        }
    }
}