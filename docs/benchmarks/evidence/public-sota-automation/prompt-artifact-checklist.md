# Remnic Public Memory SOTA Prompt-To-Artifact Checklist

Last updated: 2026-05-16T19:46Z

Objective restated as deliverables:

1. Identify every applicable public memory benchmark for Remnic.
2. For each applicable benchmark, produce a full real run using Codex CLI
   `gpt-5.5`, reasoning effort `xhigh`, and service tier `fast`.
3. Compare each completed result against the current public SOTA target for
   the benchmark's official metric.
4. If any benchmark is not SOTA, improve only Remnic or benchmark harness
   behavior that preserves real-world user behavior, then rerun and verify.
5. Publish reproducible evidence for every SOTA result through GitHub PRs.
6. Keep every associated PR review-clean, CI-green, and free of unresolved
   review threads.

## Global Evidence Checklist

| Requirement | Required artifact or command | Current evidence | Status |
| --- | --- | --- | --- |
| Applicable benchmark set | `packages/bench/src/published-artifact.ts`, dataset directories, `scripts/bench/public-sota/current-target-map.json` | Nine benchmarks tracked: `ama-bench`, `memory-arena`, `amemgym`, `longmemeval`, `locomo`, `beam`, `personamem`, `memoryagentbench`, `membench` | Identified, not complete |
| Current SOTA targets | `node scripts/bench/public-sota/build-target-map.mjs scripts/bench/public-sota/current-target-map.refreshed.json`; compare refreshed map to current map excluding `generatedAt` | Refreshed `2026-05-16T19:46:38.942Z`; only `generatedAt` changed | Current |
| Correct provider/model | Per-result manifest plus diagnostics summary proving `codex-cli` and `gpt-5.5` | AMA PR #1005 proves this; active MemoryArena diagnostics prove this so far | Partial |
| Correct reasoning effort | Per-result manifest plus diagnostics summary proving `xhigh` | AMA PR #1005 proves this; active MemoryArena diagnostics prove this so far | Partial |
| Correct service tier | Per-result diagnostics summary proving `fast`; verifier must fail without it | AMA PR #1005 proves this; MemoryArena and generic packagers/verifiers require it | Partial |
| Full real mode | Result metadata, manifest, run command, and dataset/task count showing full real scoring | AMA done; MemoryArena active full real run; no later benchmark full current run yet | Partial |
| Reproducible evidence package | Public-safe artifact, manifest, diagnostics summary, SOTA comparison, evidence markdown, verifier script | AMA done; MemoryArena/generic tooling ready | Partial |
| Publication via PR | PR URL, branch, commit, green checks, no unresolved threads | AMA PR #1005 merged; no other benchmark PR yet | Partial |
| Non-SOTA remediation | Comparison failure, real-world-preserving code/harness patch, tests, rerun, evidence PR | No current post-AMA benchmark result has failed SOTA yet | Pending |

## Per-Benchmark Publication Checklist

Each benchmark is complete only when all columns have concrete evidence.

| Benchmark | Full current result | SOTA comparison | Evidence package | Verifier in PR | PR state | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| `ama-bench` | `docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z/2026-05-15-ama-bench-gpt-5.5-real-bf9b264.json` | PR #1005 evidence doc and verifier | Manifest, diagnostics summary, public-safe artifact, evidence doc | `scripts/bench/verify-public-ama-agent-sota-evidence.mjs` | PR #1005 merged into `bench/public-matrix-codex` | Complete for agent/memory-system SOTA class |
| `memory-arena` | Missing; active run at `1250/4209`, no result JSON | Pending `compare-memoryarena-sota.mjs` | Pending `complete-memoryarena-if-ready.sh` | Pending `verify-public-memoryarena-sota-evidence.mjs` | Pending | Blocked on active run completion |
| `amemgym` | Missing current Codex `gpt-5.5`/`xhigh`/`fast` full result | Pending `compare-public-benchmark-sota.mjs` | Pending generic packager | Pending generic public verifier | Pending | Not started; queued after MemoryArena |
| `longmemeval` | Missing current Codex `gpt-5.5`/`xhigh`/`fast` full result | Pending generic comparator | Pending generic packager | Pending generic public verifier | Pending | Not started |
| `locomo` | Missing valid current full result; older trial-limited files do not qualify | Pending generic comparator | Pending generic packager | Pending generic public verifier | Pending | Not started |
| `beam` | Missing current Codex `gpt-5.5`/`xhigh`/`fast` full result | Pending generic comparator | Pending generic packager | Pending generic public verifier | Pending | Not started |
| `personamem` | Missing current Codex `gpt-5.5`/`xhigh`/`fast` full result | Pending generic comparator | Pending generic packager | Pending generic public verifier | Pending | Not started |
| `memoryagentbench` | Missing current Codex `gpt-5.5`/`xhigh`/`fast` full result | Pending generic comparator with paper Table 3 derived overall score | Pending generic packager | Pending generic public verifier | Pending | Not started |
| `membench` | Missing current Codex `gpt-5.5`/`xhigh`/`fast` full result | Pending generic comparator | Pending generic packager | Pending generic public verifier | Pending | Not started |

## Commands And Gates

