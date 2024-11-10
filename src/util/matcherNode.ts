import {ConstantNode} from './constantNode.ts';
import {DiGraph} from './digraph.ts';
import {getNodeAttribute, getOnlyChild, getParents, safeParseInt} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';
import {SearchNode} from './searchNode.ts';
import {ObjectNode} from './objectNode.ts';
import {ValueNode} from './valueNode.ts';

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
            this.graph.log(this, `${this.getLabel()}: Looking at parents`);

            // Figure out targets.
            let leftValueNode: ValueNode | undefined = undefined, leftValue: ConstantNode | undefined,
                leftPos: ConstantNode;
            let rightValueNode: ValueNode, rightValue: ConstantNode | undefined, rightPos: ConstantNode;
            if (this.left.score === 1) {
                leftValueNode = getOnlyChild(this.graph, this.left) as ValueNode;
                leftValue = getNodeAttribute(this.graph, leftValueNode, 'value');
                leftPos = getNodeAttribute(this.graph, leftValueNode, 'pos');
            }
            if (this.right.score === 1) {
                rightValueNode = getOnlyChild(this.graph, this.right) as ValueNode;
                rightValue = getNodeAttribute(this.graph, rightValueNode, 'value');
                rightPos = getNodeAttribute(this.graph, rightValueNode, 'pos');
            }

            let value = leftValue?.value || rightValue?.value;
            let type: string;
            let delta = 0;
            if (this.left.score === 1 && this.right.score === 1) {
                this.graph.log(this, `Both children are done. Adding edge to parent. Comparing ${leftPos!.value} to ${rightPos!.value}`);
                if (leftPos!.value === rightPos!.value) {
                    type = 'stay';
                } else {
                    type = 'move';
                    delta = safeParseInt(leftPos!.value) - safeParseInt(rightPos!.value);
                }
            } else if (this.left.score === 1) {
                this.graph.log(this, "Only left side found.");
                type = 'gone';
            } else if (this.right.score === 1) {
                this.graph.log(this, "Only right side found.");
                type = 'appear';
            } else {
                throw new Error(`Unexpected situation`);
            }

            if (parents.length > 0) {
                if (parents.length > 1) {
                    throw new Error(`Expected only one parent, but found ${parents.length}.`);
                }
                const parentType = parents[0].type;
                if (parentType !== type) {
                    this.graph.log(this, `Parent type doesn't match, replacing ${parentType} with ${type}`);
                } else {
                    this.graph.log(this, "Parent type matches, nothing to do");
                    return;
                }

                // Delete parent.
                this.graph.removeNode(parents[0]);
            }

            const objectNode = new ObjectNode(this.graph, value || "", type, String(delta), leftValueNode);
            this.graph.addEdge(objectNode, this, {type: 'child'});

            if (this.left.isDone && this.right.isDone) {
                this.graph.log(this, `MatcherNode is done`);
                this.isDone = true;
            }
        }
    }
}