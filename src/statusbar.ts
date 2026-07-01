import * as vscode from 'vscode';

export class TokenStatusBar {
  private item: vscode.StatusBarItem;
  private showDetailsCommand: string;

  constructor(showDetailsCommand: string) {
    this.showDetailsCommand = showDetailsCommand;
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.item.command = this.showDetailsCommand;
    this.item.tooltip = 'Click for DeepSeek token details';
    this.item.show();
  }

  update(
    tokenCount: number,
    modelName: string,
    totalCost: number
  ): void {
    const tokensStr = formatTokens(tokenCount);
    const costStr = formatCost(totalCost);
    this.item.text = `DeepSeek: ${tokensStr} | ~${costStr}`;
    this.item.tooltip =
      `Model: ${modelName}\nTokens: ${tokenCount.toLocaleString('en-US')}\nCost: $${totalCost.toFixed(6)}`;
  }

  hide(): void {
    this.item.hide();
  }

  show(): void {
    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
  }
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1) + 'M';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1) + 'k';
  }
  return count.toString();
}

function formatCost(cost: number): string {
  if (cost >= 0.01) {
    return '$' + cost.toFixed(4);
  }
  return '$' + cost.toFixed(6);
}
