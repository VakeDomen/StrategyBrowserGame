import { Cache } from "src/app/services/cache.service";
import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { BasePacket } from "../packets/base.packet";
import { TileTypePacket } from "../packets/tile-type.packet";
import { TilePacket } from "../packets/tile.packet";

export class Tile implements Drawable {
    // pixel coordinates of hex corners in the image
    //     1   2
    // 0           3
    //     5   4
    public static hexBorders: [number, number][]= [
        [150, 342],
        [203, 297],
        [308, 297],
        [360, 342],
        [308, 388],
        [203, 388],
    ];
    // public static hexBorders: [number, number][]= [
    //     [63, 156],
    //     [94, 124],
    //     [162, 124],
    //     [194, 156],
    //     [162, 188],
    //     [94, 188],
    // ];
    public static hexMiddle: [number, number] = [255, 342];
    // public static hexMiddle: [number, number] = [128, 128];
    public static hexWidth: number = Tile.hexBorders[3][0] - Tile.hexBorders[0][0];
    public static hexHeight: number = Tile.hexBorders[5][1] - Tile.hexBorders[1][1]; 
    public static hexXoffset: number = Tile.hexBorders[2][0] - Tile.hexBorders[0][0];
    public static hexYoffset: number = Tile.hexBorders[1][1] - Tile.hexBorders[0][1];

    private img: HTMLImageElement;
    private banner: HTMLImageElement;
    private bannerHover: HTMLImageElement;
    private colorBanner: HTMLImageElement;
    private visible: boolean = false;
    
    id: string;
    game_id: string;
    x: number;
    y: number;
    tile_type: number;
    favorable_terrain_level: number;
    orientation: number;
    base: string | null;
    hovered: boolean;
    transparent: boolean;
    tag: string;
    speed: number;
    food: number;
    wood: number;
    stone: number;
    ore: number;
    defense: number;


    constructor(tile: TilePacket) {
        this.id = tile.id;
        this.game_id = tile.game_id;
        this.x = tile.x;
        this.y = tile.y;
        this.tile_type = tile.tile_type;
        this.favorable_terrain_level = tile.favorable_terrain_level;
        this.orientation = tile.orientation;
        this.base = tile.base;
        this.hovered = false;
        this.transparent = false;
        this.img = new Image();
        this.banner = new Image();
        this.bannerHover = new Image();
        this.colorBanner = new Image();
        if (this.base) {
            const base = Cache.getBase(this.base);
            if (base) {
                const myColor = Cache.getPlayerById(base?.player_id as string)?.color ?? 1;
                this.banner.src = `../../../assets/ui/black_banner1.png`;
                this.bannerHover.src = `../../../assets/ui/black_banner1_glow.png`;
                this.colorBanner.src = `../../../assets/ui/banner${myColor}.png`;
            }
        }
        this.img.src = this.getAssetRoute(tile.tile_type, tile.orientation);
        this.tag = (Cache.getTileType(this.tile_type) as TileTypePacket).tag;
        this.speed = Math.max(-90, (Cache.getTileType(this.tile_type) as TileTypePacket).speed + this.favorable_terrain_level * 5);
        this.food = Math.max(0, (Cache.getTileType(this.tile_type) as TileTypePacket).food + this.favorable_terrain_level * 5);
        this.wood = Math.max(0, (Cache.getTileType(this.tile_type) as TileTypePacket).wood + this.favorable_terrain_level * 5);
        this.stone = Math.max(0, (Cache.getTileType(this.tile_type) as TileTypePacket).stone + this.favorable_terrain_level * 5);
        this.ore = Math.max(0, (Cache.getTileType(this.tile_type) as TileTypePacket).ore + this.favorable_terrain_level * 5);
        this.defense = (Cache.getTileType(this.tile_type) as TileTypePacket).defense + this.favorable_terrain_level * 5;
        Cache.saveTile(this);
    }
    update(x: number, y: number): void {
        this.visible = Cache.getCamera().inFrame(this);
    }


    handleClick(x: number, y: number): boolean {
        return this.hovered;
    }
    
    async setBase(base: BasePacket): Promise<void> {
        this.base = base.id;
        this.img = new Image();
        this.img.src = this.getAssetRoute(this.tile_type, this.orientation);
        const myColor = Cache.getPlayerById(base?.player_id as string)?.color ?? 1;
        this.banner.src = `../../../assets/ui/black_banner1.png`;
        this.bannerHover.src = `../../../assets/ui/black_banner1_glow.png`;
        this.colorBanner.src = `../../../assets/ui/banner${myColor}.png`;
        await Promise.all([
            this.img.onload,
            this.banner.onload,
            this.bannerHover.onload,
            this.colorBanner.onload,
        ]);

    }
    

