import { Cache } from "src/app/services/cache.service";
import { Base } from "../../game_models/base.game";
import { Window } from "../core/window.ui";

export class BaseListWindow extends Window {

    private bases: Base[] | undefined;

    constructor(bases: Base[] | undefined) {
        super(1600, 60, 250, 500, `Base list (${bases ? bases.length : 0})`, 3);
        this.bases = bases;
    }
    update(x: number, y: number) {
        if (Cache.sideWindow != 'base') {
            this.goalX = this.originX;
            return;
        } else {
            if (!this.bases) {
                this.bases = Cache.getPlayerBases(Cache.getMe().id);
            }
            super.goalX = 1330;
        }
        this.checkHover(x, y);
    }

    drawBody(ctx: CanvasRenderingContext2D): void {
        if (!this.bases) {
            ctx.fillText(
                `You have no bases!`, 
                this.x + (Window.HEADER_START_WIDTH / 2) , 
                this.y + Window.HEADER_HEIGHT + 15,
                this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
            );
            return;
        }
        for (let i = 0 ; i < this.bases.length ; i++) {
            const base = this.bases[i];
            if (base == Cache.selectedBase) {
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
                `(${base.x} | ${base.y}) ${unescape(base.name)}`, 
                super.x + (Window.HEADER_START_WIDTH / 2), 
                super.y + Window.HEADER_HEIGHT + 15 + i * 20,
                super.width - Window.HEADER_START_WIDTH - (Window.HEADER_END_WIDTH / 2)
            );
        }
    }

    handleBodyClick(x: number, y: number): boolean {
        if (!this.bases) {
            return false;
        }
        for (let i = 0 ; i < this.bases.length ; i++) {
            const base = this.bases[i];
            if (
                super.hoverX &&
                super.hoverY &&
                super.hoverX > super.x + (Window.HEADER_START_WIDTH / 2) - 3 &&
                super.hoverY > super.y + Window.HEADER_HEIGHT + i * 20 &&
                super.hoverX < super.x + (Window.HEADER_START_WIDTH / 2) - 3 + super.width - Window.HEADER_END_WIDTH + 6 &&
                super.hoverY < super.y + Window.HEADER_HEIGHT + i * 20 + 20
            ) {
                Cache.selectedBase = base;
                return true;
            }
        }
        return false;
    } 

    onClose() {
        Cache.sideWindow = undefined;
    }

}