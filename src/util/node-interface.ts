
export interface Node {
    id: number;
    score: number;
    isDone: boolean;
    getLabel(): string;
    doStep(): void;
}