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
exports.loadTokenizer = loadTokenizer;
exports.countTokens = countTokens;
exports.isTokenizerLoaded = isTokenizerLoaded;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tokenizers_1 = require("@huggingface/tokenizers");
let tokenizer = null;
function loadTokenizer(extensionPath) {
    if (tokenizer) {
        return;
    }
    const jsonPath = path.join(extensionPath, 'media', 'tokenizer.json');
    const configPath = path.join(extensionPath, 'media', 'tokenizer_config.json');
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`DeepSeek tokenizer model not found at "${jsonPath}". ` +
            'The extension bundle may be incomplete. Reinstall the extension or run the download script.');
    }
    const tokenizerJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const tokenizerConfig = fs.existsSync(configPath)
        ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        : {};
    tokenizer = new tokenizers_1.Tokenizer(tokenizerJson, tokenizerConfig);
}
function countTokens(text) {
    if (!tokenizer) {
        throw new Error('Tokenizer not loaded. Call loadTokenizer() first.');
    }
    if (!text || text.trim().length === 0) {
        return 0;
    }
    const encoded = tokenizer.encode(text);
    return encoded.ids.length;
}
function isTokenizerLoaded() {
    return tokenizer !== null;
}
//# sourceMappingURL=tokenizer.js.map