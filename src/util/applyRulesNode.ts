import {DiGraph} from './digraph.ts';
import {GeneralizeNode} from './generalizeNode.ts';
import {findRuleForNode} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';
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
            console.log("GN looking at: ", valueNode);
            if (!valueNode) {
                throw new Error(`Expected object node but found none.`);
            }

            // Make it a child of this node.
            this.graph.addEdge(this, valueNode, {type: 'child'});

            if (valueNode.value) {
                const existingRule = findRuleForNode(this.graph, this.generalizeNode, valueNode);
                console.log("Found existing rule: ", existingRule);
                if (existingRule) {
                    const existingRuleOutNode = this.graph.getNextNodeExactlyOne(existingRule, {type: 'out'});
                    console.log("NYI: apply existing rule w/output:", existingRuleOutNode);
                } else {
                    throw new Error(`NYI: no rule found`);
                }
            } else {
                console.log("Skipping empty value node: ", valueNode);
            }
        }
    }
}
