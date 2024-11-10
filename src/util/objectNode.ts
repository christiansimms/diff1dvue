import {DiGraph} from './digraph.ts';
import {addNodeAttribute} from './graph-helper.ts';
import {NodeBase} from './nodeBase.ts';

import {ValueNode} from './valueNode.ts';

export type ObjectNodeType = 'stay' | 'move' | 'gone' | 'appear';

export class ObjectNode extends NodeBase {
    constructor(public graph: DiGraph, public value: string, public type: ObjectNodeType, public delta: string, public inputValueNode?: ValueNode) {
        super();
        addNodeAttribute(this.graph, this, value, 'value');
        addNodeAttribute(this.graph, this, type, 'type');
        addNodeAttribute(this.graph, this, delta, 'delta');
        if (inputValueNode) {
            this.graph.addEdge(this, inputValueNode, {type: 'input-value'});
        }
        this.score = 1;
        this.isDone = true;
    }

    evaluateScore() {
    }

    getLabel(): string {
        return `ObjectNode ${this.type}${this.delta} - score ${this.score} - id: ${this.id}`;
    }
}