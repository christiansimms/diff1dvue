import {DiGraph} from './digraph.ts';
import {areRuleOutputsSame, findRuleForNode} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';
import {ObjectNode} from './objectNode.ts';
import {RuleNode} from './ruleNode.ts';

export class GeneralizeNode extends NodeBase {
    workQueue: ObjectNode[] = [];
    workQueueSize = 0;
    constructor(public graph: DiGraph) {
        super();

        this.workQueue = this.graph.nodeArray().filter(n => n instanceof ObjectNode);
        this.workQueueSize = this.workQueue.length;
        // console.log("FOUND objects", this.workQueue);
        if (this.workQueueSize === 0) {
            throw new Error(`Expected at least one object node.`);
        }
    }

    evaluateScore() {
        this.score = (this.workQueueSize - this.workQueue.length) / this.workQueueSize;
    }

    getLabel(): string {
        return `GeneralizeNode - score ${this.score}`;
    }

    doStep(): void {
        super.doStep();

        if (this.workQueue?.length === 0) {
            this.isDone = true;
        } else {
            // Find next object node.
            const objectNode = this.workQueue.pop();
            if (!objectNode) {
                throw new Error(`Expected object node but found none.`);
            }
            this.graph.log(this, `GN looking at: ${objectNode.id}`);

            // Make it a child of this node.
            this.graph.addEdge(this, objectNode, {type: 'child'});

            // Combine it.
            if (!objectNode.inputValueNode) {
                throw new Error(`NYI when objectNode has no inputValueNode.`);
            }
            const existingRule = findRuleForNode(this.graph, this, objectNode.inputValueNode);
            this.graph.log(this, `Found existing rule: ${existingRule}`);
            if (existingRule) {
                // Detect conflict.
                const existingRuleOutNode = this.graph.getNextNodeExactlyOne(existingRule, {type: 'out'});
                const ruleOutputsAreSame = areRuleOutputsSame(existingRuleOutNode as ObjectNode, objectNode);
                if (!ruleOutputsAreSame) {
                    console.error(`Conflict detected: ${existingRuleOutNode} and ${objectNode} have different outputs.`);
                    this.isDone = true;
                }
            }
            if (!existingRule) {
                // Create new rule.
                const rule = new RuleNode(this.graph, objectNode.inputValueNode, objectNode);
                this.graph.addEdge(this, rule, {type: 'rule'});
            }
        }
    }
}
