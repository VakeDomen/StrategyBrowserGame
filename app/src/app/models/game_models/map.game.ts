import { Drawable } from "../core/drawable.abstract";
import { MapPacket } from "../packets/map.packet";
import { TilePacket } from "../packets/tile.packet";
import { Tile } from "./tile.game";

export class GameMap implements Drawable {

    radius: number;
    tiles: Tile[];
    sortedTilesByCoords: Tile[];

    constructor(data: MapPacket) {
        this.radius = data.radius;
        if (data.tiles) {
            this.tiles = data.tiles.map((tile: TilePacket) => new Tile(tile));
        } else {
            this.tiles = [];
        }
        this.sortedTilesByCoords = this.sortTilesByCoords();
        console.log(this.sortedTilesByCoords)
    }

    private sortTilesByCoords(): Tile[] {
        if (this.tiles) {
            return this.tiles.sort((a: Tile, b: Tile) => a.calcImageYOffset() - b.calcImageYOffset());
        }
        
        return [];
    }

    async load(): Promise<void> {
        await Promise.all(this.tiles.map((tile: Tile) => tile.load()));
    }

    async draw(ctx: CanvasRenderingContext2D): Promise<void> {
        for (const tile of this.sortedTilesByCoords) {
            tile.draw(ctx);
        }
    }

    getTile(x: number, y: number): Tile | undefined {
        for (const tile of this.tiles) {
            if (tile.x == x && tile.y == y) {
                return tile;
            }
        }
        return undefined;
    }

}