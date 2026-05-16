# Remnic Public Memory SOTA Completion Audit

Last updated: 2026-05-16T19:46Z

Objective:

Ensure Remnic is SOTA across all applicable public memory benchmarks using
Codex CLI with `gpt-5.5`, reasoning effort `xhigh`, and service tier `fast`.
For any non-SOTA benchmark, improve only real-world-preserving Remnic or harness
behavior, rerun, verify, publish reproducible evidence, and keep PRs
review-clean, CI-green, and free of unresolved review threads.

Prompt-to-artifact checklist:
`docs/benchmarks/evidence/public-sota-automation/prompt-artifact-checklist.md`

## Completion Criteria

| Requirement | Evidence Needed | Current Evidence | Status |
| --- | --- | --- | --- |
| Applicable public benchmark set identified | Benchmark list from repo artifacts and dataset presence | Nine benchmarks listed in `packages/bench/src/published-artifact.ts`; all datasets present: `ama-bench`, `memory-arena`, `amemgym`, `longmemeval`, `locomo`, `beam`, `personamem`, `memoryagentbench`, `membench` | Partial: list identified, not all completed |
| SOTA targets current | Live AMB targets refreshed and paper targets documented | `scripts/bench/public-sota/current-target-map.json` refreshed at `2026-05-16T19:46:38Z`; diff from prior map only changed `generatedAt` | Complete for current target snapshot |
| Correct runtime model | Result config and diagnostics prove Codex CLI `gpt-5.5` | AMA PR #1005 manifest/verifier proves `codex-cli`/`gpt-5.5`; active MemoryArena diagnostics show same model in run records | Partial |
| Correct reasoning effort | Result config and diagnostics prove `xhigh` | AMA PR #1005 verifier proves `xhigh`; active MemoryArena diagnostics clean for `xhigh` so far | Partial |
| Correct service tier | Diagnostics prove `fast` | AMA PR #1005 verifier proves `fast`; active MemoryArena diagnostics clean for `fast` so far; scratch MemoryArena/generic evidence packagers and verifiers now require diagnostics proving `fast` | Partial |
| Full, real benchmark mode | Result meta/config and manifest prove full mode and real runtime | AMA PR #1005 does; active MemoryArena command uses full real run; remaining benchmarks dry-run validated only | Partial |
| AMA-Bench SOTA published | Public-safe artifact, manifest, verifier, comparison, clean PR | PR #1005 merged at `2026-05-16T16:30:54Z` as `c270f90893efaec2a4549aaefe2630af8fda092f`; head `b774581dd4945a744294a812d27766e77b11ecf1`; checks green, no unresolved threads before merge | Complete for agent/memory-system class |
| MemoryArena SOTA published | Raw result, official metrics, comparison, public-safe artifact, manifest, verifier, clean PR | Run active at `1250/4209`; no result file yet; scratch packager/verifier/staging path ready | Missing |
| AMemGym SOTA published | Raw result, comparator, public-safe artifact, manifest, verifier, clean PR | Dataset validated; scratch comparator and generic packager/verifier ready; no full result yet | Missing |
| LongMemEval SOTA published | Raw result, comparator, public-safe artifact, manifest, verifier, clean PR | Dataset validated; scratch comparator and generic packager/verifier ready; no full result yet | Missing |
| LoCoMo SOTA published | Raw result, comparator, public-safe artifact, manifest, verifier, clean PR | Dataset validated; scratch comparator and generic packager/verifier ready; no full result yet | Missing |
| BEAM SOTA published | Raw result, split comparisons, public-safe artifact, manifest, verifier, clean PR | Dataset validated; scratch comparator and generic packager/verifier ready; no full result yet | Missing |
| PersonaMem SOTA published | Raw result, split comparisons, public-safe artifact, manifest, verifier, clean PR | Dataset validated; scratch comparator and generic packager/verifier ready; no full result yet | Missing |
| MemoryAgentBench SOTA published | Paper Table 3 overall score, public-safe artifact, manifest, verifier, clean PR | Dataset validated; comparator now derives paper Table 3 overall score from ten dataset metrics and four category averages; no full result yet | Missing |
| MemBench SOTA published | Raw result, four official category comparisons, public-safe artifact, manifest, verifier, clean PR | Dataset validated; scratch comparator and generic packager/verifier ready; no full result yet | Missing |
| Non-SOTA remediation | For any miss: real-world-preserving code/harness change, tests, rerun | No post-AMA non-SOTA result completed yet | Pending |
| Reproducible public evidence | Public-safe results, dataset hashes, manifest, command/env metadata, verifier | AMA done; MemoryArena and generic tooling ready; remaining evidence not generated | Partial |
| PRs review-clean/CI-green/no unresolved threads | GitHub checks and review-thread query on current heads | PR #1005 merged with failed check list `[]` and unresolved review threads `[]`; future benchmark PRs still required | Partial |

