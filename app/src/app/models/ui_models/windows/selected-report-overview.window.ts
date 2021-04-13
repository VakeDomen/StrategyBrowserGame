import { Cache } from "src/app/services/cache.service";
import { Army } from "../../game_models/army.game";
import { Battalion } from "../../game_models/battalion.game";
import { Tile } from "../../game_models/tile.game";
import { PlayerPacket } from "../../packets/player.packet";
import { ReportPacket } from "../../packets/report.packet";
import { UserPacket } from "../../packets/user.packet";
import { BattalionUIComponent } from "../components/battalion.component";
import { Window } from "../core/window.ui";

export class SelectedReportOverviewWindow extends Window {

    report: ReportPacket | undefined;
    // army battle report
    private attUser: UserPacket | undefined;
    private defUser: UserPacket | undefined;
    private location: Tile | undefined;
    private attacker: [Army, Army] | undefined;
    private defender: [Army, Army] | undefined;
    private attackerBattalionComponents: BattalionUIComponent[] | undefined;
    private defenderBattalionComponents: BattalionUIComponent[] | undefined;

    constructor() {
        super(550, 900, 500, 500, `${Cache.selectedReport?.report_type}`, 2);
        if (Cache.selectedReport) {
            this.parseReport(Cache.selectedReport);
        }
    }

    private parseReport(report: ReportPacket) {
        this.report = report;
        this.title = `${report.report_type}`;
        if (report.report_type == 'ARMY_FIELD_BATTLE') {
            this.attacker = [
                new Army(JSON.parse(report.body).preInitiator), 
                new Army(JSON.parse(report.body).postInitiator),
            ];
            this.defender = [
                new Army(JSON.parse(report.body).preDefender), 
                new Army(JSON.parse(report.body).postDefender),
            ];
            this.location = Cache.getTile(this.attacker[0].x, this.attacker[0].y);
            this.attUser = Cache.getUserById((Cache.getPlayerById(this.attacker[0].player_id) as PlayerPacket).id);
            this.defUser = Cache.getUserById((Cache.getPlayerById(this.defender[0].player_id) as PlayerPacket).id);
            this.attackerBattalionComponents = [];
            this.defenderBattalionComponents = [];
            for (let i = 0 ; i < 5 ; i++) {
                let b = this.attacker[0].battalions[i];
                if (this.attacker[1].size > 0) {
                    b = this.findBattalionRemainig(i, this.attacker[0], this.attacker[1]) as Battalion;
                }
                const bat = new BattalionUIComponent(
                    b,
                    super.x + (Window.HEADER_START_WIDTH),
                    super.y + 65 + 60 * i, 
                    200,
                    50
                );
                bat.setIsDead(this.attacker[0].battalions[i] && this.attacker[0].battalions[i] == b);
                this.attackerBattalionComponents.push(bat);
            }
            for (let i = 0 ; i < 5 ; i++) {
                let b = this.defender[0].battalions[i];
                if (this.defender[1].size > 0) {
                    b = this.findBattalionRemainig(i, this.defender[0], this.defender[1]) as Battalion;
                }
                const bat = new BattalionUIComponent(
                    b,
                    super.x + (Window.HEADER_START_WIDTH) + 250,
                    super.y + 65 + 60 * i, 
                    200,
                    50
                );
                bat.setIsDead(this.defender[0].battalions[i] && this.defender[0].battalions[i] == b);
                this.defenderBattalionComponents.push(bat);
            }
        }
    }

    private findBattalionRemainig(i: number, pre: Army, post: Army) {
        const reference = pre.battalions[i];
        if (!reference) {
            return undefined;
        }
        for (const bat of post.battalions) {
            if (bat && reference.id == bat.id) {
                return bat;
            }
        }
        return undefined;
    }

    handleBodyClick() {
        return !!Cache.selectedReport && this.hovered;
    }

    update(x: number, y: number) {
        if (!Cache.selectedReport) {
            this.goalY = this.originY;
            return;
        } else {
            this.goalY = 200;
            if (Cache.selectedReport.id != this.report?.id) {
                this.parseReport(Cache.selectedReport);
            }
        }
        this.checkHover(x,y);
        for (const b of this.attackerBattalionComponents ?? []) {
            b.update(x, y);
        }
        for (const b of this.defenderBattalionComponents ?? []) {
            b.update(x, y);
        }
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        if (!Cache.selectedReport) {
            return;
        }
        switch (Cache.selectedReport.report_type) {
            case 'ARMY_FIELD_BATTLE':
                this.displayArmyfieldBattleReport(ctx);
                break;
        
            default:
                break;
        }
    }
    displayArmyfieldBattleReport(ctx: CanvasRenderingContext2D) {
        if (!this.attacker || !this.defender) {
            return
        }
        const preFont = ctx.font;
        ctx.fillText(
            `ATTACKER ${this.attUser?.username}: ${unescape(this.attacker[0].name)}`, 
            super.x + (Window.HEADER_START_WIDTH), 
            super.y + Window.HEADER_HEIGHT + 35,
            200
        );
        ctx.fillText(
            `DEFENDER ${this.attUser?.username}: ${unescape(this.defender[0].name)}`, 
            super.x + (Window.HEADER_START_WIDTH) + 250, 
            super.y + Window.HEADER_HEIGHT + 35,
            200
        );

        ctx.fillText(
            `LOCATION: `, 
            super.x + (Window.HEADER_START_WIDTH), 
            super.y + Window.HEADER_HEIGHT + 15,
            170
        );
        ctx.font = 'bold 7pt';
        ctx.strokeText(
            `(${this.location?.x} | ${this.location?.y}) ${Cache.getTileType(this.location?.tile_type as number)?.tag}`, 
            super.x + (Window.HEADER_START_WIDTH) + 80, 
            super.y + Window.HEADER_HEIGHT + 15,
            200
        );
        for (const b of this.attackerBattalionComponents ?? []) {
            b.draw(ctx);
        }
        for (const b of this.defenderBattalionComponents ?? []) {
            b.draw(ctx);
        }
        ctx.font = preFont;
    }

    postAnimationStep() {
        if (this.attackerBattalionComponents && this.defenderBattalionComponents) {
            for (let i = 0 ; i < 5 ; i++) {
                const bat = this.attackerBattalionComponents[i];
                bat.goalY = super.y + 65 + 60 * i;
            }
            for (let i = 0 ; i < 5 ; i++) {
                const bat = this.defenderBattalionComponents[i];
                bat.goalY = super.y + 65 + 60 * i;
            }
        }
    }

    onClose() {
        Cache.selectedReport = undefined;
    }
}