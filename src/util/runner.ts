import {DiGraph} from './digraph.ts';
import {MatcherNode, ValueNode} from './nodes.ts';

export class Runner {
    graph = new DiGraph();
    inputBeforeNodes: ValueNode[] = [];
    inputAfterNodes: ValueNode[] = [];
    matcherNodes: MatcherNode[] = [];

    // rootNode?: ContainerNode;

    constructor(public before: string[], public after: string[]) {
    }

    installMatchers() {
        console.log("installMatchers");
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

        // Install matchers.
        this.matcherNodes = [];
        for (let index = 0; index < this.inputBeforeNodes.length; index++) {
            const n = new MatcherNode(this.graph, this.inputBeforeNodes[index], this.inputAfterNodes[index]);
            this.graph.addNode(n);
            this.matcherNodes.push(n);
        }

        // Top level.
        // this.rootNode = new ContainerNode(this.graph, this.matcherNodes);
    }

    // Return true if all done.
    doStep(): boolean {
        const nodes = this.graph.nodeArray();
        for (const node of nodes) {
            node.doStep();
        }
        const doneNodes = nodes.filter(node => node.isDone);
        console.log(`Done / total = ${doneNodes.length} / ${nodes.length}`);
        return doneNodes.length === nodes.length;
    }

    // If done then return number of steps, otherwise return undefined.
    runUntilDone(limit: number): number | undefined {
        for (let i = 0; i < limit; i++) {
            const isDone = this.doStep();
            if (isDone) {
                return i + 1;
            }
        }
        return undefined;
    }
}