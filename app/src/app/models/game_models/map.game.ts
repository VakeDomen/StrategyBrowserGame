import { Drawable } from "../core/drawable.abstract";
import { MapPacket } from "../packets/map.packet";
import { TilePacket } from "../packets/tile.packet";
import { Tile } from "./tile.game";

export class GameMap implements Drawable {

    radius: number;
    tiles: Tile[];

    constructor(data: MapPacket) {
        this.radius = data.radius;
        if (data.tiles) {
            this.tiles = data.tiles.map((tile: TilePacket) => new Tile(tile));
        } else {
            this.tiles = [];
        }
        console.log(this.tiles)
    }

    async load(): Promise<void> {
        await Promise.all(this.tiles.map((tile: Tile) => tile.load()));
    }

    async draw(ctx: CanvasRenderingContext2D): Promise<void> {
        this.tiles.map((tile: Tile) => tile.draw(ctx));
    }

}