import { Cache } from "src/app/services/cache.service";
import { Drawable } from "../../core/drawable.abstract";
import { Window } from "../core/window.ui";

export class PlayerNameBanner implements Drawable {

    private x = 600;
    private y = 0;
    private width = 400;
    private height = 100;
    private hovered: boolean = false;
    private name: string;

    private img: HTMLImageElement;
    private colorBanners: HTMLImageElement[];
    
    constructor() {
        this.name = Cache.getUserById(Cache.getMyUserId())?.username ?? 'Unknown soldier';
        this.img = new Image();
        this.colorBanners = [];
        for (let i = 0 ; i < 5 ; i++) {
            this.colorBanners.push(new Image());
            this.colorBanners[i].src = `../../../assets/ui/banner${i}.png`;
        }
        this.img.src = '../../../assets/ui/player_name_banner.png'
    }
    
    handleClick(x: number, y: number): boolean {
        return this.hovered;
    }

    async load(): Promise<void> {
        await Promise.all([
            this.img.onload,
            this.colorBanners.map(async (b) => await b.onload),
        ]);
    }

    update(x: number, y: number) {
        this.hovered = x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(
            this.img,
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.drawImage(
            this.colorBanners[Cache.getMe().color ],
            this.x + 60,
            this.y + 27,
            35,
            35
        );
        
        const font = ctx.font;
        ctx.font = "bold 30px Arial"
        ctx.fillText(
            `${Cache.getUserById(Cache.getMyUserId())?.username}`, 
            this.x + 100,
            this.y + 55,
            250
        );
        ctx.font = font;
    }
}