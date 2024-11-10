import {Node} from './node-interface.ts';
import {DiGraph} from './digraph.ts';
import {NodeBase} from './nodeBase.ts';

export class RuleNode extends NodeBase {
    constructor(public graph: DiGraph, public inNode: Node, public outNode: Node) {
        super();
        this.graph.addEdge(this, inNode, {type: 'in'});
        this.graph.addEdge(this, outNode, {type: 'out'});
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
