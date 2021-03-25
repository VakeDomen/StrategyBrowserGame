import { PathfindingAgent } from "src/app/services/a_star_pathfinding/agent.pathfinding";
import { Cache } from "src/app/services/cache.service";
import { Drawable } from "../core/drawable.abstract";
import { Game } from "../game";
import { MapPacket } from "../packets/map.packet";
import { TilePacket } from "../packets/tile.packet";
import { Tile } from "./tile.game";

export class GameMap implements Drawable {

    radius: number;
    tiles: Tile[];
    sortedTilesByCoords: Tile[];
    

    private selectedTile: Tile | undefined;
    private pathfinder: PathfindingAgent;

    constructor(data: MapPacket) {
        this.radius = data.radius;
        if (data.tiles) {
            this.tiles = data.tiles.map((tile: TilePacket) => new Tile(tile));
        } else {
            this.tiles = [];
        }
        this.sortedTilesByCoords = this.sortTilesByCoords();
        this.pathfinder = new PathfindingAgent(this.tiles);
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

    selectTile(tile: Tile): void {
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
            const hover = tile.isPointOnTile(x, y);
            // on hover change
            if (Game.state === 'army_movement_select' && Cache.selectedArmy && hover !== tile.isHovered) {
                // if now hovered -> calc path
                if (hover) {
                    const start = this.getTile(
                        Cache.selectedArmy.x, 
                        Cache.selectedArmy.y,
                    );
                    if (start) {
                        Cache.path = this.pathfinder.findPath(start, tile);
                    }
                        
                }
            }
            tile.isHovered = hover;
        });
    }

    getRandomTile(): Tile {
        return this.tiles[Math.floor(Math.random() * this.tiles.length)];
    }
    
    unselectTile(): void {
        this.selectedTile?.setSelected(false);
        this.selectedTile = undefined;
    }

    getSelectedTile(): Tile | undefined {
        return this.selectedTile;
    }
}