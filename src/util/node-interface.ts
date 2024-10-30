
export interface Node {
    id: number;
    score: number;
    getLabel(): string;
    doStep(): void;
}