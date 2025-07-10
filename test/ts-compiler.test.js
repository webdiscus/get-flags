import { describe, test, beforeAll } from 'vitest';
import { executeTSFile } from './utils/helpers.js';

beforeAll(() => {
  // increase the default timeout (5000 ms) to avoid occasional timeouts on GitHub CI
}, 10_000);

// integration tests: compile TS into JS, execute compiled JS and compare the output with expected string
describe('imports type=commonjs', () => {
  test('tsc', () => executeTSFile('ts/default-import', 'tsc'));
  test('swc', () => executeTSFile('ts/default-import', 'swc'));
  test('esbuild', () => executeTSFile('ts/default-import', 'esbuild'));
});

describe('imports type=module', () => {
  test('module ESNext', () => executeTSFile('ts/module-import-esnext', 'tsc'));
  test('module Node16', () => executeTSFile('ts/module-import-node16', 'tsc'));
  test('module ESNext, tsup', () => executeTSFile('ts/module-import-esnext', 'tsup_esm'));
  test('module Node16, tsup', () => executeTSFile('ts/module-import-node16', 'tsup_esm_node16'));
});
