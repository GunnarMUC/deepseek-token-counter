import * as fs from 'fs';
import * as path from 'path';
import { Tokenizer } from '@huggingface/tokenizers';

let tokenizer: Tokenizer | null = null;

export function loadTokenizer(extensionPath: string): void {
  if (tokenizer) {
    return;
  }

  const jsonPath = path.join(extensionPath, 'media', 'tokenizer.json');
  const configPath = path.join(extensionPath, 'media', 'tokenizer_config.json');

  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `DeepSeek tokenizer model not found at "${jsonPath}". ` +
      'The extension bundle may be incomplete. Reinstall the extension or run the download script.'
    );
  }

  const tokenizerJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const tokenizerConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : {};

  tokenizer = new Tokenizer(tokenizerJson, tokenizerConfig);
}

export function countTokens(text: string): number {
  if (!tokenizer) {
    throw new Error('Tokenizer not loaded. Call loadTokenizer() first.');
  }

  if (!text || text.trim().length === 0) {
    return 0;
  }

  const encoded = tokenizer.encode(text);
  return encoded.ids.length;
}

export function isTokenizerLoaded(): boolean {
  return tokenizer !== null;
}
