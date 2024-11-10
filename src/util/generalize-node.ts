import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodeBase.ts';
import {Node} from './node-interface.ts';
import {ValueNode} from './nodes.ts';
import {ObjectNode} from './object-node.ts';
import {RuleNode} from './rule-node.ts';

function findRuleForNode(graph: DiGraph, startNode: Node, inputValueNode: ValueNode): Node | undefined {
    const possibleRules = graph.getNextNodes(startNode, {type: 'rule'});
    for(const rule of possibleRules) {
        const ruleInNode = graph.getNextNode(rule, {type: 'in'});
        if (ruleInNode && ruleInNode.value === inputValueNode.value) { // TODO .value
            return rule;
        }
    }
    return undefined;
}

function areRuleOutputsSame(existingRuleOutNode: ObjectNode, objectNode: ObjectNode): boolean {
    return existingRuleOutNode.type === objectNode.type && existingRuleOutNode.delta === objectNode.delta;
}

export class GeneralizeNode extends NodeBase {
    workQueue: ObjectNode[] = [];
    workQueueSize = 0;
    constructor(public graph: DiGraph) {
        super();

        this.workQueue = this.graph.nodeArray().filter(n => n instanceof ObjectNode);
        this.workQueueSize = this.workQueue.length;
        console.log("FOUND objects", this.workQueue);
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
            console.log("GN looking at: ", objectNode);
            if (!objectNode) {
                throw new Error(`Expected object node but found none.`);
            }

            // Make it a child of this node.
            this.graph.addEdge(this, objectNode, {type: 'child'});

            // Combine it.
            if (!objectNode.inputValueNode) {
                throw new Error(`NYI when objectNode has no inputValueNode.`);
            }
            const existingRule = findRuleForNode(this.graph, this, objectNode.inputValueNode);
            console.log("Found existing rule: ", existingRule);
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
                const rule = new RuleNode(this.graph);
                this.graph.addEdge(this, rule, {type: 'rule'});
                this.graph.addEdge(rule, objectNode.inputValueNode, {type: 'in'});
                this.graph.addEdge(rule, objectNode, {type: 'out'});
            }
        }
    }
}
