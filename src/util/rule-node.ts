import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodes.ts';

export class RuleNode extends NodeBase {
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
