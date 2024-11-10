import {ConstantNode} from './constantNode.ts';
import {DiGraph} from './digraph.ts';
import {MatcherNode} from './matcherNode.ts';
import {Node} from './node-interface.ts';


export function getParents(node: MatcherNode) {
    return node.graph.getPreviousNodes(node, {type: 'child'});
}

export function getOnlyChild(graph: DiGraph, node: Node): Node {
    const succ = graph.getNextNode(node, {type: 'child'});
    if (!succ) {
        throw new Error(`Expected only one child but found none.`);
    }
    return succ;
}

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

export function getNodeAttribute(graph: DiGraph, node: Node, type: string): ConstantNode {
    const attributeNode = graph.getNextNode(node, {type});
    if (!attributeNode) {
        throw new Error(`Expected an attribute node of type ${type} but found none.`);
    }
    return attributeNode as ConstantNode;
}

export function safeParseInt(value: string): number {
    return parseInt(value);
}
