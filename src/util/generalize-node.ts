import {DiGraph} from './digraph.ts';
import {NodeBase, ObjectNode} from './nodes.ts';

export class GeneralizeNode extends NodeBase {
    constructor(public graph: DiGraph) {
        super();

        const nodes = this.graph.nodeArray().filter(n => n instanceof ObjectNode);
        console.log("FOUND objects", nodes);
    }

    evaluateScore() {
    }

    getLabel(): string {
        return `GeneralizeNode - score ${this.score}`;
    }

    doStep(): void {
        super.doStep();
        console.log("GeneralizeNode doStep");

        // Find next object node.
        // Combine it.
    }
}
