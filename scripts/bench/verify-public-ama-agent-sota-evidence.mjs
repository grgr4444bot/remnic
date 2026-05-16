#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const evidenceDir = process.argv[2] ?? 'docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z';
const artifactPath = path.join(evidenceDir, '2026-05-15-ama-bench-gpt-5.5-real-bf9b264.json');
const manifestPath = path.join(evidenceDir, 'MANIFEST.ama-bench.json');
const diagnosticsPath = path.join(evidenceDir, 'ama-bench-diagnostics-summary.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256File(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const artifact = readJson(artifactPath);
const manifest = readJson(manifestPath);
const diagnostics = readJson(diagnosticsPath);
const resultEntry = manifest.results?.find((entry) => entry.benchmark === 'ama-bench');
const publicArtifactEntry = manifest.publicArtifacts?.find((entry) => entry.benchmark === 'ama-bench');
const expectedTaskCount = 2496;
const expectedRecommendedAccuracy = 0.6542467948717948;
const expectedLeaderboardAverage = 0.6496122948369937;

function assertClose(actual, expected, message) {
  assert(typeof actual === 'number' && Number.isFinite(actual), `${message}: value must be finite number`);
  assert(Math.abs(actual - expected) < 1e-12, `${message}: expected ${expected}, got ${actual}`);
}

function mean(values) {
  assert(values.length > 0, 'cannot average an empty list');
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function compareStrings(a, b) {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

function recomputeAmaBenchLeaderboardCells(perTaskScores) {
  const cells = new Map();

  for (const task of perTaskScores ?? []) {
    const [domain, , qaType] = String(task.category ?? '').split('/');
    assert(domain && qaType, `invalid AMA-Bench category for task ${task.taskId ?? '<unknown>'}`);

    const score = task.scores?.ama_bench_recommended_accuracy ?? task.scores?.llm_judge;
    assert(typeof score === 'number' && Number.isFinite(score), `invalid score for task ${task.taskId ?? '<unknown>'}`);

    const key = `${domain}/${qaType}`;
    const cell = cells.get(key) ?? { domain, qaType, scores: [] };
    cell.scores.push(score);
    cells.set(key, cell);
  }

  return Array.from(cells.values())
    .sort((a, b) => compareStrings(a.domain, b.domain) || compareStrings(a.qaType, b.qaType))
    .map((cell) => ({
      domain: cell.domain,
      qaType: cell.qaType,
      taskCount: cell.scores.length,
      ama_bench_recommended_accuracy: mean(cell.scores),
    }));
}

assert(artifact.schemaVersion === 1, 'artifact schemaVersion must be 1');
assert(artifact.benchmarkId === 'ama-bench', 'artifact benchmarkId must be ama-bench');
assert(artifact.system?.name === 'remnic', 'artifact system.name must be remnic');
assert(artifact.system?.gitSha === manifest.git?.commit, 'artifact git SHA must match manifest commit');
assert(artifact.model === 'gpt-5.5', 'artifact model must be gpt-5.5');
assert(artifact.seed === 1, 'artifact seed must be 1');
assert(artifact.perTaskScores?.length === expectedTaskCount, 'artifact must contain 2496 per-task scores');
assertClose(artifact.metrics?.ama_bench_recommended_accuracy, expectedRecommendedAccuracy, 'unexpected AMA recommended accuracy');
assertClose(artifact.metrics?.llm_judge, expectedRecommendedAccuracy, 'unexpected llm_judge');
assertClose(artifact.metrics?.ama_bench_leaderboard_average, expectedLeaderboardAverage, 'unexpected AMA leaderboard average');

const recomputedCells = recomputeAmaBenchLeaderboardCells(artifact.perTaskScores);
assert(recomputedCells.length === 24, 'AMA-Bench leaderboard average must be computed from 24 domain x qaType cells');
assert(artifact.amaBenchLeaderboardCells?.length === recomputedCells.length, 'artifact must contain the 24 leaderboard cells');
assert(JSON.stringify(artifact.amaBenchLeaderboardCells) === JSON.stringify(recomputedCells), 'artifact leaderboard cells must match per-task scores');
assertClose(mean(recomputedCells.map((cell) => cell.ama_bench_recommended_accuracy)), expectedLeaderboardAverage, 'recomputed AMA leaderboard average');

assert(resultEntry, 'manifest must contain ama-bench result entry');
assert(resultEntry.path === 'ama-bench-v9.3.388-2026-05-15T23-38-04-213Z.json', 'manifest result path must point at the raw benchmark result');
assert(resultEntry.sha256 === '7930b614b3a6085c007315c0a6470130c8d4ed956220a79b61ea822f621c609b', 'manifest result sha256 must match raw result hash');
assert(resultEntry.taskCount === expectedTaskCount, 'manifest result taskCount must be 2496');
assert(!('publicSafe' in resultEntry), 'manifest raw result entry must not be marked publicSafe');
assert(publicArtifactEntry, 'manifest must contain ama-bench public artifact entry');
assert(publicArtifactEntry.path === path.basename(artifactPath), 'manifest public artifact path must point at public-safe artifact');
assert(publicArtifactEntry.sha256 === sha256File(artifactPath), 'manifest public artifact sha256 must match artifact file');
assert(publicArtifactEntry.taskCount === expectedTaskCount, 'manifest public artifact taskCount must be 2496');
assert(publicArtifactEntry.publicSafe === true, 'manifest public artifact must be marked publicSafe');
assert(publicArtifactEntry.sourceResultPath === resultEntry.path, 'public artifact source path must match raw result entry');
assert(publicArtifactEntry.sourceResultSha256 === resultEntry.sha256, 'public artifact source hash must match raw result entry');
assert(manifest.datasets?.[0]?.sha256 === '90826eb21ce703a0b82078752e9eafeaca30b3976c897daff341a9f9ad77277e', 'dataset hash changed');
assert(manifest.command?.cwd === '<repo-root>', 'manifest cwd must be scrubbed');
assert(!JSON.stringify(manifest).includes('/Users/'), 'manifest must not contain local /Users paths');
assert(!JSON.stringify(manifest).includes('MacStudio'), 'manifest must not contain local hostname');
assert(diagnostics.runId === manifest.run?.id, 'diagnostic runId must match manifest');
assert(diagnostics.checked === 8307, 'diagnostics checked count changed');
assert(diagnostics.errored === 0, 'diagnostics must have zero errors');
assert(diagnostics.nonzero === 0, 'diagnostics must have zero nonzero exits');
assert(diagnostics.providers?.['codex-cli'] === 8307, 'diagnostics provider distribution changed');
assert(diagnostics.models?.['gpt-5.5'] === 8307, 'diagnostics model distribution changed');
assert(diagnostics.reasoningEfforts?.xhigh === 8307, 'diagnostics reasoning distribution changed');
assert(diagnostics.serviceTiers?.fast === 8307, 'diagnostics service tier distribution changed');

console.log(JSON.stringify({
  ok: true,
  benchmark: artifact.benchmarkId,
  taskCount: artifact.perTaskScores.length,
  amaBenchLeaderboardAverage: artifact.metrics.ama_bench_leaderboard_average,
  amaBenchRecommendedAccuracy: artifact.metrics.ama_bench_recommended_accuracy,
  artifactSha256: publicArtifactEntry.sha256,
  rawResultSha256: resultEntry.sha256,
}, null, 2));
