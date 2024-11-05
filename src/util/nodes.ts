import {DiGraph} from './digraph.ts';
import {addNodeAttribute} from './graph-helper.ts';
import {Node} from './node-interface.ts';

let NodeId = 0;

export class NodeBase implements Node {
    score = 0;
    id = NodeId++;

    constructor() {
    }

    evaluateScore() {
        throw new Error(`Method not implemented on class: ${this.constructor.name}.`);
    }

    getLabel(): string {
        throw new Error(`Method not implemented on class: ${this.constructor.name}.`);
    }

    doStep(): void {
        this.evaluateScore();
    }
}

export class ValueNode extends NodeBase {
    constructor(public graph: DiGraph, public value: string, public extraLabel: string, public index: number) {
        super();
        addNodeAttribute(this.graph, this, String(index), 'pos');
    }

    evaluateScore() {
        this.score = 1;
    }

    getLabel(): string {
        return `ValueNode(${this.value})\n${this.extraLabel}`;
    }
}

export class ConstantNode extends NodeBase {
    constructor(public graph: DiGraph, public value: string) {
        super();
    }

    evaluateScore() {
        this.score = 1;
    }

    getLabel(): string {
        return `ConstantNode(${this.value})`;
    }
}

export class SearchNode extends NodeBase {
    energyUnits = 10;
    originalValueNode: ValueNode;
    leftIndex = 0;
    rightIndex = 0;
    leftNode?: ValueNode;
    rightNode?: ValueNode;

    // value is the searchValue
    constructor(public graph: DiGraph, public valueNode: ValueNode, public value: string) {
        super();
        graph.addEdge(this, valueNode, {type: 'child'});
        this.originalValueNode = valueNode;
    }

    evaluateScore() {
        const children: ValueNode[] = this.graph.successors(this) as ValueNode[];  // TODO graph
        if (children.length !== 1) {
            throw new Error(`Should only have one child, but has ${children.length}.`);
        }
        const match = children[0].value === this.value;
        this.score = match ? 1 : 0;
    }

    getLabel(): string {
        return `SearchNode(${this.value})\nscore ${this.score}`;
    }

    doStep(): void {
        super.doStep();
        if (this.score < 1) {
            if (this.energyUnits <= 0) {
                console.log(`${this.getLabel()}, ${this.originalValueNode.extraLabel}: No more energy`);
                return;
            }
            this.energyUnits -= 1;
            const debugLabel = `${this.getLabel()}, ${this.originalValueNode.extraLabel}:`;
            if ((this.leftIndex <= this.rightIndex || this.rightIndex === -1) && this.leftIndex !== -1) {
                // Search left.
                const searchNode = this.leftNode || this.originalValueNode;
                const foundNode = this.graph.getPreviousNode(searchNode, {type: 'seq'});
                console.log(`${debugLabel} Trying to move left`);
                if (foundNode) {
                    console.log(`${debugLabel} Moving left`);
                    this.graph.removeEdge(this, this.valueNode);
                    this.graph.addEdge(this, foundNode, {type: 'child'});
                    this.valueNode = foundNode as ValueNode;
                    this.leftNode = foundNode as ValueNode;
                    this.leftIndex += 1;
                } else {
                    this.leftIndex = -1; // stop searching
                }
            } else if (this.rightIndex !== -1) {
                // Search right.
                const searchNode = this.rightNode || this.originalValueNode;
                const foundNode = this.graph.getNextNode(searchNode, {type: 'seq'});
                console.log(`${debugLabel} Trying to move right`);
                if (foundNode) {
                    console.log(`${debugLabel} Moving right`);
                    this.graph.removeEdge(this, this.valueNode);
                    this.graph.addEdge(this, foundNode, {type: 'child'});
                    this.valueNode = foundNode as ValueNode;
                    this.rightNode = foundNode as ValueNode;
                    this.rightIndex += 1;
                } else {
                    this.rightIndex = -1; // stop searching
                }
            } else {
                console.log(`${this.getLabel()}, ${this.originalValueNode.extraLabel}: No more moves`);
            }
        }
    }
}

// "temporary" helper
function getParents(node: MatcherNode) {
    return node.graph.getPreviousNodes(node, {type: 'child'});
}

function deleteParents(node: MatcherNode) {
    const parents: ObjectNode[] = getParents(node) as ObjectNode[];
    for (const parent of parents) {
        node.graph.removeEdge(parent, node);  // TODO remove recursively?
    }
}

export class MatcherNode extends NodeBase {
    left: SearchNode;
    right: SearchNode;

    constructor(public graph: DiGraph, public before: ValueNode, public after: ValueNode) {
        super();
        const initialSearchValue = before.value || after.value;
        this.left = new SearchNode(graph, before, initialSearchValue);
        this.right = new SearchNode(graph, after, initialSearchValue);
        graph.addEdge(this, this.left, {type: 'child'});
        graph.addEdge(this, this.right, {type: 'child'});
    }

    evaluateScore() {
        this.score = (this.left.score + this.right.score) / 2;
    }

    getLabel(): string {
        return `MatcherNode\nscore ${this.score}`;
    }

    doStep(): void {
        super.doStep();
        const parents: ObjectNode[] = getParents(this) as ObjectNode[];
        if (this.score > 0) {
            console.log(`${this.getLabel()}: Looking at parents`);
            let type: string;
            if (this.left.score === 1 && this.right.score === 1) {
                console.log("Both children are done. Adding edge to parent.");
                type = 'move';  // TODO need stay also
            } else if (this.left.score === 1) {
                console.log("Only left side found.");
                type = 'gone';
            } else if (this.right.score === 1) {
                console.log("Only right side found.");
                type = 'appear';
            } else {
                console.log("NYI, skipping");
                return;
            }

            if (parents.length > 0) {
                if (parents.length > 1) {
                    throw new Error(`Expected only one parent, but found ${parents.length}.`);
                }
                const parentType = parents[0].type;
                if (parentType !== type) {
                    console.log(`Parent type doesn't match, replacing ${parentType} with ${type}`);
                } else {
                    console.log("Parent type matches, nothing to do");
                    return;
                }

                // Delete parent.
                deleteParents(this);
            }

            const objectNode = new ObjectNode(this.graph, type);
            this.graph.addEdge(objectNode, this, {type: 'child'});
        }
    }
}

export class ContainerNode extends NodeBase {
    constructor(graph: DiGraph, public children: Node[]) {
        super();
        for (const child of this.children) {
            graph.addEdge(this, child, {type: 'child'});
        }
    }

    evaluateScore() {
        let score = 0;
        for (const child of this.children) {
            score += child.score;
        }
        this.score = score / this.children.length;
    }

    getLabel(): string {
        return `ContainerNode - score ${this.score}`;
    }
}

export class ObjectNode extends NodeBase {
    constructor(_graph: DiGraph, public type: string) {
        super();
    }

    evaluateScore() {
        // TODO -- Don't need this right?
        this.score = 1;
    }

    getLabel(): string {
        return `ObjectNode ${this.type} - score ${this.score}`;
    }
}
