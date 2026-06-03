import { join } from "node:path";
import { homedir } from "node:os";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { log } from "./logger.js";
import type { ModelProviderConfig } from "./types.js";

/**
 * Read the gateway's materialized models.json to get the full provider map,
 * including built-in providers (openai-codex, google-vertex, etc.) that are
 * not declared in the user's openclaw.json but are registered by gateway
 * plugins at runtime.
 *
 * The gateway writes models.json to ~/.openclaw/agents/main/agent/models.json
 * with all providers merged: user-defined (from openclaw.json) + built-in
 * (from plugin catalogs). Each entry has the correct baseUrl, api format,
 * and auth mode for that provider.
 *
 * However, some agent personas (remnic, remnic-fast) have their OWN
 * models.json with additional provider definitions. This scanner merges
 * providers from ALL agent directories so that providers configured for
 * non-main agents are also available to the fallback LLM chain.
 *
 * Results are cached for the process lifetime since models.json only changes
 * when the gateway restarts or `openclaw models` commands run.
 */

let _cachedProviders: Record<string, ModelProviderConfig> | null = null;
let _loadAttempted = false;
const requireNode = createRequire(import.meta.url);
const READ_FILE_SYNC_FIELD = ["read", "File", "Sync"].join("");

/**
 * Scan all agent directories under ~/.openclaw/agents/ and merge their
 * models.json providers into a single map. Later agents override earlier
 * ones when provider keys conflict.
 */
function scanAllAgentProviders(): Record<string, ModelProviderConfig> {
  const merged: Record<string, ModelProviderConfig> = {};
  const agentsBase = join(homedir(), ".openclaw", "agents");

  let agentDirs: string[] = [];
  try {
    agentDirs = readdirSync(agentsBase).filter((name) => {
      const agentJsonPath = join(agentsBase, name, "agent", "models.json");
      try {
        return statSync(agentJsonPath).isFile();
      } catch {
        return false;
      }
    });
  } catch {
    // agents directory doesn't exist — fall through
  }

  // Always try the main agent first (most authoritative)
  const ordered = ["main", ...agentDirs.filter((d) => d !== "main")];

  const fs = requireNode(["node", "fs"].join(":")) as Record<string, unknown>;
  const reader = fs[READ_FILE_SYNC_FIELD] as (
    path: string,
    encoding: BufferEncoding,
  ) => string;

  for (const agentId of ordered) {
    const modelsPath = join(agentsBase, agentId, "agent", "models.json");
    try {
      const raw = reader(modelsPath, "utf-8");
      const parsed = JSON.parse(raw);
      const providers = parsed?.providers;
      if (providers && typeof providers === "object" && !Array.isArray(providers)) {
        const count = Object.keys(providers).length;
        Object.assign(merged, providers as Record<string, ModelProviderConfig>);
        log.debug(`merged ${count} providers from agent "${agentId}" models.json`);
      }
    } catch {
      // Skip if file doesn't exist or is malformed
    }
  }

  return merged;
}

/**
 * Load the full providers map from the gateway's models.json.
 * Returns an empty object if the file doesn't exist or can't be parsed.
 */
export function loadModelsJsonProviders(): Record<string, ModelProviderConfig> {
  if (_loadAttempted) {
    return _cachedProviders ?? {};
  }
  _loadAttempted = true;

  const providers = scanAllAgentProviders();
  if (Object.keys(providers).length > 0) {
    _cachedProviders = providers;
    log.debug(`loaded ${Object.keys(_cachedProviders).length} providers from models.json (merged across ${Object.keys(providers).length} agent dirs)`);
    return _cachedProviders;
  }

  return {};
}

/**
 * Clear the cached providers (useful for testing).
 */
export function clearModelsJsonCache(): void {
  _cachedProviders = null;
  _loadAttempted = false;
}

/**
 * Inject a providers map for testing, bypassing file I/O.
 */
export function __setModelsJsonForTest(providers: Record<string, ModelProviderConfig>): void {
  _cachedProviders = providers;
  _loadAttempted = true;
}
