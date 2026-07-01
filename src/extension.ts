import * as vscode from 'vscode';
import { loadTokenizer, countTokens, isTokenizerLoaded } from './deepseek/tokenizer';
import { calculateCost } from './models';
import {
  getActiveModelConfig,
  getAllModels,
  getAssumeOutputRatio,
  getPreferredModelId,
} from './settings';
import { TokenStatusBar } from './statusbar';

let statusBar: TokenStatusBar;

export function activate(context: vscode.ExtensionContext) {
  statusBar = new TokenStatusBar('deepseekTokenCounter.showDetails');

  try {
    loadTokenizer(context.extensionPath);
  } catch (e) {
    vscode.window.showErrorMessage(
      `DeepSeek Token Counter: Failed to load tokenizer. ${e instanceof Error ? e.message : String(e)}`
    );
    return;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('deepseekTokenCounter.selectModel', async () => {
      const models = getAllModels();
      const items = models.map((m) => ({
        label: m.name,
        description: `$${m.inputPricePer1M}/$${m.outputPricePer1M} per 1M tokens`,
        detail: m.id,
      }));

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a DeepSeek model',
      });

      if (picked) {
        const config = vscode.workspace.getConfiguration('deepseekTokenCounter');
        await config.update('preferredModel', picked.detail, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`DeepSeek model set to: ${picked.label}`);
        updateStatusBar();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('deepseekTokenCounter.showDetails', () => {
      showDetails();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => updateStatusBar())
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => updateStatusBar())
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('deepseekTokenCounter')) {
        updateStatusBar();
      }
    })
  );

  context.subscriptions.push(statusBar);

  updateStatusBar();
}

function updateStatusBar(): void {
  if (!isTokenizerLoaded()) {
    statusBar.hide();
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    statusBar.hide();
    return;
  }

  const text = editor.document.getText();
  if (!text || text.trim().length === 0) {
    statusBar.hide();
    return;
  }

  const totalTokens = countTokens(text);
  const model = getActiveModelConfig();
  const outputRatio = getAssumeOutputRatio();

  const outputTokens = Math.round(totalTokens * outputRatio);
  const inputTokens = totalTokens - outputTokens;

  const { totalCost } = calculateCost(inputTokens, outputTokens, model);

  statusBar.show();
  statusBar.update(totalTokens, model.name, totalCost);
}

function showDetails(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor.');
    return;
  }

  const text = editor.document.getText();
  if (!text || text.trim().length === 0) {
    vscode.window.showWarningMessage('Editor is empty.');
    return;
  }

  const totalTokens = countTokens(text);
  const model = getActiveModelConfig();
  const outputRatio = getAssumeOutputRatio();

  const outputTokens = Math.round(totalTokens * outputRatio);
  const inputTokens = totalTokens - outputTokens;

  const { inputCost, outputCost, totalCost } = calculateCost(
    inputTokens,
    outputTokens,
    model
  );

  const lines = [
    `Model: ${model.name}`,
    `Tokens: ${totalTokens.toLocaleString('en-US')}`,
    `Input Tokens: ${inputTokens.toLocaleString('en-US')} (${((1 - outputRatio) * 100).toFixed(0)}%)`,
    `Output Tokens: ${outputTokens.toLocaleString('en-US')} (${(outputRatio * 100).toFixed(0)}%)`,
    ``,
    `Input Cost: $${inputCost.toFixed(6)}`,
    `Output Cost: $${outputCost.toFixed(6)}`,
    `Total Cost: $${totalCost.toFixed(6)}`,
  ];

  vscode.window.showInformationMessage(lines.join('\n'), { modal: false });
}

export function deactivate(): void {
  if (statusBar) {
    statusBar.dispose();
  }
}
