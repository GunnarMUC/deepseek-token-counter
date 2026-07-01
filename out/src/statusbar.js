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
exports.TokenStatusBar = void 0;
const vscode = __importStar(require("vscode"));
class TokenStatusBar {
    constructor(showDetailsCommand) {
        this.showDetailsCommand = showDetailsCommand;
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.item.command = this.showDetailsCommand;
        this.item.tooltip = 'Click for DeepSeek token details';
        this.item.show();
    }
    update(tokenCount, modelName, totalCost) {
        const tokensStr = formatTokens(tokenCount);
        const costStr = formatCost(totalCost);
        this.item.text = `DeepSeek: ${tokensStr} | ~${costStr}`;
        this.item.tooltip =
            `Model: ${modelName}\nTokens: ${tokenCount.toLocaleString('en-US')}\nCost: $${totalCost.toFixed(6)}`;
    }
    hide() {
        this.item.hide();
    }
    show() {
        this.item.show();
    }
    dispose() {
        this.item.dispose();
    }
}
exports.TokenStatusBar = TokenStatusBar;
function formatTokens(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}
function formatCost(cost) {
    if (cost >= 0.01) {
        return '$' + cost.toFixed(4);
    }
    return '$' + cost.toFixed(6);
}
//# sourceMappingURL=statusbar.js.map