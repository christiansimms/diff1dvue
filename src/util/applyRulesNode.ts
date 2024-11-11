import {DiGraph} from './digraph.ts';
import {GeneralizeNode} from './generalizeNode.ts';
import {copyOutputNode, findRuleForNode} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';
import {ObjectNode} from './objectNode.ts';
import {OutputNode} from './outputNode.ts';
import {ValueNode} from './valueNode.ts';

export class ApplyRulesNode extends NodeBase {
    workQueue: ValueNode[] = [];
    workQueueSize = 0;

    constructor(public graph: DiGraph, public generalizeNode: GeneralizeNode, public inputNodes: ValueNode[], public outputNodes: OutputNode[]) {
        super();

        this.workQueue = inputNodes;
        this.workQueueSize = this.workQueue.length;
        if (this.workQueueSize === 0) {
            throw new Error(`Expected at least one node.`);
        }
    }

    evaluateScore() {
        this.score = (this.workQueueSize - this.workQueue.length) / this.workQueueSize;
    }

    getLabel(): string {
        return `ApplyRulesNode - score ${this.score}`;
    }

    doStep(): void {
        super.doStep();

        if (this.workQueue?.length === 0) {
            this.isDone = true;
        } else {
            // Find next object node.
            const valueNode = this.workQueue.pop();
            this.graph.log(this, `ARN looking at: ${valueNode}`);
            if (!valueNode) {
                throw new Error(`Expected object node but found none.`);
            }
            const correspondingOutputNode = this.outputNodes.find((outputNode) => outputNode.pos === valueNode.pos);
            if (!correspondingOutputNode) {
                throw new Error(`Expected corresponding output node but found none.`);
            }

            // Make it a child of this node.
            this.graph.addEdge(this, valueNode, {type: 'child'});

            if (valueNode.value) {
                const existingRule = findRuleForNode(this.graph, this.generalizeNode, valueNode);
                this.graph.log(this, `Found existing rule: ${existingRule}`);
                if (existingRule) {
                    const existingRuleOutNode: ObjectNode = this.graph.getNextNodeExactlyOne(existingRule, {type: 'out'}) as ObjectNode;
                    copyOutputNode(this.graph, existingRuleOutNode, correspondingOutputNode);
                } else {
                    throw new Error(`NYI: no rule found`);
                }
            } else {
                this.graph.log(this, `Skipping empty value node: ${valueNode}`);
            }

            // Make it a child of this node.
            this.graph.addEdge(this, correspondingOutputNode, {type: 'child'});
        }
    }
}
