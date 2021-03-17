import { Drawable } from "../core/drawable.abstract";
import { MapPacket } from "../packets/map.packet";
import { TilePacket } from "../packets/tile.packet";

export class GameMap implements Drawable {

    radius: number;
    tiles: TilePacket[];

    constructor(data: MapPacket) {
        this.radius = data.radius;
        this.tiles = data.tiles;
    }
    async draw(ctx: CanvasRenderingContext2D): Promise<void> {
        const img = new Image();
        img.src = '../../../assets/tiles/building_cabin_E.png';
        await img.onload;
        ctx.drawImage(img, 10, 70);

    }

}