    async load(): Promise<void> {
        await Promise.all([
            this.img.onload,
            this.banner.onload,
            this.bannerHover.onload,
            this.colorBanner.onload,
        ]);

    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.visible) {
            const offsets: [number, number] = [this.calcImageXOffset(), this.calcImageYOffset()];
            this.transparent = this.shouldBeTransparent();
            if (this.transparent) {
                ctx.globalAlpha = 0.5;
            } 
            ctx.drawImage(this.img, ...offsets);
            ctx.globalAlpha = 1;
            
            if ((this.hovered || Cache.selectedTile == this)) {
                ctx.fillText(
                    `${this.x} | ${this.y}`, 
                    offsets[0] + Tile.hexBorders[5][0], 
                    offsets[1] + Tile.hexBorders[5][1] - 5
                );
                const path = new Path2D();
                path.moveTo(
                    this.calcImageXOffset() + Tile.hexBorders[0][0] + 2, 
                    this.calcImageYOffset() + Tile.hexBorders[0][1]
                );
                for (let i = 1 ; i < Tile.hexBorders.length ; i++) {
                    path.lineTo(
                        this.calcImageXOffset() + Tile.hexBorders[i][0] + 1, 
                        this.calcImageYOffset() + Tile.hexBorders[i][1] - 1
                    );
                }
                path.closePath();
                ctx.stroke(path);
            }
            if (this.base) {
                const base = Cache.getBase(this.base);
                if (base) {
                    ctx.drawImage(
                        this.hovered ? this.bannerHover : this.banner,
                        this.calcImageXOffset() + 156,
                        this.calcImageYOffset() + 260,
                        200,
                        30
                    );  
                    ctx.fillRect(
                        this.calcImageXOffset() + 160,
                        this.calcImageYOffset() + 288,
                        30,
                        30
                    );
                    ctx.drawImage(
                        this.colorBanner,
                        this.calcImageXOffset() + 160,
                        this.calcImageYOffset() + 288,
                        30,
                        30
                    );
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'white';
                    const font = ctx.font;
                    ctx.font = "bold 17px Arial"
                    ctx.fillText(
                        `${unescape(base.name)}`, 
                        this.calcImageXOffset() + 256,
                        this.calcImageYOffset() + 276,
                        120
                    );
                    ctx.font = font;
                    ctx.textAlign = 'start';
                    ctx.fillStyle = 'black';
                }
            }
        }
            
    }
    private shouldBeTransparent(): boolean {
        return (
            !!(
                Game.state === 'army_movement_select' && 
                !Cache.path?.includes(this)
            ) || !!(
                Game.state === 'path_view' &&
                !Cache.path?.includes(this)
            )
        );
    }

    calcCenter(): [number, number] {
        return [
            this.calcImageXOffset() + Tile.hexMiddle[0],
            this.calcImageYOffset() + Tile.hexMiddle[1],
        ];
    }

    calcImageXOffset(): number {
        let offset = 0;
        offset += this.x * Tile.hexXoffset;
        return offset;
    }

    calcImageYOffset(): number {
        let offset = 0;
        offset += this.y * Tile.hexHeight;
        offset += Math.abs(this.x * Tile.hexYoffset);
        return offset;
    }

    getAssetRoute(type: number, orientation: number): string {
        const ori = orientation ? 'E' : 'W';
        if (this.base) {
            return `../../../assets/tiles/building_village_${ori}.png`;
        }
        switch (type) {
            case 1:
                return `../../../assets/tiles/grass_${ori}.png`;
            case 2:
                return `../../../assets/tiles/grass_forest_${ori}.png`;
            case 3:
                return `../../../assets/tiles/grass_hill_${ori}.png`;
            case 4:
                return `../../../assets/tiles/sand_rocks_${ori}.png`;
            case 5:
                return `../../../assets/tiles/stone_rocks_${ori}.png`;
            case 6:
                return `../../../assets/tiles/stone_hill_${ori}.png`;
            case 7:
                return `../../../assets/tiles/stone_mountain_${ori}.png`;
        
            default:
                return '../../../assets/tiles/grass_E.png';
        }

        // switch (type) {
        //     case 1:
        //         return `../../../assets/tiles/ass/Plains.png`;
        //     case 2:
        //         return `../../../assets/tiles/ass/Forest.png`;
        //     case 3:
        //         return `../../../assets/tiles/ass/Hills.png`;
        //     case 4:
        //         return `../../../assets/tiles/ass/Wasteland.png`;
        //     case 5:
        //         return `../../../assets/tiles/ass/Stone Plains.png`;
        //     case 6:
        //         return `../../../assets/tiles/ass/Mountain.png`;
        //     case 7:
        //         return `../../../assets/tiles/ass/High Mountain.png`;
        
        //     default:
        //         return '../../../assets/ui/ass/Plains.png';
        // }
    }

    checkHover(x: number, y: number): boolean {
        let normX = x - this.calcImageXOffset();
        let normY = y - this.calcImageYOffset();
        // too much to left/right
        if (normX < Tile.hexBorders[0][0] || normX > Tile.hexBorders[3][0]) {
            return false;
        }
        // too much up/down
        if (normY < Tile.hexBorders[1][1] || normY > Tile.hexBorders[5][1]) {
            return false;
        }
        // middle square (1 -> 2 -> 4 -> 5)
        if (normX < Tile.hexBorders[2][0] && normX > Tile.hexBorders[1][0]) {
            return true;
        }
        const hoverDiff = 5;
        // left triangles
        if (normX <= Tile.hexBorders[1][0]) {
            // set point 0 as center of coordinate system
            normX -= Tile.hexBorders[0][0];
            normY -= Tile.hexBorders[0][1];
            // top left trinagle (diagonal -> x = y) is under?
            if (normY > 0) {
                return normX > (normY + hoverDiff);
            }
            if (normY < 0) {
                return normX > -(normY - hoverDiff);
            }
            console.log('LEFT TRIANGLES BUT NOT HANDLED!!')
        }
        // right triangles
        if (normX >= Tile.hexBorders[2][0]) {
            normX -= Tile.hexBorders[3][0];
            normY -= Tile.hexBorders[3][1];
            // top left trinagle (diagonal -> x = y) is under?
            if (normY > 0) {
                return -normX > (normY + hoverDiff);
            }
            if (normY < 0) {
                return -normX > -(normY - hoverDiff);
            }
            console.log('RIGHT TRIANGLES BUT NOT HANDLED!!') 
        }
        return true;
    }
}