## Current Run State

- Active benchmark: `memory-arena`
- Results dir: `${HOME}/.remnic/bench/results/public-matrix-codex-bf9b2643-20260515T052919Z`
- Worktree: `<repo-root>`
- Commit: `bf9b264356a537e70fce1bddbca3495bf8a19b31`
- Latest checked progress: `1250/4209` tasks (`29.70%`)
- Estimated MemoryArena finish from current progress: `2026-05-18T18:30:31Z`
- Diagnostics at last check: `12526` total, `0` errors, `0` nonzero, `1` in flight
- MemoryArena result files: none yet
- 30-minute monitor log confirmed active with heartbeats at `2026-05-16T17:47:08Z`
  and `2026-05-16T18:17:08Z`; diagnostics increased from `12347` to `12403`
  across those heartbeats. A direct status check at `2026-05-16T19:46:51Z`
  showed diagnostics at `12526` and the latest completed call using
  `codex-cli`, `gpt-5.5`, `xhigh`, and `fast`.
- Active benchmark worktree `<repo-root>`
  is clean at `bf9b264356a537e70fce1bddbca3495bf8a19b31` on
  `bench/public-matrix-codex` and contains `evals/datasets/memory-arena`.
  This is safe to use as `--repo-root`/`--dataset-dir` for MemoryArena packaging
  after the run finishes.
- A broad sweep of `${HOME}/.remnic/bench/results` found older
  `full` JSON files for `amemgym`, `longmemeval`, `locomo`, and `memory-arena`,
  but they are not publishable for this objective. Sample metadata showed old
  Ollama/baseline runs, missing providers, or trial-limited Codex runs rather
  than the required current `codex-cli`/`gpt-5.5`/`xhigh`/`fast` evidence.
  No additional completed current SOTA result was found beyond the already
  published AMA-Bench artifact.

## Ready Tooling

- Active run checker: `scripts/bench/public-sota/check-active-public-run.mjs`
  - Now includes in-flight diagnostic age and latest completed diagnostic
    records so status checks can distinguish slow calls from stalls.
- Target map: `scripts/bench/public-sota/current-target-map.json`
- Generic comparator: `scripts/bench/public-sota/compare-public-benchmark-sota.mjs`
- Generic evidence packager: `scripts/bench/public-sota/package-public-benchmark-evidence.mjs`
- Generic evidence verifier: `scripts/bench/public-sota/verify-public-benchmark-sota-evidence.mjs`
- MemoryArena official metric derivation: `scripts/bench/public-sota/memoryarena/derive-memoryarena-official-metrics.mjs`
- MemoryArena comparator: `scripts/bench/public-sota/memoryarena/compare-memoryarena-sota.mjs`
- MemoryArena packager: `scripts/bench/public-sota/memoryarena/package-memoryarena-evidence.mjs`
- MemoryArena verifier: `scripts/bench/public-sota/memoryarena/verify-memoryarena-sota-evidence.mjs`
- Guarded MemoryArena completion helper:
  `scripts/bench/public-sota/memoryarena/complete-memoryarena-if-ready.sh`
  - Syntax checked.
  - Current no-result state tested; exits `0` with `waiting:` while active tmux
    session exists.
- Self-contained MemoryArena public verifier template:
  `scripts/bench/public-sota/memoryarena/verify-public-memoryarena-sota-evidence.template.mjs`
  - Syntax checked.
  - Validated against diagnostics-backed synthetic evidence at
    `scripts/bench/public-sota/memoryarena/test-evidence-with-diagnostics/evidence`.
  - Intended repo path after real evidence is packaged:
    `scripts/bench/verify-public-memoryarena-sota-evidence.mjs`.
- MemoryArena evidence markdown generator:
  `scripts/bench/public-sota/memoryarena/generate-memoryarena-evidence-doc.mjs`
  - Syntax checked.
  - Generated a synthetic evidence document at
    `scripts/bench/public-sota/memoryarena/test-evidence-with-diagnostics/memoryarena-evidence.md`.
  - Intended repo path after real evidence is packaged:
    `docs/benchmarks/evidence/memory-arena-gpt-5.5-sota-<date>.md`.
