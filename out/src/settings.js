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
exports.getConfiguration = getConfiguration;
exports.getPreferredModelId = getPreferredModelId;
exports.getAssumeOutputRatio = getAssumeOutputRatio;
exports.getCustomModels = getCustomModels;
exports.getActiveModelConfig = getActiveModelConfig;
exports.getAllModels = getAllModels;
const vscode = __importStar(require("vscode"));
const models_1 = require("./models");
function getConfiguration() {
    return vscode.workspace.getConfiguration('deepseekTokenCounter');
}
function getPreferredModelId() {
    return getConfiguration().get('preferredModel', 'deepseek-chat');
}
function getAssumeOutputRatio() {
    const ratio = getConfiguration().get('assumeOutputRatio', 0);
    return Math.max(0, Math.min(1, ratio));
}
function getCustomModels() {
    const raw = getConfiguration().get('models', []);
    return raw.map((m) => ({
        id: m.id || 'unknown',
        name: m.name || m.id || 'Unknown',
        inputPricePer1M: m.inputPricePer1M ?? 0,
        outputPricePer1M: m.outputPricePer1M ?? 0,
    }));
}
function getActiveModelConfig() {
    const preferred = getPreferredModelId();
    const custom = getCustomModels();
    const fromCustom = custom.find((m) => m.id === preferred);
    if (fromCustom) {
        return fromCustom;
    }
    const fromDefault = models_1.DEFAULT_MODELS.find((m) => m.id === preferred);
    return fromDefault || models_1.DEFAULT_MODELS[0];
}
function getAllModels() {
    const custom = getCustomModels();
    const customIds = new Set(custom.map((m) => m.id));
    const merged = custom.concat(models_1.DEFAULT_MODELS.filter((m) => !customIds.has(m.id)));
    return merged;
}
//# sourceMappingURL=settings.js.map