/**
 * Shared benchmark result config finalization.
 */

import type { BenchmarkResult, RunBenchmarkOptions } from "./types.js";

export function finalizeBenchmarkResultConfig(
  result: BenchmarkResult,
  options: Pick<RunBenchmarkOptions, "runtimeProfile" | "internalProvider">,
): BenchmarkResult {
  result.config.runtimeProfile ??= options.runtimeProfile ?? null;
  result.config.internalProvider ??= options.internalProvider ?? null;
  return result;
}
