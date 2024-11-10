import {DiGraph} from './digraph.ts';
import {addNodeAttribute} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';

export class OutputNode extends NodeBase {
    constructor(public graph: DiGraph, public value: string, public pos: number) {
        super();
        addNodeAttribute(this.graph, this, String(pos), 'pos');
        addNodeAttribute(this.graph, this, value, 'value');
        this.score = 1;
        this.isDone = true;
    }

    evaluateScore() {
    }

    getLabel(): string {
        return `OutputNode(${this.value})\npos=${this.pos}`;
    }
}