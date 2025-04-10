import {Node} from './nodeInterface.ts';

export interface EdgeAttr {
    type: string;
}

// Mimic: https://github.com/fkling/JSNetworkX/blob/master/src/classes/DiGraph.js
export class DiGraph {
    constantNodeCache: Map<string, Node> = new Map();
    succ: Map<Node, Map<Node, EdgeAttr>> = new Map();
    pred: Map<Node, Map<Node, EdgeAttr>> = new Map();
    // adj = this.succ;  // everybody does this

    constructor() {
    }

    addNode(n: Node) {
        if (!this.succ.has(n)) {
            this.succ.set(n, new Map());
            this.pred.set(n, new Map());
        }
    }

    addEdge(u: Node, v: Node, edgeAttr: EdgeAttr) {
        // add nodes
        if (!this.succ.has(u)) {
            this.succ.set(u, new Map());
            this.pred.set(u, new Map());
        }

        if (!this.succ.has(v)) {
            this.succ.set(v, new Map());
            this.pred.set(v, new Map());
        }

        // add the edge
        // const datadict = this.adj.get(u)!.get(v) || {};
        // Object.assign(datadict, edgeAttr);
        const datadict: EdgeAttr = {...edgeAttr};
        this.succ.get(u)!.set(v, datadict);
        this.pred.get(v)!.set(u, datadict);
    }

    removeEdge(u: Node, v: Node) {
        this.succ.get(u)!.delete(v);
        this.pred.get(v)!.delete(u);
    }

    nodeArray(): Node[] {
        return Array.from(this.succ.keys());
    }

    successors(n: Node): Node[] {
        const nbrs = this.succ.get(n);
        if (nbrs !== undefined) {
            return Array.from(nbrs.keys());
        }
        throw new Error(`The node ${n} is not in the digraph.`);
    }

    getNextNodes(n: Node, edgeAttrParam?: EdgeAttr): Node[] {
        const out: Node[] = [];
        const nbrs = this.succ.get(n);
        if (!nbrs) {
            throw new Error(`The node ${n} is not in the graph.`);
        }
        for (const [v, edgeAttr] of nbrs.entries()) {
            if (!edgeAttrParam || edgeAttrParam.type === edgeAttr.type) {
                out.push(v);
            }
        }
        return out;
    }

    getNextNode(n: Node, edgeAttr?: EdgeAttr): Node | undefined {
        const nodes = this.getNextNodes(n, edgeAttr);
        if (nodes.length === 1) {
            return nodes[0];
        } else if (nodes.length > 1) {
            throw new Error(`Expected only one Next node, but found ${nodes.length}.`);
        }
        return undefined;
    }

    getNextNodeExactlyOne(n: Node, edgeAttr?: EdgeAttr): Node {
        const node = this.getNextNode(n, edgeAttr);
        if (!node) {
            throw new Error(`Expected one node, but found none.`);
        }
        return node;
    }

    getPreviousNodes(n: Node, edgeAttrParam?: EdgeAttr): Node[] {
        const out: Node[] = [];
        const nbrs = this.pred.get(n);
        if (!nbrs) {
            throw new Error(`The node ${n} is not in the graph.`);
        }
        for (const [v, edgeAttr] of nbrs.entries()) {
            if (!edgeAttrParam || edgeAttrParam.type === edgeAttr.type) {
                out.push(v);
            }
        }
        return out;
    }

    getPreviousNode(n: Node, edgeAttr?: EdgeAttr): Node | undefined {
        const nodes = this.getPreviousNodes(n, edgeAttr);
        if (nodes.length === 1) {
            return nodes[0];
        } else if (nodes.length > 1) {
            throw new Error(`Expected only one previous node, but found ${nodes.length}.`);
        }
        return undefined;
    }

    getPreviousNodeExactlyOne(n: Node, edgeAttr?: EdgeAttr): Node {
        const node = this.getPreviousNode(n, edgeAttr);
        if (!node) {
            throw new Error(`Expected one node, but found none.`);
        }
        return node;
    }

    removeNode(n: Node): void {
      const nbrs = this.succ.get(n);
      for (const [u, _edgeAttr] of nbrs!.entries()) {
        this.pred.get(u)!.delete(n); // remove all edges n-u in digraph
      }
      this.succ.delete(n); // remove node from succ

      const nbrs2 = this.pred.get(n);
      for (const [u, _edgeAttr] of nbrs2!.entries()) {
        this.succ.get(u)!.delete(n); // remove all edges n-u in digraph
      }
      this.pred.delete(n); // remove node from pred
    }

    getNextEdges(n: Node): [Node, EdgeAttr][] {
        const out: [Node, EdgeAttr][] = [];
        const nbrs = this.succ.get(n);
        if (!nbrs) {
            throw new Error(`The node ${n} is not in the graph.`);
        }
        for (const [v, edgeAttr] of nbrs.entries()) {
            out.push([v, edgeAttr]);
        }
        return out;
    }

    getAllNodes() {
        // Compute edges.
        const seenIds = new Set<number>();
        const displayEdges: any[] = [];
        for (const [u, nbrs] of this.succ) {
            for (const [v, edgeAttr] of nbrs.entries()) {
                if (edgeAttr.type === 'child') {
                    displayEdges.push({from: u.id, to: v.id});
                    seenIds.add(u.id);
                    seenIds.add(v.id);
                }
            }
        }

        // Make list. Convert to simple objects since using Node class in DataSet seems to cause problems.
        const displayNodes = this.nodeArray().filter(node => seenIds.has(node.id)).map(node => {
            return {id: node.id, label: node.getLabel()}
        });

        // Return data.
        // console.log('getAllNodesInPlane: ', displayNodes, displayEdges);
        return {
            nodes: displayNodes,
            edges: displayEdges
        };

    }

    log(_node: Node, _message: string) {
        console.log(`Node ${_node.id}: ${_message}`);
    }
}