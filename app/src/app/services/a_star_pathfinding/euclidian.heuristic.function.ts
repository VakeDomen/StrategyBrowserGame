import { DigraphCoordinates } from "./coordinates.digraph";
import { HeuristicFunction } from "./heuristic.function";
import { DigraphNode } from "./node.digraph";

export class EuclidianHeuristicFunction implements HeuristicFunction {

    private coordinates: DigraphCoordinates;
    private deleted: DigraphNode[];

    public constructor(coordinates: DigraphCoordinates, deleted: DigraphNode[]) {
        this.coordinates = coordinates;
        this.deleted = deleted;
    }

    public getEstimate(node1: DigraphNode, node2: DigraphNode): number {
        const point1: [number, number] | undefined = this.coordinates.get(node1);
        const point2: [number, number] | undefined = this.coordinates.get(node2);
        let dist: number = 99;
        if (point1 && point2) {
            let dist: number = this.distanceBetweenPoints(point1, point2);
            const x: number = node2.getX() - node1.getX();
            const y: number = node2.getY() - node1.getY();
            const choice1 = EuclidianHeuristicFunction.choose(this.deleted, node1.getX() + x, node1.getY());
            const choice2 = EuclidianHeuristicFunction.choose(this.deleted, node1.getX(), node1.getY() + y);
            const q1 = (choice1 && this.deleted.includes(choice1));
            const q2 = (choice2 && this.deleted.includes(choice2));
            if(dist != 1.0 && (q1 || q2)) {
                dist = 99;
            }
        }
        return dist;
    }

    private static choose(list: DigraphNode[], i: number, j: number): DigraphNode | undefined {
        for(const el of list) {
            if(el.compare(i, j)) {
                return el;
            }
        }
        return undefined;
    }

    private distanceBetweenPoints(p1: [number, number], p2: [number, number]): number {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
    }
}