- Guarded MemoryArena PR staging helper:
  `scripts/bench/public-sota/memoryarena/stage-memoryarena-evidence-pr.sh`
  - Syntax checked.
  - Current no-evidence state tested; exits `0` with `waiting:` until
    `${TMPDIR:-/tmp}/remnic-memoryarena-evidence/public-matrix-codex-bf9b2643-20260515T052919Z`
    contains verified evidence.
  - Targets `bench/public-matrix-codex` via branch
    `codex/publish-memoryarena-sota-bf9b264`.
  - Refuses to reuse an existing worktree on the wrong branch.
  - Copies only the committed evidence set: manifest, diagnostics summary,
    SOTA comparison, and public-safe artifact.
  - End-to-end dry run passed against diagnostics-backed synthetic MemoryArena
    evidence in throwaway worktree
    `<tmp>/remnic-synthetic-memoryarena-sota-pr`: generated evidence doc,
    ran self-contained verifier, ran public-matrix verifier, and ran `gitleaks`.
  - Throwaway worktree and branch
    `codex/test-synthetic-memoryarena-sota-stage` were removed after the dry run.
- Guarded MemoryArena PR publish helper:
  `scripts/bench/public-sota/memoryarena/publish-memoryarena-evidence-pr.sh`
  - Syntax checked.
  - Current no-worktree state tested; exits `0` with `waiting:` until the
    staging worktree exists.
  - Commits, pushes, and opens/updates the PR only after staged evidence exists.
- MemoryArena completion/publish watcher:
  `scripts/bench/public-sota/memoryarena/watch-and-publish-memoryarena.sh`
  - Syntax checked.
  - Negative path tested with a missing results directory and missing tmux
    session; exits `2` with a clear log line.
  - Active-session wait path tested; logs `waiting:` without packaging before a
    result exists.
  - Running in tmux session `remnic-memoryarena-publish-watcher-bf9b2643`.
  - Log path:
    `${HOME}/.remnic/bench/results/public-matrix-codex-bf9b2643-20260515T052919Z/memoryarena-publish-watcher.log`.
  - The watcher stops after MemoryArena packaging/staging/publishing. It does
    not launch later benchmarks automatically.
  - Watcher plus MemoryArena/generic completion, staging, and publishing helpers
    now explicitly prepend `/opt/homebrew/bin:/opt/homebrew/sbin` to `PATH`, so
    unattended tmux runs can find `node`, `npx`, `gh`, and `gitleaks`.
  - `gh auth status --hostname github.com` confirmed an active authenticated
    GitHub session for `joshuaswarren`.
- Queue and command notes: `scripts/bench/public-sota/next-run-queue.md`
- Generic non-MemoryArena completion helper:
  `scripts/bench/public-sota/complete-public-benchmark-if-ready.sh`
  - Syntax checked.
  - Current no-run state tested with `amemgym`; exits `0` with `waiting:`.
  - Covers `amemgym`, `longmemeval`, `locomo`, `beam`, `memoryagentbench`,
    `membench`, and `personamem`.
  - Runs compare, requires SOTA on publishable metrics, packages evidence, and
    runs the generic evidence verifier.
- Generic non-MemoryArena evidence markdown generator:
  `scripts/bench/public-sota/generate-public-benchmark-evidence-doc.mjs`
  - Syntax checked.
  - Generated a diagnostics-backed synthetic AMemGym evidence document at
    `scripts/bench/public-sota/test-generic-evidence-all-with-diagnostics/amemgym/amemgym-evidence.md`.
  - Intended for `amemgym`, `longmemeval`, `locomo`, `beam`,
    `memoryagentbench`, `membench`, and `personamem` publication PRs.
- Self-contained generic non-MemoryArena public verifier template:
  `scripts/bench/public-sota/verify-public-generic-sota-evidence.template.mjs`
  - Syntax checked.
  - Validated against diagnostics-backed synthetic AMemGym evidence.
  - Validated against diagnostics-backed synthetic MemoryAgentBench evidence,
    including the Table 3 overall score path.
  - Intended repo path after real evidence is packaged:
    `scripts/bench/verify-public-<benchmark>-sota-evidence.mjs`.
