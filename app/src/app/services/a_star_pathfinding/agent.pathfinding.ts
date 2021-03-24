import { Tile } from "src/app/models/game_models/tile.game";
import { AStarPathFinder } from "./a-star.pathfinder";
import { DigraphCoordinates } from "./coordinates.digraph";
import { DigraphWeightFuntion } from "./digraph-weight.function";
import { EuclidianHeuristicFunction } from "./euclidian.heuristic.function";
import { HeuristicFunction } from "./heuristic.function";
import { DigraphNode } from "./node.digraph";

export class PathfindingAgent {

    private weightFunction: DigraphWeightFuntion;
    private hf: HeuristicFunction;
    private coordinates: DigraphCoordinates;
    private deleted: DigraphNode[];
    private graph: DigraphNode[];
    private tiles: Tile[];

    public constructor(tiles: Tile[]) {
        this.tiles = tiles;
        this.graph = []
        this.deleted = [];
        this.coordinates = new DigraphCoordinates();
        this.hf = new EuclidianHeuristicFunction(this.coordinates, this.deleted);
        this.weightFunction = new DigraphWeightFuntion()
        this.initGraph();
    }


    public findPath(start: Tile, end: Tile): DigraphNode[] {
        const n1 = this.findNode(start);
        const n2 = this.findNode(end);
        if (n1 && n2) {
            return AStarPathFinder.search(n1, n2, this.weightFunction, this.hf);
        } else {
            console.log('path nodes do not exist')
            return [];
        }
    }

    private initGraph() {
        this.createNodes();
        this.connectNodes();
        this.createDigraphCoords();
        this.createWeightFunction();
        this.deleted = [];
        this.hf = new EuclidianHeuristicFunction(this.coordinates, this.deleted);
    }

    private createWeightFunction(): void {
        this.weightFunction = new DigraphWeightFuntion();
        for(const node of this.graph) {
            const p1: [number, number] | undefined = this.coordinates.get(node);
            for(const child of node.getChildren()) {
                const p2 = this.coordinates.get(child);
                this.weightFunction.set(node, child, this.weightDiagonal(node, child));
            }
        }
    }

    private createDigraphCoords(): void {
        this.coordinates = new DigraphCoordinates();
        for(const node of this.graph) {
            this.coordinates.put(node, [node.getX(), node.getY()]);
        }
    }

    private connectNodes(): void {
        for (const node of this.graph) {
            const neighbours = this.findNeighbours(node);
            for (const neigh of neighbours) {
                node.addNode(neigh);
            }
        }
    }

    protected weightDiagonal(head: DigraphNode, tail: DigraphNode): number {
        const x: number = Math.abs(head.getX()-tail.getX());
        const y: number = Math.abs(head.getY()-tail.getY());
        //we don't want diagonals
        if(x+y == 2) return 99;
        else return 10;
    }

    private findNeighbours(node: DigraphNode): DigraphNode[] {
       const neighbours: DigraphNode[] = [];
        for (const n of this.graph) {
            if (this.neighbours(node, n)) {
                neighbours.push(n);
            }
        }
        return neighbours;
    }

    private neighbours(n1: DigraphNode, n2: DigraphNode): boolean {
        const x1: number = n1.getTile().x;
        const y1: number = n1.getTile().y;
        const x2: number = n2.getTile().x;
        const y2: number = n2.getTile().y;
        // return ((x1 == x2 && Math.abs(y1 - y2) == 1) || (y1 == y2 && Math.abs(x1 - x2) == 1));
        return (
            (x1 == x2 && Math.abs(y1 - y2) == 1) ||
            (x1 == (x2 + 1) && [-1, 0].includes((y1 - y2))) ||
            (x1 == (x2 - 1) && [ 1, 0].includes((y1 - y2))) 
        )
    }

    private createNodes(): void {
        let id = 0;
        for(const tile of this.tiles) {
            this.graph.push(new DigraphNode(id, tile.x, tile.y, tile));
            id++;
        }
    }

    public addTile(t: Tile): void {
        if (!this.tiles.includes(t)) {
            this.tiles.push(t);
            this.initGraph();
        }
    }

    private findNode(t: Tile): DigraphNode | null {
        for (const node of this.graph) {
            if (t == node.getTile()) {
                return node;
            }
        }
        return null;
    }
}