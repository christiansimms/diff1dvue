import {OutputNode} from './outputNode.ts';
import {Runner} from './runner.ts';

function prettyBlock(s: string[]): string {
    return '[' + s.map(s => s ? s : '_').join('') + ']';
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

function full(before: string[], after: string[], before2: string[], after2Expected: string[]) {
    const runner = new Runner(before, after, before2);
    const stepsCompleted = runner.runUntilDone(10, true, true);
    if (stepsCompleted) {
        const outputNodes = runner.graph.nodeArray().filter(n => n instanceof OutputNode);
        const after2Array = outputNodes.map(n => n.getOutputValue());
        const after2Str = after2Array.join('');
        const after2ExpectedStr = after2Expected.join('');
        if (after2Str === after2ExpectedStr) {
            console.log(`Success: ${prettyBlock(before2)} -> ${prettyBlock(after2Array)}`);
        } else {
            throw new Error(`Test failed: ${prettyBlock(before2)} -> ${prettyBlock(after2Array)}: ${after2Str} != ${after2ExpectedStr}`);
        }
    } else {
        throw new Error(`Test failed: ${prettyBlock(before)} -> ${prettyBlock(after)}`);
    }
}

console.log("Starting simple parsing tests");
simple(['a', ''], ['', 'a']);
simple(['a', '', ''], ['', '', 'a']);
simple(['a', '', '', '', ''], ['', '', '', '', 'a']);
console.log("Done\n");

console.log("Starting full tests");
full(['a', ''], ['', 'a'], ['', 'a', ''], ['', '', 'a']);
console.log("Done full tests");
