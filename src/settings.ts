import * as vscode from 'vscode';
import { ModelConfig, DEFAULT_MODELS } from './models';

export function getConfiguration() {
  return vscode.workspace.getConfiguration('deepseekTokenCounter');
}

export function getPreferredModelId(): string {
  return getConfiguration().get<string>('preferredModel', 'deepseek-chat');
}

export function getAssumeOutputRatio(): number {
  const ratio = getConfiguration().get<number>('assumeOutputRatio', 0);
  return Math.max(0, Math.min(1, ratio));
}

export function getCustomModels(): ModelConfig[] {
  const raw = getConfiguration().get<ModelConfig[]>('models', []);
  return raw.map((m) => ({
    id: m.id || 'unknown',
    name: m.name || m.id || 'Unknown',
    inputPricePer1M: m.inputPricePer1M ?? 0,
    outputPricePer1M: m.outputPricePer1M ?? 0,
  }));
}

export function getActiveModelConfig(): ModelConfig {
  const preferred = getPreferredModelId();
  const custom = getCustomModels();

  const fromCustom = custom.find((m) => m.id === preferred);
  if (fromCustom) {
    return fromCustom;
  }

  const fromDefault = DEFAULT_MODELS.find((m) => m.id === preferred);
  return fromDefault || DEFAULT_MODELS[0];
}

export function getAllModels(): ModelConfig[] {
  const custom = getCustomModels();
  const customIds = new Set(custom.map((m) => m.id));
  const merged = custom.concat(DEFAULT_MODELS.filter((m) => !customIds.has(m.id)));
  return merged;
}
