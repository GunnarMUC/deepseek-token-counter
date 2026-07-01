export interface ModelConfig {
    id: string;
    name: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
}
export declare const DEFAULT_MODELS: ModelConfig[];
export declare function calculateCost(inputTokens: number, outputTokens: number, model: ModelConfig): {
    inputCost: number;
    outputCost: number;
    totalCost: number;
};
