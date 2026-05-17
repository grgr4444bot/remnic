#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [evidenceDir = '.', benchmarkArg] = process.argv.slice(2);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const coreVerifier = path.join(scriptDir, 'verify-public-benchmark-sota-evidence.mjs');
const targetMap = path.join(evidenceDir, 'current-target-map.json');
const args = [
  coreVerifier,
  evidenceDir,
  targetMap,
  ...(benchmarkArg ? [benchmarkArg] : []),
];

const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
if (result.error) {
  throw result.error;
}
if (result.signal) {
  console.error(`verify-public-benchmark-sota-evidence.mjs terminated by ${result.signal}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
