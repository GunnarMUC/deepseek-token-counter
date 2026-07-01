# DeepSeek Token Counter

**Know exactly what your prompts cost — before you send them.**

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%3E%3D1.85-007ACC.svg)](https://code.visualstudio.com/)

```text
DeepSeek: 1.2k Tokens | ~$0.0003
─────────────────────────────────
Model: DeepSeek-V3
Input Tokens: 1,200 (100%)
Output Tokens: 0 (0%)
Input Cost: $0.000324
Output Cost: $0.000000
Total Cost: $0.000324
```

## Why You Need This

DeepSeek charges **per token**. Every character you type, every code block you paste, every file you feed into the model — it all adds up. But until this extension, you had to **guess** how much your prompt would cost.

The DeepSeek Token Counter gives you **real-time, offline token counts** directly in your VS Code status bar. No API calls. No lag. Just open a file and see exactly how many tokens it costs.

> **Stop guessing. Start measuring.**

## Features

| Feature | What it does |
|---------|-------------|
| **Offline Token Counting** | Uses DeepSeek's own 100k-vocab tokenizer, bundled locally. Zero network calls. |
| **Live Status Bar** | Token count and estimated cost right in your status bar — updates as you type. |
| **Multi-Model Pricing** | Switch between DeepSeek-V3, R1, Coder-V2, and V2 with correct per-model prices. |
| **One-Click Details** | Click the status bar for a full breakdown: tokens split, per-model cost, output ratio. |
| **Configurable Prices** | All model prices editable in VS Code settings. DeepSeek changed their pricing? Update yourself. |
| **Input/Output Split** | Configure an assumed output ratio (e.g. 30% expected response) for realistic cost estimates. |
| **Command Palette Ready** | `Ctrl+Shift+P` → "DeepSeek Token Counter" for model switching and details. |

## Architecture

```
src/
├── extension.ts          # Extension lifecycle, commands, editor events
├── models.ts             # ModelConfig interface, default pricing, cost calculation
├── settings.ts           # VS Code settings integration, model resolution
├── deepseek/
│   └── tokenizer.ts      # @huggingface/tokenizers wrapper, load + count
├── statusbar.ts          # StatusBarItem management, formatting
├── test/
│   ├── tokenizer.test.ts # Tokenization unit tests
│   └── cost.test.ts      # Cost calculation unit tests
media/
├── tokenizer.json        # DeepSeek SentencePiece model (7.8 MB)
└── tokenizer_config.json # Tokenizer configuration (from HuggingFace)
```

**Design principles:**

- **Zero runtime dependencies beyond `@huggingface/tokenizers`** — no API keys, no network calls, no hidden costs.
- **VS Code-native** — uses `vscode.StatusBarItem`, `vscode.workspace.getConfiguration`, `vscode.commands` — nothing custom.
- **Modular** — `models.ts` owns data, `settings.ts` reads VS Code config, `tokenizer.ts` handles encoding, `statusbar.ts` handles display. Easy to extend.
- **Offline by default** — the 7.8 MB tokenizer model ships with the extension. Once installed, token counting works anywhere, even without internet.

## Quick Start

1. **Install** from the VS Code Marketplace or from VSIX
2. **Open any text file** — markdown, code, prompts, JSON
3. **See tokens and cost** in the status bar:
   ```
   DeepSeek: 2.4k Tokens | ~$0.0006
   ```
4. **Click** the status bar for a detailed breakdown
5. **Switch models** via `Ctrl+Shift+P` → "DeepSeek Token Counter: Select Model"

## Supported Models & Pricing

| Model | ID | Input / 1M tokens | Output / 1M tokens |
|-------|----|-------------------|-------------------|
| DeepSeek-V3 | `deepseek-chat` | $0.27 | $1.10 |
| DeepSeek-R1 | `deepseek-reasoner` | $0.55 | $2.19 |
| DeepSeek-Coder V2 | `deepseek-coder` | $0.14 | $0.28 |
| DeepSeek-V2 | `deepseek-chat-v2` | $0.14 | $0.28 |

Prices from [DeepSeek API Pricing](https://api-docs.deepseek.com/quick_start/pricing). Latest as of 2026.

## Settings

Configure via `File > Preferences > Settings > Extensions > DeepSeek Token Counter`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `deepseekTokenCounter.preferredModel` | `string` | `deepseek-chat` | Default model for pricing |
| `deepseekTokenCounter.models` | `array` | `[]` | Custom model overrides (add new models or change prices) |
| `deepseekTokenCounter.assumeOutputRatio` | `number` | `0` | Ratio of tokens assumed as output (0 = all input, 0.3 = 30% output) |

### Custom Models Example

Add custom pricing in `settings.json`:

```json
{
  "deepseekTokenCounter.models": [
    {
      "id": "deepseek-chat",
      "name": "DeepSeek-V3 (my price)",
      "inputPricePer1M": 0.27,
      "outputPricePer1M": 1.10
    }
  ]
}
```

## Development

```bash
git clone https://github.com/GunnarMUC/deepseek-token-counter.git
cd deepseek-token-counter
npm install
npm run compile
# Press F5 in VS Code to debug as Extension Host
```

### Download Tokenizer Model

The tokenizer model is included in the repo. To re-download:

```bash
curl -L -o media/tokenizer.json https://huggingface.co/deepseek-ai/DeepSeek-V3/resolve/main/tokenizer.json
curl -L -o media/tokenizer_config.json https://huggingface.co/deepseek-ai/DeepSeek-V3/resolve/main/tokenizer_config.json
```

### Run Tests

```bash
npm test
```

## How Token Counting Works

1. `loadTokenizer()` reads `media/tokenizer.json` (the DeepSeek SentencePiece BPE model from HuggingFace) into an `@huggingface/tokenizers` instance.
2. `countTokens(text)` calls `tokenizer.encode(text)` and returns `ids.length`.
3. The status bar updates on every keystroke (`onDidChangeTextDocument`).
4. Cost is calculated as `(tokens / 1,000,000) * pricePer1M`.
5. If `assumeOutputRatio` is set (e.g. `0.3`), 30% of tokens are priced at output rate, 70% at input rate.

## FAQ

**Is an API key needed?** No. Token counting is fully local. The extension never makes network requests.

**Does this work without internet?** Yes. The tokenizer model is bundled with the extension.

**Why does the cost differ from my DeepSeek bill?** This shows **list price**. Your actual bill depends on your DeepSeek account tier, volume discounts, or subscription plan.

**How do I add a new model?** Go to VS Code Settings and add an entry to `deepseekTokenCounter.models` with `id`, `name`, `inputPricePer1M`, and `outputPricePer1M`.

**How accurate is the token count?** It uses the exact same tokenizer DeepSeek's servers use — the `tokenizer.json` from [deepseek-ai/DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3) on HuggingFace. The count is identical to what the API would report.

## License

MIT — see [LICENSE](LICENSE).

The tokenizer model (`media/tokenizer.json`) is from DeepSeek, also under MIT license — see [media/LICENSE.tokenizer](media/LICENSE.tokenizer).
