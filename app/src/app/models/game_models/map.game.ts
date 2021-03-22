import { Drawable } from "../core/drawable.abstract";
import { MapPacket } from "../packets/map.packet";
import { TilePacket } from "../packets/tile.packet";
import { Tile } from "./tile.game";

export class GameMap implements Drawable {

    radius: number;
    tiles: Tile[];
    sortedTilesByCoords: Tile[];
    

    private selectedTile: Tile | undefined;
    private globalAlpha: number = 1;

    constructor(data: MapPacket) {
        this.radius = data.radius;
        if (data.tiles) {
            this.tiles = data.tiles.map((tile: TilePacket) => new Tile(tile));
        } else {
            this.tiles = [];
        }
        this.sortedTilesByCoords = this.sortTilesByCoords();
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
        ctx.globalAlpha = this.globalAlpha;
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

    selectTile(tile: Tile): void {
        this.globalAlpha = 0.5;
        if (this.selectedTile) {
            this.selectedTile.setSelected(false);
        }
        tile.setSelected(true);
        this.selectedTile = tile;
    }

    findClick(x: number, y: number): Tile | undefined {
        for (const tile of this.tiles) {
            if (tile.isPointOnTile(x, y)) {
                return tile;
            }
        }
        return undefined;
    }

    findHover(x: number, y: number): void {
        this.tiles.map((tile: Tile) => {
            tile.isHovered = tile.isPointOnTile(x, y);
        });
    }
    
    unselectTile(): void {
        this.selectedTile?.setSelected(false);
        this.globalAlpha = 1;
        this.selectedTile = undefined;
    }

    getSelectedTile(): Tile | undefined {
        return this.selectedTile;
    }
}