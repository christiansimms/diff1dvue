import {DiGraph} from './digraph.ts';
import {addNodeAttribute} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';

export class ValueNode extends NodeBase {
    constructor(public graph: DiGraph, public value: string, public extraLabel: string, public pos: number) {
        super();
        addNodeAttribute(this.graph, this, String(pos), 'pos');
        addNodeAttribute(this.graph, this, value, 'value');
        this.score = 1;
        this.isDone = true;
    }

    evaluateScore() {
    }

    getLabel(): string {
        return `ValueNode(${this.value})\n${this.extraLabel}`;
    }
}