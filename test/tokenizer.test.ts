import * as assert from 'assert';
import { resolve } from 'path';
import { loadTokenizer, countTokens, isTokenizerLoaded } from '../src/deepseek/tokenizer';

loadTokenizer(resolve(__dirname, '..', '..'));

const tests: [string, string, number][] = [
  ['empty string', '', 0],
  ['whitespace only', '   \n\t  ', 0],
  ['simple english', 'Hello, how are you?', 6],
  ['hello world', 'Hello World', 2],
  ['longer text', 'This is a test of the DeepSeek token counting system.', 13],
];

let passed = 0;
let failed = 0;

for (const [name, input, expected] of tests) {
  const actual = countTokens(input);
  if (actual === expected) {
    console.log(`  PASS: ${name} → ${actual} tokens`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} → expected ${expected}, got ${actual}`);
    failed++;
  }
}

assert.strictEqual(isTokenizerLoaded(), true, 'Tokenizer should be loaded');

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}

console.log(`\nAll ${passed} tests passed.`);
