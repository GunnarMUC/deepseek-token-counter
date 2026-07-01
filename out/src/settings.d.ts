import * as vscode from 'vscode';
import { ModelConfig } from './models';
export declare function getConfiguration(): vscode.WorkspaceConfiguration;
export declare function getPreferredModelId(): string;
export declare function getAssumeOutputRatio(): number;
export declare function getCustomModels(): ModelConfig[];
export declare function getActiveModelConfig(): ModelConfig;
export declare function getAllModels(): ModelConfig[];
