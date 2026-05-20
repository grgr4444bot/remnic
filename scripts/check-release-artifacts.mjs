import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function assertFile(relativePath) {
  await access(path.join(repoRoot, relativePath));
}

function normalizeJson(raw) {
  return `${JSON.stringify(JSON.parse(raw), null, 2)}\n`;
}

const requiredFiles = [
  "dist/index.js",
  "dist/access-cli.js",
  "dist/cli.js",
  "dist/connectors/index.js",
  "dist/connectors/codex-materialize.js",
  "dist/connectors/codex-materialize-runner.js",
  "dist/admin-console/public/index.html",
  "dist/admin-console/public/app.js",
];

await Promise.all(requiredFiles.map(assertFile));

const [rootManifest, packageManifest] = await Promise.all([
  readFile(path.join(repoRoot, "openclaw.plugin.json"), "utf8"),
  readFile(
    path.join(repoRoot, "packages", "plugin-openclaw", "openclaw.plugin.json"),
    "utf8",
  ),
]);

assert.equal(
  normalizeJson(rootManifest),
  normalizeJson(packageManifest),
  "root openclaw.plugin.json must stay synced with packages/plugin-openclaw/openclaw.plugin.json",
);
