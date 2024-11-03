import {DiGraph} from './digraph.ts';
import {ContainerNode, MatcherNode, ValueNode} from './nodes.ts';

export class Runner {
    graph = new DiGraph();
    inputBeforeNodes: ValueNode[] = [];
    inputAfterNodes: ValueNode[] = [];
    matcherNodes: MatcherNode[] = [];
    rootNode?: ContainerNode;

    constructor(public before: string[], public after: string[]) {
    }

    installMatchers() {
        console.log("installMatchers");
        // Install before.
        this.inputBeforeNodes = [];
        let lastNode: ValueNode | undefined = undefined;
        for (const [index, char] of this.before.entries()) {
            const n = new ValueNode(char, `In.${index}`);
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
            const n = new ValueNode(char, `Out.${index}`);
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

    doStep() {
        const nodes = this.graph.nodeArray();
        for (const node of nodes) {
            node.doStep();
        }
    }

}