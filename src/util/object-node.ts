import {DiGraph} from './digraph.ts';
import {addNodeAttribute} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';
import {ValueNode} from './nodes.ts';

export class ObjectNode extends NodeBase {
    constructor(public graph: DiGraph, public value: string, public type: string, public delta: string, public inputValueNode?: ValueNode) {
        super();
        addNodeAttribute(this.graph, this, value, 'value');
        addNodeAttribute(this.graph, this, type, 'type');
        addNodeAttribute(this.graph, this, delta, 'delta');
        if (inputValueNode) {
            this.graph.addEdge(this, inputValueNode, {type: 'input-value'});
        }
    }

    evaluateScore() {
        this.score = 1;
        this.isDone = true;
    }

    getLabel(): string {
        return `ObjectNode ${this.type} - score ${this.score} - id: ${this.id}`;
    }
}