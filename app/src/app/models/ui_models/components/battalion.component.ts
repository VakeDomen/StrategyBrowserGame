import { Battalion } from "../../game_models/battalion.game";
import { Resource } from "../../game_models/resource.game";
import { Stat } from "../../game_models/stat.game";
import { Window } from "../core/window.ui";

export class BattalionUIComponent extends Window {
    
    private battalion: Battalion;
    private pop: Stat | undefined;
    private attack: Stat | undefined;
    private defense: Stat | undefined;
    private speed: Stat | undefined;
    private carry: Stat | undefined;
    private build: Stat | undefined;
    private armor: Resource | undefined;
    private wep2h: Resource | undefined;
    private wep1h: Resource | undefined;
    private offh: Resource | undefined;
    private horse: Resource | undefined;
    private cart: Resource | undefined;

    constructor(battalion: Battalion, x: number, y: number, width: number, height: number) {
        super(x, y, width, height, '', 4);
        this.battalion = battalion;
        if (battalion) {
            this.pop = new Stat('size', this.battalion.size, this.x + 10, this.y + 3, 0);
            this.attack = new Stat('attack', this.battalion.attack, this.x + 10, this.y + 36, 0);
            this.defense = new Stat('defense', this.battalion.defense, this.x + 100, this.y + 36, 0);
            this.speed = new Stat('speed', this.battalion.speed, this.x + 200, this.y + 18, 0);
            this.carry = new Stat('carry', this.battalion.carry, this.x + 10, this.y + 18, 0);
            this.build = new Stat('build', this.battalion.build, this.x + 100, this.y + 18, 0);

            if (battalion.ARMOR) this.armor = new Resource(this.x + 60, this.y + 5, battalion.ARMOR);
            if (battalion.WEAPON_2H) this.wep2h = new Resource(this.x + 80, this.y + 5, battalion.WEAPON_2H);
            if (battalion.WEAPON_1H) this.wep1h = new Resource(this.x + 80, this.y + 5, battalion.WEAPON_1H);
            if (battalion.OFF_HAND) this.offh = new Resource(this.x + 100, this.y + 5, battalion.OFF_HAND);
            if (battalion.horse) this.horse = new Resource(this.x + 120, this.y + 5, 6);
            if (battalion.cart) this.cart = new Resource(this.x + 140, this.y + 5, 5);
        }
    }  
    
    update(x: number, y: number) {
        if (this.battalion) {
            if (this.pop) this.pop.update(x, y);
            if (this.attack) this.attack.update(x, y);
            if (this.defense) this.defense.update(x, y);
            if (this.speed) this.speed.update(x, y);
            if (this.carry) this.carry.update(x, y);
            if (this.build) this.build.update(x, y);

            if (this.armor) this.armor.update(x, y);
            if (this.wep2h) this.wep2h.update(x, y);
            if (this.wep1h) this.wep1h.update(x, y);
            if (this.offh) this.offh.update(x, y);
            if (this.horse) this.horse.update(x, y);
            if (this.cart) this.cart.update(x, y);
        }
    }

    drawHeader() {}

    postAnimationStep() {
        if (this.battalion) {
            if (this.pop) this.pop.setGoal(this.x + 10, this.y + 3);
            if (this.attack) this.attack.setGoal(this.x + 10, this.y + 36);
            if (this.defense) this.defense.setGoal(this.x + 100, this.y + 36);
            if (this.speed) this.speed.setGoal(this.x + 200, this.y + 18);
            if (this.carry) this.carry.setGoal(this.x + 10, this.y + 18);
            if (this.build) this.build.setGoal(this.x + 100, this.y + 18);

            if (this.armor) this.armor.setGoal(this.x + 60, this.y + 3);
            if (this.wep2h) this.wep2h.setGoal(this.x + 80, this.y + 3);
            if (this.wep1h) this.wep1h.setGoal(this.x + 80, this.y + 3);
            if (this.offh) this.offh.setGoal(this.x + 100, this.y + 3);
            if (this.horse) this.horse.setGoal(this.x + 120, this.y + 3);
            if (this.cart) this.cart.setGoal(this.x + 140, this.y + 3);
        }
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        if (!this.battalion) {
            ctx.textAlign = 'center';
            ctx.fillText('Empty slot', this.x + this.width / 2, this.y + this.height / 2);
            ctx.textAlign = 'start';
        } else {
            if (this.pop) this.pop.draw(ctx);
            if (this.attack) this.attack.draw(ctx);
            if (this.defense) this.defense.draw(ctx);
            if (this.speed) this.speed.draw(ctx);
            if (this.carry) this.carry.draw(ctx);
            if (this.build) this.build.draw(ctx);
            // ctx.fillText(`${this.battalion.size}`, this.x + 25, this.y + 17, 30);
            if (this.armor) this.armor.draw(ctx);
            if (this.wep2h) this.wep2h.draw(ctx);
            if (this.wep1h) this.wep1h.draw(ctx);
            if (this.offh) this.offh.draw(ctx);
            if (this.horse) this.horse.draw(ctx);
            if (this.cart) this.cart.draw(ctx);
        }
    }
        
}