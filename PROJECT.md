# Remnic Fork — Project Tracker

## Fork Info

- **Fork:** `grgr4444bot/remnic`
- **Remote:** `https://github.com/grgr4444bot/remnic.git`
- **Local:** `/home/openclaw/.openclaw/workspace/remnic-fork/`
- **Upstream:** joshuaswarren/remnic (no git remote — PR manually via website)
- **Purpose:** Drop-in replacement of `@remnic/plugin-openclaw` with fixes for OpenClaw gateway mode

## Architecture

- Monorepo (pnpm workspaces)
- Main plugin entry: `packages/plugin-openclaw/` (published as `@remnic/plugin-openclaw`)
- Core package: `packages/remnic-core/`
- Built output: `packages/plugin-openclaw/dist/index.js`
- Installed to: `~/.openclaw/npm/node_modules/@remnic/plugin-openclaw/`
- Config: `~/.config/remnic/` controls model, memory dir, gateway agent IDs
- Two agents use it: `remnic` and `remnic-fast`

## Known Issues

### 1. Extraction in Gateway Mode

**Status:** ✅ Fixed in fork

**Problem:** The `buildExtractionInstructions()` method (used by gateway fallback and direct OpenAI client paths) lacked an explicit JSON schema example. Models (especially weaker gateway models) would output wrong field names like `memories` instead of `facts`, or use flat strings instead of structured objects.

**Fix:** Added explicit JSON schema example to the prompt, matching the Zod `ExtractionResultSchema`. Also removed duplicate hardcoded schema from `extractWithDirectClient`.

**Commit:** `d86f4205`

### 2. Gateway Mode vs Plugin Source Mode — Different Code Paths

**Status:** Analyzed — working as designed

**Findings:** When `modelSource === "gateway"`, remnic intentionally skips local LLM and direct OpenAI clients, routing all extraction through `FallbackLlmClient` which uses the gateway's model chain. This is by design — the plugin controls the prompt but the model selection is up to the gateway config.

### 3. Auto-Injection Only in System Prompt (Not Per-Turn)

**Status:** Analyzed — already works per-turn in new SDK

**Findings:** The `before_prompt_build` hook fires every turn, runs recall asynchronously, and caches the result. The `registerMemoryPromptSection` synchronous builder returns pre-computed lines from cache. If injection seems to only happen at session start, check SDK version, `hooks.allowPromptInjection`, session toggles, or cron recall mode settings.

### 4. Isolated/Cron Sessions Have No Remnic Tools

**Status:** ✅ Fixed in fork (commits `ae2d5e04` + pending)

**Problem:** In isolated cron sessions, the plugin loads in `registrationMode=tool-discovery`, which skips `registerTool()` entirely. The tool policy (`profile: minimal` + `alsoAllow`) evaluates against an empty tool registry, so `alsoAllow` entries are discarded as "unknown." The agent sees only `session_status`.

This affects any agent using `profile: minimal` with remnic tools in `alsoAllow`.

**Root Cause:** The plugin's `register()` method had a bare `return` in the tool-discovery path. No tools were ever registered on those API instances, so the policy engine couldn't match allowlist entries.

**Fix (commit `ae2d5e04`, revised):**
- Added a `REMNIC_TOOL_NAMES` array with all 42 known tool names
- Added `registerToolStubs(api)` function that registers minimal stub tools
- Tool-discovery path now checks `globalThis[keys.ORCHESTRATOR]`:
  - **If orchestrator exists** (main gateway already initialized in this process) → proceeds with **full init**, registering real tool implementations
  - **If no orchestrator** (cold gateway, metadata discovery) → registers **stubs only**, returns early
- Stubs exist only to satisfy tool policy matching; once the main gateway does a real init, subsequent tool-discovery calls get full init too

**Verification (2026-06-08):**
- Isolated cron session on `remnic-fast` agent: 38 remnic tools visible (up from 0), tools actually work
- All critical tools present: `memory_summarize_hourly`, `memory_store`, `memory_capture`, `continuity_*`, `compression_*`, `work_*`, `shared_*`, `compounding_*`, etc.
- 4 tools (`memory_search`, `memory_get`, `remnic_profiling_report`, `engram_profiling_report`) not visible — not in `alsoAllow` list (config issue, not registration issue)

## Build & Deploy

### Building

```bash
cd /home/openclaw/.openclaw/workspace/remnic-fork
pnpm install
pnpm run --filter @remnic/core build
pnpm run --filter @remnic/plugin-openclaw build
```

### Deploying as Drop-in Replacement

```bash
rm -rf ~/.openclaw/npm/node_modules/@remnic/core/dist
rm -rf ~/.openclaw/npm/node_modules/@remnic/plugin-openclaw/dist
cp -r packages/remnic-core/dist ~/.openclaw/npm/node_modules/@remnic/core/dist
cp -r packages/plugin-openclaw/dist ~/.openclaw/npm/node_modules/@remnic/plugin-openclaw/dist
```

## Progress Log

### 2026-05-31

- Fork created: `grgr4444bot/remnic`
- Cloned to `~/workspace/remnic-fork/`
- Identified known issues from usage and patch history
- PROJECT.md created
- Upstream remote removed (PRs will be manual via website)
- Built and deployed fork as drop-in replacement
- Fixed extraction prompt — added JSON schema example, removed duplicate in direct client (commit `d86f4205`)
- Analyzed all 3 known issues — extraction prompt was the only real code bug

### 2026-06-02

- **Extraction still failing** — "provider not found: openrouter" in FallbackLlmClient
- **Root cause:** Main agent's `models.json` missing `openrouter` provider. Only had `arcee`.
- **Fix:** Added `openrouter` provider to main agent's `models.json`
- Provider now resolves, but extraction still returns no parsed output
- **Next step:** Added debug logging to see raw LLM response. Don't know what the model actually returns yet.
- **Reverted:** `normalizeExtractionOutput` — premature without seeing actual LLM output
- **Prompt bug found:** JSON example in prompt was missing `tags` (required by Zod schema). Fixed.
- **Open questions:** 
  - What provider should FallbackLlmClient use? models.json only has arcee+openrouter (manually added). Gateway has Deep Infra, GMICloud, SiliconFlow etc.
  - Flush planner (remnic CLI) is not needed — user will delete it
  - Default remnic model is hardcoded `gpt-5.5` — when no model configured, it picks this instead of gateway model
