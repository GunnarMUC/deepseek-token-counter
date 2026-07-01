"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MODELS = void 0;
exports.calculateCost = calculateCost;
exports.DEFAULT_MODELS = [
    {
        id: 'deepseek-chat',
        name: 'DeepSeek-V3',
        inputPricePer1M: 0.27,
        outputPricePer1M: 1.10,
    },
    {
        id: 'deepseek-reasoner',
        name: 'DeepSeek-R1',
        inputPricePer1M: 0.55,
        outputPricePer1M: 2.19,
    },
    {
        id: 'deepseek-coder',
        name: 'DeepSeek-Coder V2',
        inputPricePer1M: 0.14,
        outputPricePer1M: 0.28,
    },
    {
        id: 'deepseek-chat-v2',
        name: 'DeepSeek-V2',
        inputPricePer1M: 0.14,
        outputPricePer1M: 0.28,
    },
];
const MILLION = 1000000;
function calculateCost(inputTokens, outputTokens, model) {
    const inputCost = (inputTokens / MILLION) * model.inputPricePer1M;
    const outputCost = (outputTokens / MILLION) * model.outputPricePer1M;
    return {
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
    };
}
//# sourceMappingURL=models.js.map