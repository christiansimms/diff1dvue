import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodeBase.ts';

export class RuleNode extends NodeBase {
    constructor(public graph: DiGraph) {
        super();
    }

    evaluateScore() {
        this.isDone = true;
    }

    getLabel(): string {
        return `RuleNode - score ${this.score}`;
    }

    doStep(): void {
        super.doStep();
    }
}
