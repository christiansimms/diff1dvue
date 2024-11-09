import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodes.ts';
import {ObjectNode} from './object-node.ts';

export class GeneralizeNode extends NodeBase {
    workQueue: ObjectNode[] = [];
    constructor(public graph: DiGraph) {
        super();

        this.workQueue = this.graph.nodeArray().filter(n => n instanceof ObjectNode);
        console.log("FOUND objects", this.workQueue);
    }

    evaluateScore() {
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
            // const existingRule = findRuleForNode(this.graph, objectNode);
        }
    }
}
