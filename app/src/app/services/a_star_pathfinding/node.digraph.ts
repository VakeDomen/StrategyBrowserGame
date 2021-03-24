import { Tile } from "src/app/models/game_models/tile.game";

export class DigraphNode {
    private id: number;
    private x: number;
    private y: number;
    private t: Tile;
    private children = new Map<number, DigraphNode>(); // hash set?

    public constructor(id: number, x: number, y: number, t: Tile) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.t = t;
    }

    public equals(o: DigraphNode): boolean {
        if(o == null || o == undefined) {
            return false;
        }
        return this.id == o.id;
    }

    public hashCode(): number { return this.id; }

    public addNode(child: DigraphNode): void {
        this.children.set(child.id, child);
    }
    public removeChild(child: DigraphNode): void {
        this.children.delete(child.id);
    }
    public getChildren(): DigraphNode[] {
        return [...this.children.values()];
    }

    public compare(i: number, j: number): boolean {
        return (i == this.x && j == this.y);
    }
    public getX(): number { return this.x; }
    public getY(): number { return this.y; }
    public getTile(): Tile { return this.t; }

}