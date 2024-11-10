import {ApplyRulesNode} from './applyRulesNode.ts';
import {DiGraph} from './digraph.ts';
import {GeneralizeNode} from './generalizeNode.ts';
import {MatcherNode} from './matcherNode.ts';
import {ValueNode} from './valueNode.ts';

export class Runner {
    graph = new DiGraph();
    inputBeforeNodes: ValueNode[] = [];
    inputAfterNodes: ValueNode[] = [];
    matcherNodes: MatcherNode[] = [];
    generalizeNode?: GeneralizeNode;
    applyRulesNode?: ApplyRulesNode;
    inputBeforeNodes2: ValueNode[] = [];
    outputAfterNodes2: ValueNode[] = [];

    // rootNode?: ContainerNode;

    constructor(public before: string[], public after: string[], public before2: string[]) {
    }

    installMatchers() {
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

    installGeneralize() {
        this.generalizeNode = new GeneralizeNode(this.graph);
        this.graph.addNode(this.generalizeNode);
    }

    installApplyRules() {
        // Install before.
        this.inputBeforeNodes2 = [];
        let lastNode: ValueNode | undefined = undefined;
        for (const [index, char] of this.before2.entries()) {
            const n = new ValueNode(this.graph, char, `In.${index}`, index);
            this.graph.addNode(n);
            this.inputBeforeNodes2.push(n);
            if (lastNode) {
                this.graph.addEdge(lastNode, n, {type: 'seq'});
            }
            lastNode = n;
        }
        // Install after.
        this.outputAfterNodes2 = [];
        lastNode = undefined;
        for (const [index, char] of this.after.entries()) {
            const n = new ValueNode(this.graph, char, `Out.${index}`, index);
            this.graph.addNode(n);
            this.outputAfterNodes2.push(n);
            if (lastNode) {
                this.graph.addEdge(lastNode, n, {type: 'seq'});
            }
            lastNode = n;
        }

        this.applyRulesNode = new ApplyRulesNode(this.graph, this.generalizeNode!, this.inputBeforeNodes2, this.outputAfterNodes2);
        this.graph.addNode(this.applyRulesNode);
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
    runUntilDone(stepLimit: number, shouldGeneralize = false, shouldApplyRules = false): number | undefined {
        let alreadyGeneralized = false;
        let alreadyAppliedRules = false;
        for (let i = 0; i < stepLimit; i++) {
            const isDone = this.doStep();
            if (isDone) {
                if (shouldGeneralize && !alreadyGeneralized) {
                    this.installGeneralize();
                    alreadyGeneralized = true;
                } else if (shouldApplyRules && !alreadyAppliedRules) {
                    this.installApplyRules();
                    alreadyAppliedRules = true;
                } else {
                    return i + 1;
                }
            }
        }
        return undefined;
    }
}