import { Tile } from "src/app/models/game_models/tile.game";
import { DigraphNode } from "./node.digraph";

export class DigraphCoordinates {
    private map = new Map<DigraphNode, [[number, number], Tile]>();

    public put(node: DigraphNode, point: [number, number], tile:Tile): void {
        this.map.set(node, [point, tile]);
    }

    public get(node: DigraphNode): [[number, number], Tile] | undefined {
        return this.map.get(node);
    }
}