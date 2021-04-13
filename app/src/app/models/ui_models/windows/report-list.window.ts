import { Cache } from "src/app/services/cache.service";
import { Base } from "../../game_models/base.game";
import { Window } from "../core/window.ui";

export class ReportListWindow extends Window {

    constructor() {
        super(1600, 60, 250, 500, `Report list (unread: ${Cache.unreadReports})`, 2);
    }

    update(x: number, y: number) {
        if (Cache.sideWindow != 'reports') {
            this.goalX = this.originX;
            return;
        } else {
            super.goalX = 1330;
            this.title = `Report list (${Cache.unreadReports})`;
        }
        this.checkHover(x, y);
    }

    drawBody(ctx: CanvasRenderingContext2D): void {

        if (!Cache.getReports()) {
            ctx.fillText(
                `You have no reports!`, 
                this.x + (Window.HEADER_START_WIDTH / 2) , 
                this.y + Window.HEADER_HEIGHT + 15,
                this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
            );
            return;
        }
        for (let i = 0 ; i < Cache.getReports().length ; i++) {
            const report = Cache.getReports()[i];
            if (report == Cache.selectedReport) {
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
            if (!report.report_read) {
                const pre = ctx.strokeStyle;
                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                ctx.strokeRect(
                    super.x + (Window.HEADER_START_WIDTH / 2) - 3, 
                    super.y + Window.HEADER_HEIGHT + i * 20,
                    super.width - Window.HEADER_END_WIDTH + 6,
                    20
                );
                ctx.strokeStyle = pre;
            }
            if (super.hovered) {
                if (
                    super.hoverX &&
                    super.hoverY &&
                    super.hoverX > super.x + (Window.HEADER_START_WIDTH / 2) - 3 &&
                    super.hoverX < super.x + (Window.HEADER_START_WIDTH / 2) - 3 + super.width - Window.HEADER_END_WIDTH + 6 &&
                    super.hoverY > super.y + Window.HEADER_HEIGHT + i * 20 &&
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
                `${report.report_type}`, 
                super.x + (Window.HEADER_START_WIDTH / 2), 
                super.y + Window.HEADER_HEIGHT + 15 + i * 20,
                super.width - Window.HEADER_START_WIDTH - (Window.HEADER_END_WIDTH / 2)
            );
        }
    }

    handleBodyClick(x: number, y: number): boolean {
        if (!Cache.getReports()) {
            return false;
        }
        for (let i = 0 ; i < Cache.getReports().length ; i++) {
            const report = Cache.getReports()[i];
            if (
                super.hoverX &&
                super.hoverY &&
                super.hoverX > super.x + (Window.HEADER_START_WIDTH / 2) - 3 &&
                super.hoverY > super.y + Window.HEADER_HEIGHT + i * 20 &&
                super.hoverX < super.x + (Window.HEADER_START_WIDTH / 2) - 3 + super.width - Window.HEADER_END_WIDTH + 6 &&
                super.hoverY < super.y + Window.HEADER_HEIGHT + i * 20 + 20
            ) {
                Cache.selectedReport = report;
                return true;
            }
        }
        return false;
    } 

    onClose() {
        Cache.sideWindow = undefined;
    }
}