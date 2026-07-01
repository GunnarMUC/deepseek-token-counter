"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const tokenizer_1 = require("./deepseek/tokenizer");
const models_1 = require("./models");
const settings_1 = require("./settings");
const statusbar_1 = require("./statusbar");
let statusBar;
function activate(context) {
    statusBar = new statusbar_1.TokenStatusBar('deepseekTokenCounter.showDetails');
    try {
        (0, tokenizer_1.loadTokenizer)(context.extensionPath);
    }
    catch (e) {
        vscode.window.showErrorMessage(`DeepSeek Token Counter: Failed to load tokenizer. ${e instanceof Error ? e.message : String(e)}`);
        return;
    }
    context.subscriptions.push(vscode.commands.registerCommand('deepseekTokenCounter.selectModel', async () => {
        const models = (0, settings_1.getAllModels)();
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
    }));
    context.subscriptions.push(vscode.commands.registerCommand('deepseekTokenCounter.showDetails', () => {
        showDetails();
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updateStatusBar()));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => updateStatusBar()));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('deepseekTokenCounter')) {
            updateStatusBar();
        }
    }));
    context.subscriptions.push(statusBar);
    updateStatusBar();
}
function updateStatusBar() {
    if (!(0, tokenizer_1.isTokenizerLoaded)()) {
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
    const totalTokens = (0, tokenizer_1.countTokens)(text);
    const model = (0, settings_1.getActiveModelConfig)();
    const outputRatio = (0, settings_1.getAssumeOutputRatio)();
    const outputTokens = Math.round(totalTokens * outputRatio);
    const inputTokens = totalTokens - outputTokens;
    const { totalCost } = (0, models_1.calculateCost)(inputTokens, outputTokens, model);
    statusBar.show();
    statusBar.update(totalTokens, model.name, totalCost);
}
function showDetails() {
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
    const totalTokens = (0, tokenizer_1.countTokens)(text);
    const model = (0, settings_1.getActiveModelConfig)();
    const outputRatio = (0, settings_1.getAssumeOutputRatio)();
    const outputTokens = Math.round(totalTokens * outputRatio);
    const inputTokens = totalTokens - outputTokens;
    const { inputCost, outputCost, totalCost } = (0, models_1.calculateCost)(inputTokens, outputTokens, model);
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
function deactivate() {
    if (statusBar) {
        statusBar.dispose();
    }
}
//# sourceMappingURL=extension.js.map