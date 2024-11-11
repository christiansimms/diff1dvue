import {Runner} from './runner.ts';

function prettyBlock(s: string[]): string {
    return '[' + s.map(s => s ? s : ' ').join('') + ']';
}

function simple(before: string[], after: string[]) {
    const runner = new Runner(before, after, []);
    const stepsCompleted = runner.runUntilDone(10);
    if (stepsCompleted) {
        console.log(`Success: ${prettyBlock(before)} -> ${prettyBlock(after)}`);
    } else {
        throw new Error(`Test failed: ${prettyBlock(before)} -> ${prettyBlock(after)}`);
    }
}

console.log("Starting simple tests");
simple(['a', ''], ['', 'a']);
simple(['a', '', ''], ['', '', 'a']);
simple(['a', '', '', '', ''], ['', '', '', '', 'a']);
console.log("Done simple tests");
