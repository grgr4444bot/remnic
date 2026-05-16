# AMA-Bench Agent-Class SOTA Evidence (Codex CLI gpt-5.5)

This document publishes the completed Remnic AMA-Bench full run from the
`public-matrix-codex-bf9b2643-20260515T052919Z` public-matrix attempt.

## Result

| Field | Value |
| --- | --- |
| Benchmark | AMA-Bench |
| Comparison class | Agent / memory-system leaderboard |
| Result | Agent-class SOTA |
| Remnic score | `0.6496122948369937` AMA-Bench leaderboard average; raw question-weighted recommended accuracy `0.6542467948717948` |
| Prior top verified agent score | `0.557925` |
| Model-only caveat | The top verified model-only entry was `gpt 5.2` at `0.6982833333333333`; this run does not beat the model-only leaderboard. |
| Tasks | `2496 / 2496` |
| Runtime profile | `real` |
| System provider/model | Codex CLI `gpt-5.5` |
| Judge provider/model | Codex CLI `gpt-5.5` |
| Internal provider/model | Codex CLI `gpt-5.5` |
| Reasoning effort | `xhigh` for system, judge, and internal providers |
| Service tier | `fast` in Codex CLI diagnostics |
| Commit | `bf9b264356a537e70fce1bddbca3495bf8a19b31` |
| Dataset hash | `90826eb21ce703a0b82078752e9eafeaca30b3976c897daff341a9f9ad77277e` |
| Result hash | `7930b614b3a6085c007315c0a6470130c8d4ed956220a79b61ea822f621c609b` |

## Committed Artifacts

- Public-safe benchmark artifact:
  `docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z/2026-05-15-ama-bench-gpt-5.5-real-bf9b264.json`
- Raw local benchmark result hash, recorded in the manifest but not committed because it contains full questions, answers, model responses, and recalled text:
  `7930b614b3a6085c007315c0a6470130c8d4ed956220a79b61ea822f621c609b`
- Reproducibility manifest:
  `docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z/MANIFEST.ama-bench.json`
- Codex CLI diagnostic summary:
  `docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z/ama-bench-diagnostics-summary.json`

The diagnostic summary covers completed Codex CLI calls with
`finishedAt <= MANIFEST.generatedAt` for the AMA-Bench run. It records
`8307` completed diagnostic records, all with provider `codex-cli`, model
`gpt-5.5`, reasoning effort `xhigh`, service tier `fast`, status `0`, and
zero captured errors.

The manifest keeps the raw uncommitted benchmark-result entry in `results[]`
for compatibility with the standard manifest schema. The committed sanitized
derivative is listed separately in `publicArtifacts[]`.

## Metrics

From the raw result artifact:

| Metric | Mean |
| --- | ---: |
| `ama_bench_leaderboard_average` | `0.6496122948369937` |
| `ama_bench_recommended_accuracy` | `0.6542467948717948` |
| `llm_judge` | `0.6542467948717948` |
| `f1` | `0.37428827221642497` |
| `contains_answer` | `0.020032051282051284` |

## Public Comparison Source

The comparison target was computed from the AMA-Bench Hugging Face
leaderboard raw JSONL files on 2026-05-15/2026-05-16:

- `https://huggingface.co/spaces/AMA-bench/AMA-bench-Leaderboard/resolve/main/data/agent.jsonl`
- `https://huggingface.co/spaces/AMA-bench/AMA-bench-Leaderboard/resolve/main/data/model.jsonl`

Verified leaderboard target summary at publication time:

- Top verified agent average: `0.557925`
- Top verified model average: `0.6982833333333333` (`gpt 5.2`)

This PR claims only the agent / memory-system leaderboard result.

## Reproduction

Use the same Remnic commit and dataset hash recorded in the manifest.
The original command envelope was:

```bash
PATH=/opt/homebrew/bin:/opt/homebrew/sbin:$PATH \
  packages/remnic-cli/bin/remnic.cjs bench published \
  --name ama-bench \
  --dataset evals/datasets/ama-bench \
  --runtime-profile real \
  --provider codex-cli \
  --model gpt-5.5 \
  --system-codex-reasoning-effort xhigh \
  --judge-provider codex-cli \
  --judge-model gpt-5.5 \
  --judge-codex-reasoning-effort xhigh \
  --internal-provider codex-cli \
  --internal-model gpt-5.5 \
  --internal-codex-reasoning-effort xhigh \
  --request-timeout 3600000 \
  --drain-timeout 3600000 \
  --max-429-wait 86400000 \
  --seed 1 \
  --results-dir <results-dir> \
  --out docs/benchmarks/results/public-matrix-codex-bf9b2643-20260515T052919Z \
  --ama-bench-judge-protocol recommended \
  --trial-concurrency 6
```

Verify the committed public-safe evidence with:

```bash
node scripts/bench/verify-public-ama-agent-sota-evidence.mjs
```

The verifier recomputes the 24-cell AMA leaderboard average from the committed
per-task scores, checks the public artifact hash, verifies the raw result hash
recorded in the manifest, and validates the compact Codex CLI diagnostic
summary.

The committed public-safe artifact includes aggregate metrics and per-task scores, but omits question text, expected answers, model answers, and recalled text. The raw local benchmark result hash is recorded in `MANIFEST.ama-bench.json` for reproducibility. The committed diagnostic summary is intentionally compact; it proves the Codex CLI tuple for the completed AMA window without committing thousands of raw per-call diagnostic files. The original uncommitted raw result and diagnostic folder remain under the local results directory for deeper audit.
