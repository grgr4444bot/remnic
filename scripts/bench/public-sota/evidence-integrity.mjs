import { createHash } from 'node:crypto';
import fs from 'node:fs';

export function sha256String(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function sha256File(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
}

export function sortDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortDeep(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value, indent = 2) {
  return `${JSON.stringify(sortDeep(value), null, indent)}\n`;
}

export function manifestArtifactHashIdentity(manifest) {
  return {
    schemaVersion: manifest.schemaVersion,
    run: {
      id: manifest.run?.id,
      ...(manifest.run?.mode ? { mode: manifest.run.mode } : {}),
      selectedBenchmarks: manifest.run?.selectedBenchmarks,
      runtimeProfiles: manifest.run?.runtimeProfiles,
      ...(Object.prototype.hasOwnProperty.call(manifest.run ?? {}, 'limit') ? { limit: manifest.run.limit } : {}),
      ...(Object.prototype.hasOwnProperty.call(manifest.run ?? {}, 'seed') ? { seed: manifest.run.seed } : {}),
    },
    git: {
      commit: manifest.git?.commit,
      shortCommit: manifest.git?.shortCommit,
    },
    command: {
      argv: manifest.command?.argv,
      envKeys: manifest.command?.envKeys,
    },
    environment: {
      platform: manifest.environment?.platform,
      arch: manifest.environment?.arch,
      nodeVersion: manifest.environment?.nodeVersion,
      ...(manifest.environment?.packageManager ? { packageManager: manifest.environment.packageManager } : {}),
    },
    ...(manifest.qmd ? { qmd: manifest.qmd } : {}),
    configFiles: manifest.configFiles,
    datasets: manifest.datasets,
    results: manifest.results,
    ...(manifest.publicArtifacts ? { publicArtifacts: manifest.publicArtifacts } : {}),
  };
}
