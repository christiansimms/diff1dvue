import {DiGraph} from './digraph.ts';
import {NodeBase, ObjectNode} from './nodes.ts';

export class RuleNode extends NodeBase {
    workQueue: ObjectNode[] = [];
    constructor(public graph: DiGraph) {
        super();
    }

    evaluateScore() {
    }

    getLabel(): string {
        return `RuleNode - score ${this.score}`;
    }

    doStep(): void {
        super.doStep();
    }
}
