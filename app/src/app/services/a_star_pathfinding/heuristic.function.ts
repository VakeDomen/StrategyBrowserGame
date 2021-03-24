import { DigraphNode } from "./node.digraph";

export interface HeuristicFunction {

    getEstimate(node1: DigraphNode, node2: DigraphNode): number;

}