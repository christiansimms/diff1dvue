import {getIn, setIn} from 'icepick';
import {Action, Constraint, Solver, State, StateNode} from './solver.ts';


function treeDepth(state: State) {
    let depth = 1;

    function recursive(node: StateNode, currentDepth: number) {
        node.children?.forEach(child => {
            recursive(child, currentDepth + 1);
        });
        if (currentDepth > depth) {
            depth = currentDepth;
        }
    }

    recursive(state, 1);
    return depth;
}

// Define some constraints so they're easier to read.
// const OneLevelDeep = (state) => treeDepth(state) - 1;
// const TwoLevelsDeep = (state) => treeDepth(state) - 2;
const ThreeLevelsDeep = (state: State) => treeDepth(state) - 3;

// Make solver.
const actions: Action[] = [
    function addChild(state: State) {
        const currentPos = getIn(state, ["currentPos"]); // state.currentPos;  // could also do: state.getIn("currentPos");
        // console.log("DEBUG: currentPos:", currentPos);
        state = setIn(state, ["currentPos"], [...currentPos, "children", 0]);
        state = setIn(state, [...currentPos, "children"], [{type: "new"}]);
        return state;
    },
    function setPerson(state: State) {
        const currentPos = getIn(state, ["currentPos"]);
        // console.log("DEBUG: currentPos:", currentPos);
        state = setIn(state, [...currentPos, "type"], "person");
        return state;
    },
];
const constraints: Constraint[] = [ThreeLevelsDeep];
// const constraints = [TwoLevelsDeep];
// const constraints = [OneLevelDeep];

function simple() {
    const solver = new Solver(actions, constraints);
    solver.solve();
}

console.log("Starting permutation tests");
simple();
console.log("Done permutation tests");
