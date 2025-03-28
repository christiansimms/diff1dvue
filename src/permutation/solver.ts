
import {freeze} from "icepick";

export interface StateNode {
    type?: string;
    children?: StateNode[];
}

export interface State extends StateNode {
    // type: "root";
    currentPos: string[];
    // children?: StateNode[];
}

export type Action = (state: State) => State;
export type Constraint = (state: State) => number;

// Deterministic rand, copied from: https://gist.github.com/mathiasbynens/5670917
let seed = 0x2F6E2B1;

function deterministicRandom() {
    // Robert Jenkins’ 32 bit integer hash function
    seed = ((seed + 0x7ED55D16) + (seed << 12)) & 0xFFFFFFFF;
    seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
    seed = ((seed + 0x165667B1) + (seed << 5)) & 0xFFFFFFFF;
    seed = ((seed + 0xD3A2646C) ^ (seed << 9)) & 0xFFFFFFFF;
    seed = ((seed + 0xFD7046C5) + (seed << 3)) & 0xFFFFFFFF;
    seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
    return (seed & 0xFFFFFFF) / 0x10000000;
}


function randomIntFromInterval(min: number, max: number) {
    return Math.floor(deterministicRandom() * (max - min + 1) + min);
}

const MaxIters = 10;

export class Solver {
    done: boolean;
    constructor(public actions: Action[], public constraints: Constraint[]) {
        this.actions = actions;
        this.constraints = constraints;
        // this.constraintResults = []; // array of numbers between 0 and 1
        this.done = false;
    }

    solve() {
        console.log("Starting solve()");
        const initialState: State = freeze({type: "root", currentPos: []});
        const stateActionStack: {state: State, action: Action}[] = [{state: initialState, action: undefined!}];
        let count = 0;
        console.log(`Initial state: ${JSON.stringify(stateActionStack[0].state, null, 2)}`);
        while (!this.done) {
            const currentEntry = stateActionStack[stateActionStack.length-1];
            const {state} = currentEntry;
            const newAction = this.pickAction(state);
            console.log("Picked action:", newAction.name);
            const newState = this.runAction(state, newAction);
            console.log(`Step: ${count}, after action: ${newAction.name}, state is: ${JSON.stringify(newState, null, 2)}`);
            // console.log(`Step: ${count}, state: ${newState}`);
            stateActionStack.push({state: newState, action: newAction});
            count++;
            if (count >= MaxIters) {
                console.log(`We hit the count without success -- ${count}`);
                return;
            }
        }
        console.log("Success!");
    }

    evaluateConstraints(state: State) {
        const constraintResults = this.constraints.map(constraint => {
            return constraint(state);
        });
        this.done = constraintResults.every(result => result === 0);
    }

    pickAction(_state: State) {
        let index = randomIntFromInterval(0, this.actions.length - 1);
        // this.transcript.push('Rolling the dice, got a: ' + index);
        return this.actions[index];
    }

    runAction(oldState: State, action: Action) {
        const newState = action(oldState);
        this.evaluateConstraints(newState);
        return newState;
    }
}