import {ConstantNode} from './constantNode.ts';
import {DiGraph} from './digraph.ts';
import {MatcherNode} from './matcherNode.ts';
import {Node} from './nodeInterface.ts';
import {ObjectNode} from './objectNode.ts';
import {OutputNode} from './outputNode.ts';
import {ValueNode} from './valueNode.ts';


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

export function findRuleForNode(graph: DiGraph, ruleContainerNode: Node, inputValueNode: ValueNode): Node | undefined {
    const possibleRules = graph.getNextNodes(ruleContainerNode, {type: 'rule'});
    for (const rule of possibleRules) {
        const ruleInNode = graph.getNextNode(rule, {type: 'in'});
        if (ruleInNode && (ruleInNode as ValueNode).value === inputValueNode.value) { // TODO .value
            return rule;
        }
    }
    return undefined;
}

export function areRuleOutputsSame(existingRuleOutNode: ObjectNode, objectNode: ObjectNode): boolean {
    return existingRuleOutNode.type === objectNode.type && existingRuleOutNode.delta === objectNode.delta;
}

export function copyAttributes(graph: DiGraph, fromNode: ObjectNode, toNode: OutputNode, attributes: string[]): void {

    removeAllAttributes(graph, toNode, attributes);

    const allEdges = graph.getNextEdges(fromNode);
    for (const [targetNode, edgeAttr] of allEdges) {
        if (edgeAttr.type === 'child' || edgeAttr.type === 'seq') {
            continue;
        }
        if (!(targetNode instanceof ConstantNode) && !(targetNode instanceof ValueNode)) {
            throw new Error(`Expected a ConstantNode but found ${targetNode}.`);
        }

        if (attributes.indexOf(edgeAttr.type) >= 0) {
            // console.log("Copying attribute: ", toNode, edgeAttr.type);
            graph.addEdge(toNode, targetNode, {type: edgeAttr.type});
        } else {
            // console.log("copyAttributes skipping attribute: ", edgeAttr.type);
        }
    }
}

function removeAllAttributes(graph: DiGraph, node: OutputNode, attributes: string[]) {
    const allEdges = graph.getNextEdges(node);
    for (const [targetNode, edgeAttr] of allEdges) {
        if (edgeAttr.type === 'child' || edgeAttr.type === 'seq') {
            continue;
        }
        if (!(targetNode instanceof ConstantNode) && !(targetNode instanceof ValueNode)) {
            throw new Error(`Expected a ConstantNode but found ${targetNode}.`);
        }

        if (attributes.indexOf(edgeAttr.type) >= 0) {
            // console.log("Removing attribute: ", node, edgeAttr.type);
            graph.removeEdge(node, targetNode);
        } else {
            // console.log("removeAllAttributes skipping attribute: ", edgeAttr.type);
        }
    }

}


function findElementInSequence(graph: DiGraph, node: Node, delta: number): Node {
    if (delta === 0) {
        return node;
    }
    if (delta > 0) {
        while (delta > 0) {
            node = graph.getNextNodeExactlyOne(node, {type: 'seq'});
            delta -= 1;
        }
    } else {
        while (delta < 0) {
            node = graph.getPreviousNodeExactlyOne(node, {type: 'seq'});
            delta += 1;
        }
    }
    return node;
}

export function copyOutputNode(graph: DiGraph, existingRuleOutNode: ObjectNode, correspondingOutputNode: OutputNode): void {
    const attributesToCopy = ['value'];
    if (existingRuleOutNode.type === 'stay') {
        // removeAllAttributes(graph, correspondingOutputNode);
        copyAttributes(graph, existingRuleOutNode, correspondingOutputNode, attributesToCopy);
    } else if (existingRuleOutNode.type === 'move') {
        const delta = safeParseInt(existingRuleOutNode.delta);
        const targetOutputNode = findElementInSequence(graph, correspondingOutputNode, delta);
        // removeAllAttributes(graph, correspondingOutputNode);
        copyAttributes(graph, existingRuleOutNode, targetOutputNode as OutputNode, attributesToCopy);
    } else {
        throw new Error(`NYI type ${existingRuleOutNode.type}`);
    }
}