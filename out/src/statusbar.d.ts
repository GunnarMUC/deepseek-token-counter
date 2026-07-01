export declare class TokenStatusBar {
    private item;
    private showDetailsCommand;
    constructor(showDetailsCommand: string);
    update(tokenCount: number, modelName: string, totalCost: number): void;
    hide(): void;
    show(): void;
    dispose(): void;
}