- Guarded generic non-MemoryArena PR staging helper:
  `scripts/bench/public-sota/stage-public-benchmark-evidence-pr.sh`
  - Syntax checked.
  - Current no-run state tested with `amemgym`; exits `0` with `waiting:`.
  - Copies only manifest, diagnostics summary, SOTA comparison, public-safe
    artifact, generated markdown evidence doc, and verifier template.
  - End-to-end dry run passed against diagnostics-backed synthetic AMemGym
    evidence in throwaway worktree `<tmp>/remnic-synthetic-amemgym-sota-pr`:
    generated evidence doc, ran self-contained verifier, ran public-matrix
    verifier, and ran `gitleaks`.
  - Throwaway worktree and branch `codex/test-synthetic-amemgym-sota-stage`
    were removed after the dry run.
- Guarded generic non-MemoryArena PR publish helper:
  `scripts/bench/public-sota/publish-public-benchmark-evidence-pr.sh`
  - Syntax checked.
  - Current no-worktree state tested with `amemgym`; exits `0` with `waiting:`.
  - Commits, pushes, and opens/updates the benchmark evidence PR after staging.
- Publication branch verified from PR #1005: `bench/public-matrix-codex`.
  AMA evidence files live there; content lookup on `main` correctly returned
  404 because the benchmark-publication branch is separate.
