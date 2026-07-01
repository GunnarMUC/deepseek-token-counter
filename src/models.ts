export interface ModelConfig {
  id: string;
  name: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
}

export const DEFAULT_MODELS: ModelConfig[] = [
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

const MILLION = 1_000_000;

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: ModelConfig
): { inputCost: number; outputCost: number; totalCost: number } {
  const inputCost = (inputTokens / MILLION) * model.inputPricePer1M;
  const outputCost = (outputTokens / MILLION) * model.outputPricePer1M;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}
