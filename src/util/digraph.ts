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
    constructor(public value: string, public extraLabel: string) {
        super();
    }

    evaluateScore() {
        this.score = 1;
    }

    getLabel(): string {
        return `ValueNode(${this.value})\n${this.extraLabel}`;
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

export class MatcherNode extends NodeBase {
    left: SearchNode;
    right: SearchNode;

    constructor(graph: DiGraph, public before: ValueNode, public after: ValueNode) {
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

export interface EdgeAttr {
    type: string;
}

// Mimic: https://github.com/fkling/JSNetworkX/blob/master/src/classes/DiGraph.js
export class DiGraph {
    succ: Map<Node, Map<Node, EdgeAttr>> = new Map();
    pred: Map<Node, Map<Node, EdgeAttr>> = new Map();
    adj = this.succ;  // everybody does this

    constructor() {
    }

    addNode(n: Node) {
        if (!this.succ.has(n)) {
            this.succ.set(n, new Map());
            this.pred.set(n, new Map());
        }
    }

    addEdge(u: Node, v: Node, edgeAttr: EdgeAttr) {
        // add nodes
        if (!this.succ.has(u)) {
            this.succ.set(u, new Map());
            this.pred.set(u, new Map());
        }

        if (!this.succ.has(v)) {
            this.succ.set(v, new Map());
            this.pred.set(v, new Map());
        }

        // add the edge
        // const datadict = this.adj.get(u)!.get(v) || {};
        // Object.assign(datadict, edgeAttr);
        const datadict: EdgeAttr = {...edgeAttr};
        this.succ.get(u)!.set(v, datadict);
        this.pred.get(v)!.set(u, datadict);
    }

    removeEdge(u: Node, v: Node) {
        this.succ.get(u)!.delete(v);
        this.pred.get(v)!.delete(u);
    }

    nodeArray(): Node[] {
        return Array.from(this.succ.keys());
    }

    successors(n: Node): Node[] {
        const nbrs = this.succ.get(n);
        if (nbrs !== undefined) {
            return Array.from(nbrs.keys());
        }
        throw new Error(`The node ${n} is not in the digraph.`);
    }

    getNextNodes(n: Node, edgeAttrParam?: EdgeAttr): Node[] {
        const out: Node[] = [];
        const nbrs = this.succ.get(n);
        if (!nbrs) {
            throw new Error(`The node ${n} is not in the graph.`);
        }
        for (const [v, edgeAttr] of nbrs.entries()) {
            if (!edgeAttrParam || edgeAttrParam.type === edgeAttr.type) {
                out.push(v);
            }
        }
        return out;
    }

    getNextNode(n: Node, edgeAttr?: EdgeAttr): Node | undefined {
        const nodes = this.getNextNodes(n, edgeAttr);
        if (nodes.length === 1) {
            return nodes[0];
        } else if (nodes.length > 1) {
            throw new Error(`Expected only one Next node, but found ${nodes.length}.`);
        }
        return undefined;
    }


    getPreviousNodes(n: Node, edgeAttrParam?: EdgeAttr): Node[] {
        const out: Node[] = [];
        const nbrs = this.pred.get(n);
        if (!nbrs) {
            throw new Error(`The node ${n} is not in the graph.`);
        }
        for (const [v, edgeAttr] of nbrs.entries()) {
            if (!edgeAttrParam || edgeAttrParam.type === edgeAttr.type) {
                out.push(v);
            }
        }
        return out;
    }

    getPreviousNode(n: Node, edgeAttr?: EdgeAttr): Node | undefined {
        const nodes = this.getPreviousNodes(n, edgeAttr);
        if (nodes.length === 1) {
            return nodes[0];
        } else if (nodes.length > 1) {
            throw new Error(`Expected only one previous node, but found ${nodes.length}.`);
        }
        return undefined;
    }

    getAllNodes() {
        // Make list. Convert to simple objects since using Node class in DataSet seems to cause problems.
        const displayNodes = this.nodeArray().map(node => {
            return {id: node.id, label: node.getLabel()}
        });

        // Compute edges.
        const displayEdges: any[] = [];
        for (const [u, nbrs] of this.succ) {
            for (const [v, edgeAttr] of nbrs.entries()) {
                if (edgeAttr.type === 'child') {
                    displayEdges.push({from: u.id, to: v.id});
                }
            }
        }

        // Return data.
        // console.log('getAllNodesInPlane: ', displayNodes, displayEdges);
        return {
            nodes: displayNodes,
            edges: displayEdges
        };

    }

}