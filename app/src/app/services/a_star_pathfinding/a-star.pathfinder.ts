import { BinaryHeap } from "./binary.heap";
import { DigraphWeightFuntion } from "./digraph-weight.function";
import { HeuristicFunction } from "./heuristic.function";
import { DigraphNode } from "./node.digraph";

class HeapEntry {
    private node: DigraphNode;
    private distance: number;

    constructor(node: DigraphNode, distance: number){
        this.node = node;
        this.distance = distance;
    }

    getNode(): DigraphNode {
        return this.node;
    }

    getDistance(): number {
        return this.distance
    }
}
export class AStarPathFinder {


    public static search(
            source: DigraphNode,
            target: DigraphNode,
            weightFunction: DigraphWeightFuntion,
            heuristicFunction: HeuristicFunction,
    ): DigraphNode[] {
        // might be problematic ˇˇ
        const OPEN: BinaryHeap<HeapEntry> = new BinaryHeap((entry: HeapEntry) => entry.getDistance());
        const CLOSED: DigraphNode[] = [];
        const DISTANCE = new Map<DigraphNode, number>();
        const PARENTS = new Map<DigraphNode, DigraphNode | null>();
        OPEN.push(new HeapEntry(source, 0.0));
        DISTANCE.set(source, 0.0);
        PARENTS.set(source, null);

        while(OPEN.size() != 0) {
            const currentNode: DigraphNode = OPEN.pop().getNode();
            if(currentNode.equals(target)) {
                return this.traceBackPath(currentNode, PARENTS);
            }
            if(CLOSED.includes(currentNode)) {
                continue;
            }
            for(const childNode of currentNode.getChildren()) {
                if(CLOSED.includes(childNode)) {
                    continue;
                }
                const diatance = DISTANCE.get(currentNode) as number;
                const weight = weightFunction.get(currentNode, childNode) as number;
                const tentativeDistance: number =  diatance + weight;
                if(![...DISTANCE.keys()].includes(childNode) || DISTANCE.get(childNode) as number > tentativeDistance) {
                    DISTANCE.set(childNode, tentativeDistance);
                    PARENTS.set(childNode, currentNode);
                    OPEN.push(new HeapEntry(childNode, tentativeDistance + heuristicFunction.getEstimate(childNode, target)));
                }
            }
        }
        return [];
    }

    private static traceBackPath(target: DigraphNode, PARENTS: Map<DigraphNode, DigraphNode | null> ): DigraphNode[] {
        const path: DigraphNode[] = [];
        let currentNode: DigraphNode | null = target;
        while (currentNode != null) {
            path.push(currentNode);
            const node = PARENTS.get(currentNode);
            if (typeof node != undefined) {
                currentNode = (node as DigraphNode | null);
            } else {    
                console.log("big error in a-star.pathfinder!! undefined value");
                break;
            }
        }
        return path.reverse();
    }
}