import { DigraphNode } from "./node.digraph";

export class DigraphWeightFuntion {

    private map = new Map<DigraphNode, Map<DigraphNode, number>>();

    public set(tail: DigraphNode, head: DigraphNode, weight: number): void {
        if (!this.map.get(tail)) {
            this.map.set(tail, new Map());
        }
        (this.map.get(tail) as Map<DigraphNode, number>).set(head,weight);
    }

    public get(tail: DigraphNode, head: DigraphNode): number | undefined {
        const node = this.map.get(tail);
        if (!node) {
            return undefined;
        }
        return node.get(head);
    }
}