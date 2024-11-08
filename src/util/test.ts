import {Runner} from './runner.ts';

function simple(before: string[], after: string[]) {
    const runner = new Runner(before, after);
    runner.installMatchers();
    const stepsCompleted = runner.runUntilDone(10);
    if (stepsCompleted) {
        console.log("Success");
    } else {
        throw new Error(`Test failed: ${before} -> ${after}`);
    }
}

console.log("Starting tests");
simple(['a', ''], ['', 'a']);
console.log("Done tests");
