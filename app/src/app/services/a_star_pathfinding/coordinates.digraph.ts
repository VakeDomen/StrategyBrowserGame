import { DigraphNode } from "./node.digraph";

export class DigraphCoordinates {
    private map = new Map<DigraphNode, [number, number]>();

    public put(node: DigraphNode, point: [number, number]): void {
        this.map.set(node, point);
    }

    public get(node: DigraphNode): [number, number] | undefined {
        return this.map.get(node);
    }
}