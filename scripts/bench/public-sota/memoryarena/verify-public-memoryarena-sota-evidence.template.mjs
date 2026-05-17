#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_EVIDENCE_DIR = 'docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z';
const evidenceDir = process.argv[2] ?? DEFAULT_EVIDENCE_DIR;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const stagedCoreVerifier = path.join(scriptDir, 'memoryarena', 'verify-memoryarena-sota-evidence.mjs');
const sourceCoreVerifier = path.join(scriptDir, 'verify-memoryarena-sota-evidence.mjs');
const coreVerifier = fs.existsSync(stagedCoreVerifier) ? stagedCoreVerifier : sourceCoreVerifier;
const targetMap = path.join(evidenceDir, 'current-target-map.json');

const result = spawnSync(process.execPath, [coreVerifier, evidenceDir, targetMap], {
  stdio: 'inherit',
});
if (result.error) {
  throw result.error;
}
if (result.signal) {
  console.error(`verify-memoryarena-sota-evidence.mjs terminated by ${result.signal}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
