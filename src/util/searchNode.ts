import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodeBase.ts';
import {ValueNode} from './valueNode.ts';

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
        const children: ValueNode[] = this.graph.successors(this) as ValueNode[];
        if (children.length !== 1) {
            throw new Error(`Should only have one child, but has ${children.length}.`);
        }
        const match = children[0].value === this.value;
        this.score = match ? 1 : 0;
        if (this.score === 1) {
           this.isDone = true;
        }
    }

    getLabel(): string {
        return `SearchNode(${this.value})\nscore ${this.score}`;
    }

    doStep(): void {
        super.doStep();
        if (this.score < 1) {
            if (this.energyUnits <= 0) {
                this.graph.log(this, `${this.getLabel()}, ${this.originalValueNode.extraLabel}: No more energy`);
                this.isDone = true;
                return;
            }
            this.energyUnits -= 1;
            const debugLabel = `${this.getLabel()}, ${this.originalValueNode.extraLabel}:`;
            if ((this.leftIndex <= this.rightIndex || this.rightIndex === -1) && this.leftIndex !== -1) {
                // Search left.
                const searchNode = this.leftNode || this.originalValueNode;
                const foundNode = this.graph.getPreviousNode(searchNode, {type: 'seq'});
                this.graph.log(this, `${debugLabel} Trying to move left`);
                if (foundNode) {
                    this.graph.log(this, `${debugLabel} Moving left`);
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
                this.graph.log(this, `${debugLabel} Trying to move right`);
                if (foundNode) {
                    this.graph.log(this, `${debugLabel} Moving right`);
                    this.graph.removeEdge(this, this.valueNode);
                    this.graph.addEdge(this, foundNode, {type: 'child'});
                    this.valueNode = foundNode as ValueNode;
                    this.rightNode = foundNode as ValueNode;
                    this.rightIndex += 1;
                } else {
                    this.rightIndex = -1; // stop searching
                }
            } else {
                this.graph.log(this, `${this.getLabel()}, ${this.originalValueNode.extraLabel}: No more moves`);
            }
        }
    }
}

// export class ContainerNode extends NodeBase {
//     constructor(graph: DiGraph, public children: Node[]) {
//         super();
//         for (const child of this.children) {
//             graph.addEdge(this, child, {type: 'child'});
//         }
//     }
//
//     evaluateScore() {
//         let score = 0;
//         for (const child of this.children) {
//             score += child.score;
//         }
//         this.score = score / this.children.length;
//     }
//
//     getLabel(): string {
//         return `ContainerNode - score ${this.score}`;
//     }
// }

