import {DiGraph} from '../util/digraph.ts';
import {ValueNode} from '../util/valueNode.ts';

export class Runner {
    graph = new DiGraph();
    inputBeforeNodes: ValueNode[] = [];
    inputAfterNodes: ValueNode[] = [];

    constructor(public before: string[], public after: string[]) {
        this.installInputs();
    }

    installInputs() {
        // Install before.
        this.inputBeforeNodes = [];
        let lastNode: ValueNode | undefined = undefined;
        for (const [index, char] of this.before.entries()) {
            const n = new ValueNode(this.graph, char, `In.${index}`, index);
            this.graph.addNode(n);
            this.inputBeforeNodes.push(n);
            if (lastNode) {
                this.graph.addEdge(lastNode, n, {type: 'seq'});
            }
            lastNode = n;
        }
        // Install after.
        this.inputAfterNodes = [];
        lastNode = undefined;
        for (const [index, char] of this.after.entries()) {
            const n = new ValueNode(this.graph, char, `Out.${index}`, index);
            this.graph.addNode(n);
            this.inputAfterNodes.push(n);
            if (lastNode) {
                this.graph.addEdge(lastNode, n, {type: 'seq'});
            }
            lastNode = n;
        }

    }

    // Return true if all done.
    doStep(): boolean {
        const nodes = this.graph.nodeArray();
        for (const node of nodes) {
            node.doStep();
        }
        const doneNodes = nodes.filter(node => node.isDone);
        // console.log(`Done / total = ${doneNodes.length} / ${nodes.length}`);
        return doneNodes.length === nodes.length;
    }

    // If done then return number of steps, otherwise return undefined.
    runUntilDone(stepLimit: number): number | undefined {
        for (let i = 0; i < stepLimit; i++) {
            const isDone = this.doStep();
            if (isDone) {
                return i + 1;
            }
        }
        return undefined;
    }
}