| Purpose | Command | Required completion evidence |
| --- | --- | --- |
| Active run status | `node scripts/bench/public-sota/check-active-public-run.mjs` | Progress, result files, diagnostics totals, latest completed diagnostic |
| MemoryArena completion | `bash scripts/bench/public-sota/memoryarena/complete-memoryarena-if-ready.sh` | SOTA comparison, packaged evidence, verifier success |
| MemoryArena PR staging | `bash scripts/bench/public-sota/memoryarena/stage-memoryarena-evidence-pr.sh` | Worktree on `codex/publish-memoryarena-sota-bf9b264`, verifier success, public-matrix verifier success, `gitleaks` success |
| MemoryArena PR publishing | `bash scripts/bench/public-sota/memoryarena/publish-memoryarena-evidence-pr.sh` | GitHub PR URL targeting `bench/public-matrix-codex` |
| MemoryArena completion watcher | `scripts/bench/public-sota/memoryarena/watch-and-publish-memoryarena.sh` in tmux session `remnic-memoryarena-publish-watcher-bf9b2643` | Waits for result, runs completion/staging/publish helpers, then stops; log at `${HOME}/.remnic/bench/results/public-matrix-codex-bf9b2643-20260515T052919Z/memoryarena-publish-watcher.log` |
| Publication tool availability | Helper scripts prepend `/opt/homebrew/bin:/opt/homebrew/sbin`; `gh auth status --hostname github.com` | Syntax checks passed and GitHub auth is active for `joshuaswarren` |
| Next benchmark launch | `bash scripts/bench/public-sota/launch-next-public-benchmark.sh amemgym` | New active run after MemoryArena evidence is handled; helper refuses any active public benchmark scoring session |
| Guarded post-MemoryArena transition | `bash scripts/bench/public-sota/launch-next-after-memoryarena.sh amemgym` | Waits until MemoryArena scoring and watcher sessions have stopped and the MemoryArena PR is open-or-merged clean, then launches AMemGym and starts its monitor |
| Post-MemoryArena transition watcher | `scripts/bench/public-sota/watch-next-after-memoryarena.sh amemgym` in tmux session `remnic-next-after-memoryarena-watcher-bf9b2643` | Repeats the guarded transition check every 30 minutes and stops after AMemGym launches |
| Next benchmark monitor | `bash scripts/bench/public-sota/start-run-monitor.sh <results-dir>` | 30-minute monitor log in the new results directory |
| Generic benchmark completion | `bash scripts/bench/public-sota/complete-public-benchmark-if-ready.sh <benchmark> [run-id]` | SOTA comparison, packaged evidence, verifier success |
| Generic benchmark PR staging | `bash scripts/bench/public-sota/stage-public-benchmark-evidence-pr.sh <benchmark> [run-id]` | Worktree on benchmark publication branch, verifier success, public-matrix verifier success, `gitleaks` success |
| Generic benchmark PR publishing | `bash scripts/bench/public-sota/publish-public-benchmark-evidence-pr.sh <benchmark> [run-id]` | GitHub PR URL targeting `bench/public-matrix-codex` |
| Generic benchmark publish watcher | `scripts/bench/public-sota/watch-public-benchmark-publish.sh amemgym` in tmux session `remnic-amemgym-publish-watcher` | Waits for AMemGym run/result, then runs completion/staging/publishing and PR-clean gates |
| Non-SOTA remediation artifact | MemoryArena watcher or generic publish watcher writes `<benchmark>-remediation-required.md` | On SOTA miss, records comparison path and required real-world-preserving remediation/rerun steps before exiting |
| Generic benchmark transition watcher | `scripts/bench/public-sota/watch-next-after-benchmark.sh amemgym longmemeval` in tmux session `remnic-amemgym-to-longmemeval-watcher` | Waits for clean AMemGym evidence PR, then launches LongMemEval and starts its monitor |
| Remaining queue watchers | `scripts/bench/public-sota/start-remaining-queue-watchers.sh` | Starts idempotent publish/transition watchers for LongMemEval through PersonaMem without starting scoring runs early |
| Consolidated pipeline status | `node scripts/bench/public-sota/status-public-sota-pipeline.mjs` | Reports scoring sessions, watcher sessions, MemoryArena progress/diagnostics, and latest run/result presence per benchmark |
| Pipeline health assertion | `node scripts/bench/public-sota/assert-public-sota-pipeline-healthy.mjs` | Fails if scoring session count, watcher presence, full active-run diagnostics errors/nonzero exits, diagnostic freshness, or latest diagnostic `codex-cli` / `gpt-5.5` / `xhigh` / `fast` settings violate the active pipeline contract |
| Objective completion audit | `node scripts/bench/public-sota/audit-public-sota-completion.mjs` | Inspects `origin/bench/public-matrix-codex`, runs committed evidence verifiers and the committed public-matrix verifier for present manifests, and checks PR gates for all nine benchmarks; must return `ok: true` before marking the goal complete |
| Publication retry path | `publish-*-evidence-pr.sh`, `watch-*-publish.sh`, `watch-next-after-*` | Existing PRs are re-verified when worktrees are clean; publish/transition watchers wait and retry on transient PR-clean failures |
| PR cleanliness gate | `node scripts/bench/public-sota/verify-pr-clean.mjs --pr <number>` | Requires non-draft open-or-merged PR, no unresolved threads, no active changes-requested review decision, green check rollup, and no failed/pending contexts |
| PR cleanliness gate | `node scripts/bench/public-sota/verify-pr-clean.mjs --pr <number> --wait-seconds 1800` | Fails drafts, unresolved review threads, failed/pending checks, or non-success check rollup; validated against AMA PR #1005 |

## Current Blocker

The goal is not achieved. The active MemoryArena run is still in progress and
has not produced a result file. No benchmark after AMA-Bench has complete,
current, publishable evidence under the required runtime settings.
