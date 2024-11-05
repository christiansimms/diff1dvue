import {DiGraph} from './digraph.ts';
import {Node} from './node-interface.ts';
import {ConstantNode} from './nodes.ts';

export function findOrCreateConstantNode(graph: DiGraph, value: string): ConstantNode {
    let constantNode = graph.constantNodeCache.get(value);
    if (!constantNode) {
        constantNode = new ConstantNode(graph, value);
        graph.addNode(constantNode);
        graph.constantNodeCache.set(value, constantNode);
    }
    return constantNode as ConstantNode;
}

export function addNodeAttribute(graph: DiGraph, node: Node, value: string, type: string) {
    const constantNode = findOrCreateConstantNode(graph, value);
    graph.addEdge(node, constantNode, {type});
}

