#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:${PATH}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT_DEFAULT="$(git -C "${SCRIPT_DIR}/../../.." rev-parse --show-toplevel 2>/dev/null || (cd "${SCRIPT_DIR}/../../.." && pwd))"

REPO_ROOT="${REPO_ROOT:-${REPO_ROOT_DEFAULT}}"
LAUNCH_REPO_ROOT="${LAUNCH_REPO_ROOT:-${REPO_ROOT}}"
RESULTS_ROOT="${RESULTS_ROOT:-${HOME}/.remnic/bench/results}"
OUT_ROOT="${OUT_ROOT:-${RESULTS_ROOT}}"

active_scoring_session="$(tmux list-sessions -F '#S' 2>/dev/null \
  | grep -E '^public-.*-codex-.*[0-9]{8}T[0-9]{6}Z$' \
  | head -1 || true)"

if [[ -n "${active_scoring_session}" ]]; then
  echo "Refusing to launch: active public benchmark scoring session ${active_scoring_session} is still running." >&2
  exit 3
fi

benchmark="${1:-amemgym}"
case "${benchmark}" in
  amemgym|longmemeval|locomo|beam|memoryagentbench|membench|personamem) ;;
  *)
    echo "Usage: $0 [amemgym|longmemeval|locomo|beam|memoryagentbench|membench|personamem]" >&2
    exit 2
    ;;
esac

if ! git -C "${LAUNCH_REPO_ROOT}" rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "Launch repo is not a git checkout: ${LAUNCH_REPO_ROOT}" >&2
  exit 2
fi

if [[ ! -d "${LAUNCH_REPO_ROOT}/evals/datasets/${benchmark}" ]]; then
  echo "Dataset missing: ${LAUNCH_REPO_ROOT}/evals/datasets/${benchmark}" >&2
  exit 2
fi

git_sha="$(git -C "${LAUNCH_REPO_ROOT}" rev-parse HEAD)"
short_sha="${git_sha:0:8}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
run_id="public-${benchmark}-codex-${short_sha}-${timestamp}"
results_dir="${RESULTS_ROOT}/${run_id}"
out_dir="${OUT_ROOT}/${run_id}"
status_file="${results_dir}/status.tsv"
log_file="${results_dir}/run.log"

mkdir -p "${results_dir}" "${out_dir}"
printf 'benchmark\tstatus\ttimestamp\n' > "${status_file}"
printf '%s\tstart\t%s\n' "${benchmark}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "${status_file}"

cmd=(
  node packages/remnic-cli/bin/remnic.cjs bench published
  --name "${benchmark}"
  --dataset "evals/datasets/${benchmark}"
  --runtime-profile real
  --provider codex-cli
  --model gpt-5.5
  --system-codex-reasoning-effort xhigh
  --judge-provider codex-cli
  --judge-model gpt-5.5
  --judge-codex-reasoning-effort xhigh
  --internal-provider codex-cli
  --internal-model gpt-5.5
  --internal-codex-reasoning-effort xhigh
  --request-timeout 3600000
  --drain-timeout 3600000
  --max-429-wait 86400000
  --seed 1
  --results-dir "${results_dir}"
  --out "${out_dir}"
)

printf -v cmd_quoted '%q ' "${cmd[@]}"
printf -v repo_quoted '%q' "${LAUNCH_REPO_ROOT}"
printf -v log_quoted '%q' "${log_file}"
printf -v status_quoted '%q' "${status_file}"
printf -v benchmark_quoted '%q' "${benchmark}"
printf -v run_id_quoted '%q' "${run_id}"
session="${run_id}"
tmux new-session -d -s "${session}" -c "${LAUNCH_REPO_ROOT}" \
  "PATH=/opt/homebrew/bin:/opt/homebrew/sbin:\$PATH; export REMNIC_BENCH_RUN_ID=${run_id_quoted}; cd ${repo_quoted}; (${cmd_quoted}) >> ${log_quoted} 2>&1; rc=\$?; if [ \$rc -eq 0 ]; then printf '%s\tsuccess\t%s\n' ${benchmark_quoted} \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\" >> ${status_quoted}; else printf '%s\tfail:%s\t%s\n' ${benchmark_quoted} \"\$rc\" \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\" >> ${status_quoted}; fi; exit \$rc"

cat <<EOF
launched=${session}
benchmark=${benchmark}
launch_repo_root=${LAUNCH_REPO_ROOT}
launch_git_sha=${git_sha}
results_dir=${results_dir}
out_dir=${out_dir}
status_file=${status_file}
log_file=${log_file}
EOF
