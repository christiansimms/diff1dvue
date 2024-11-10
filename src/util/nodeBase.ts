import {Node} from './node-interface.ts';

let NodeId = 0;

export class NodeBase implements Node {
    score = 0;
    id = NodeId++;
    isDone = false;

    constructor() {
    }

    evaluateScore() {
        throw new Error(`Method not implemented on class: ${this.constructor.name}.`);
    }

    getLabel(): string {
        throw new Error(`Method not implemented on class: ${this.constructor.name}.`);
    }

    doStep(): void {
        this.evaluateScore();
    }
}