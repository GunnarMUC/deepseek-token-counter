import * as assert from 'assert';
import { calculateCost, ModelConfig, DEFAULT_MODELS } from '../src/models';
import { getAssumeOutputRatio } from '../src/settings';

const model = DEFAULT_MODELS.find((m) => m.id === 'deepseek-chat')!;

const costTests: [string, number, number, number][] = [
  ['1000 input 0 output', 1000, 0, 0.000270],
  ['0 input 1000 output', 0, 1000, 0.001100],
  ['500 input 500 output', 500, 500, 0.000685],
  ['1M input only', 1_000_000, 0, 0.27],
  ['1M output only', 0, 1_000_000, 1.10],
];

let passed = 0;
let failed = 0;

for (const [name, input, output, expected] of costTests) {
  const { totalCost } = calculateCost(input, output, model);
  const diff = Math.abs(totalCost - expected);
  if (diff < 0.000001) {
    console.log(`  PASS: ${name} → $${totalCost.toFixed(6)}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name} → expected $${expected.toFixed(6)}, got $${totalCost.toFixed(6)}`);
    failed++;
  }
}

assert.strictEqual(DEFAULT_MODELS.length, 4, 'Should have 4 default models');
assert.ok(DEFAULT_MODELS.every((m) => m.id && m.name), 'All models should have id and name');

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}

console.log(`\nAll ${passed} tests passed.`);