- PR cleanliness verifier:
  `scripts/bench/public-sota/verify-pr-clean.mjs`
  - Uses GitHub GraphQL to check PR state, draft status, unresolved review
    threads, latest commit check rollup, and failed/pending status contexts.
  - Allows completed `SUCCESS`, `SKIPPED`, and `NEUTRAL` check-run
    conclusions while requiring the overall rollup to be `SUCCESS`.
  - Supports `--wait-seconds` so publish helpers can wait for new PR checks to
    settle.
  - Validated against merged AMA PR #1005: `ok: true`, `statusCheckRollup:
    SUCCESS`, `unresolvedThreads: 0`, `failedContexts: []`.
  - Wired into MemoryArena and generic publish helpers after PR create/update.
- Guarded transition launcher:
  `scripts/bench/public-sota/launch-next-after-memoryarena.sh`
  - Syntax checked.
  - Requires the MemoryArena scoring tmux session and publish watcher to be
    stopped.
  - Requires the MemoryArena evidence PR from
    `codex/publish-memoryarena-sota-bf9b264` to `bench/public-matrix-codex` to
    pass `verify-pr-clean.mjs --wait-seconds 1800` as an open-or-merged clean
    PR. This matches the user requirement of review-clean/CI-green/no unresolved
    threads without unnecessarily blocking later benchmark runs on merge.
  - Only then launches the next benchmark with
    `launch-next-public-benchmark.sh` and starts the 30-minute monitor.
  - Guard path tested while MemoryArena is active; exits `0` with `waiting:`
    and does not launch AMemGym.
- Lower-level benchmark launcher:
  `scripts/bench/public-sota/launch-next-public-benchmark.sh`
  - Hardened to prepend Homebrew `PATH`.
  - Hardened to refuse any active public benchmark scoring tmux session matching
    `public-*-codex-*<timestamp>`, not just the current MemoryArena session.
  - Guard path tested while MemoryArena is active; exits `3` and does not
    launch AMemGym.
- Post-MemoryArena transition watcher:
  `scripts/bench/public-sota/watch-next-after-memoryarena.sh`
  - Syntax checked.
  - Wait path tested while MemoryArena is active; logs `waiting:` and does not
    launch AMemGym.
  - Running in tmux session `remnic-next-after-memoryarena-watcher-bf9b2643`.
  - Log path:
    `${HOME}/.remnic/bench/results/public-matrix-codex-bf9b2643-20260515T052919Z/next-after-memoryarena-watcher.log`.
  - It repeatedly runs the guarded transition helper and stops once AMemGym is
    launched and monitored.
- Generic benchmark publish watcher:
  `scripts/bench/public-sota/watch-public-benchmark-publish.sh`
  - Syntax checked.
  - No-run wait path tested for `amemgym`; logs `waiting:` and does not stage
    or publish.
  - Running for AMemGym in tmux session `remnic-amemgym-publish-watcher`.
  - Log path:
    `${HOME}/.remnic/bench/results/watch-amemgym-publish.log`.
  - Once an AMemGym run exists and completes SOTA, it runs the generic
    completion, staging, publishing, and PR-clean gates, then stops.
  - If a completed result is not SOTA, writes
    `<results-dir>/<benchmark>-remediation-required.md` with the comparison
    path and the required real-world-preserving remediation steps before
    exiting.
- MemoryArena publish watcher remediation:
  `scripts/bench/public-sota/memoryarena/watch-and-publish-memoryarena.sh`
  - If MemoryArena completes but misses SOTA, writes
    `memory-arena-remediation-required.md` in the active results directory with
    the comparison path and required remediation/rerun steps before exiting.
  - Watcher was restarted after adding this branch and logged a fresh waiting
    state at `2026-05-16T18:58:05Z`.
- Generic benchmark transition watcher:
  `scripts/bench/public-sota/watch-next-after-benchmark.sh`
  - Syntax checked.
  - Supports queue transitions:
    `amemgym -> longmemeval`, `longmemeval -> locomo`, `locomo -> beam`,
    `beam -> memoryagentbench`, `memoryagentbench -> membench`, and
    `membench -> personamem`.
  - Wait path tested for `amemgym -> longmemeval`; logs `waiting:` while the
    AMemGym publish watcher is still running.
  - Running for `amemgym -> longmemeval` in tmux session
    `remnic-amemgym-to-longmemeval-watcher`.
  - Log path:
    `${HOME}/.remnic/bench/results/watch-amemgym-to-longmemeval.log`.
- Remaining queue watcher starter:
  `scripts/bench/public-sota/start-remaining-queue-watchers.sh`
  - Syntax checked.
  - Started publish watchers for `longmemeval`, `locomo`, `beam`,
    `memoryagentbench`, `membench`, and `personamem`.
  - Started transition watchers for `longmemeval -> locomo`, `locomo -> beam`,
    `beam -> memoryagentbench`, `memoryagentbench -> membench`, and
    `membench -> personamem`.
  - Verified those sessions are waiting and the only active public scoring
    tmux session remains MemoryArena.
- Consolidated pipeline status checker:
  `scripts/bench/public-sota/status-public-sota-pipeline.mjs`
  - Syntax checked.
  - Reports active scoring sessions, watcher sessions, generic `activeRun`
    progress/result files/diagnostics, MemoryArena compatibility progress and
    diagnostics, and latest run/result presence per benchmark.
  - Sample run at `2026-05-16T19:13:31Z` showed active benchmark
    `memory-arena`, no active result files, and diagnostics still clean.
- Pipeline health assertion:
  `scripts/bench/public-sota/assert-public-sota-pipeline-healthy.mjs`
  - Syntax checked.
  - Fails if the active pipeline does not have exactly one public scoring
    session, any phase-required watcher is missing, active-run diagnostics
    contain errors or nonzero exits, the latest completed diagnostic is older
    than the configured threshold, or the latest diagnostic does not prove
    `codex-cli`, `gpt-5.5`, `xhigh`, and `fast`.
  - Sample run at `2026-05-16T19:14:23Z` returned `ok: true`,
    `activeBenchmark: memory-arena`, `missingWatchers: []`, diagnostics
    `errors: 0`, `nonzero: 0`, and `expectedCodex` matching the required
    runtime settings.
- Objective completion audit:
  `scripts/bench/public-sota/audit-public-sota-completion.mjs`
  - Syntax checked.
  - Inspects `origin/bench/public-matrix-codex` directly with `git ls-tree`,
    not the active benchmark worktree, so published evidence is checked against
    the actual publication branch.
  - Uses `verify-pr-clean.mjs` for PR gates.
  - Sample run at `2026-05-16T19:02:37Z` returned `ok: false`; AMA-Bench was
    recognized as complete (`evidenceDocExists`, `verifierExists`,
    `manifestExists`, and `prClean` all true), while MemoryArena and the seven
    later benchmarks remain missing.

## Verification Completed For Scratch Tooling

- Syntax checks passed for generic comparator, packager, and verifier.
- Generic packager/verifier validated against synthetic shapes for:
  `amemgym`, `longmemeval`, `locomo`, `beam`, `personamem`,
  `memoryagentbench`, and `membench`.
- After diagnostics hardening, the generic packager/verifier was revalidated
  end-to-end with synthetic completed diagnostics for `amemgym`,
  `longmemeval`, `locomo`, `beam`, `personamem`, `memoryagentbench`, and
  `membench`.
- MemoryAgentBench-specific synthetic evidence was also package/verify tested
  with all ten paper Table 3 dataset metrics represented.
- Generic and MemoryArena evidence packagers/verifiers now require a diagnostics
  summary proving `codex-cli`, `gpt-5.5`, `xhigh`, and `fast`; missing
  diagnostics or nonzero/error/in-flight records fail evidence generation or
  verification.
- MemoryArena packager/verifier was revalidated end-to-end after diagnostics
  hardening using `scripts/bench/public-sota/memoryarena/synthetic-current-memoryarena-result.json`
  plus a synthetic completed diagnostics record.
- MemoryArena PR staging helper was revalidated end-to-end with the
  diagnostics-backed synthetic evidence package after adding `git worktree prune`
  before worktree creation, so repeated dry runs do not collide with stale
  removed worktree metadata.
- Publish helpers were hardened at `2026-05-16T19:18Z`:
  - MemoryArena and generic publish helpers now verify an existing PR when the
    evidence worktree is already clean instead of treating clean worktrees as
    completion by proxy.
  - MemoryArena and generic publish watchers now retry publish-helper failures
    instead of terminating permanently on transient PR-check lag.
  - MemoryArena and generic transition watchers now wait/retry when an evidence
    PR is not clean yet, instead of killing the downstream benchmark queue.
  - The 15 watcher tmux sessions were restarted after these script changes, and
    the active scoring session remained untouched.
- Generic staging was hardened at `2026-05-16T19:20Z` with `git worktree prune`,
  matching the MemoryArena staging helper so stale worktree metadata cannot
  block later benchmark PR staging.
- The active-run diagnostic scanner was hardened at `2026-05-16T19:21Z` so
  `errors`, `nonzero`, and `inFlight` count the full diagnostics directory, not
  only the newest sample. Live check: `12494` diagnostics, `0` errors, `0`
  nonzero exits, latest completed diagnostic still `codex-cli` / `gpt-5.5` /
  `xhigh` / `fast`.
- The active-run progress parser was hardened at `2026-05-16T19:23Z` to scan a
  larger run-log window and match the current benchmark label generically
  (`[<benchmark>]`), so it continues to work after MemoryArena hands off to the
  remaining queue. Live check now reports MemoryArena `1250/4209` tasks
  (`29.7%`), correcting the older stale `1250/4209` tail-only view.
- PR staging helpers were hardened at `2026-05-16T19:25Z` to copy the
  public-safe artifact named by `MANIFEST.<benchmark>.json` instead of inferring
  it from filename globs. Absolute paths and `..` path segments are rejected
  before copying into the PR worktree.
- Objective completion audit was hardened at `2026-05-16T19:27Z` to prepare a
  detached audit worktree for `origin/bench/public-matrix-codex` and run each
  committed self-contained evidence verifier whenever its manifest and verifier
  are present. Current audit executes AMA-Bench verifier successfully and still
  reports missing evidence/manifest/verifier/PR for MemoryArena and the seven
  later benchmarks.
- Objective completion audit was hardened again at `2026-05-16T19:29Z` to run
  the committed `scripts/bench/verify-public-matrix.ts` against every present
  manifest with the corresponding benchmark id. Current audit validates
  AMA-Bench with both the benchmark-specific verifier and public-matrix verifier
  (`issueCount: 0`), while all later benchmarks remain missing.
- PR cleanliness gate was hardened at `2026-05-16T19:46Z` to fail active
  `CHANGES_REQUESTED` review decisions in addition to unresolved review
  threads, non-green check rollups, and failed/pending contexts. Validation
  against merged AMA-Bench PR #1005 still returns `ok: true`.
- Objective completion audit was hardened at `2026-05-16T19:46Z` to refresh the
  current public SOTA target map and verify every published
  `<benchmark>-sota-comparison.json` target value against that map. AMA-Bench
  legacy evidence is explicitly skipped for this target-freshness check because
  it predates the comparison artifact format; future MemoryArena/generic
  artifacts must pass it.
- The Remnic `codex-cli` provider injects `--config service_tier="fast"` into
  each underlying `codex exec` call; future PR evidence still must prove this
  via diagnostics rather than relying on the implementation alone.
- The verifier rejects inconsistent aggregate/per-task evidence and enforces
  public-safe per-task score metadata.

## Next Required Action

Wait for active MemoryArena completion. When it finishes:

1. Compare raw result with `scripts/bench/public-sota/memoryarena/compare-memoryarena-sota.mjs`.
2. If SOTA, package and verify MemoryArena evidence.
3. Publish MemoryArena evidence through a clean PR.
4. Launch next benchmark with:
   `bash scripts/bench/public-sota/launch-next-public-benchmark.sh amemgym`
5. Start monitor:
   `bash scripts/bench/public-sota/start-run-monitor.sh <results-dir>`
