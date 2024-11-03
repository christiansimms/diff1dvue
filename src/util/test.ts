import {Runner} from './runner.ts';

function simple(before: string[], after: string[]) {
    const runner = new Runner(before, after);
    runner.installMatchers();
    runner.doStep();
    runner.doStep();
    runner.doStep();

}

console.log("Starting tests");
simple(['a', ''], ['', 'a']);
console.log("Done tests");
