import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodeBase.ts';

export class ConstantNode extends NodeBase {
    constructor(public _graph: DiGraph, public value: string) {
        super();
        this.score = 1;
        this.isDone = true;
    }

    evaluateScore() {
    }

    getLabel(): string {
        return `ConstantNode(${this.value})`;
    }
}