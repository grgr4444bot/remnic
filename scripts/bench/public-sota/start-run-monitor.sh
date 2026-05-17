#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <results-dir>" >&2
  exit 2
fi

results_dir="$1"
run_id="$(basename "${results_dir}")"
monitor_session="${run_id}-monitor"
status_file="${results_dir}/status.tsv"
run_log="${results_dir}/run.log"
diag_dir="${results_dir}/codex-cli-diagnostics"
monitor_log="${results_dir}/monitor-30m.log"

if [[ ! -d "${results_dir}" ]]; then
  echo "Results directory does not exist: ${results_dir}" >&2
  exit 2
fi

if tmux has-session -t "${monitor_session}" 2>/dev/null; then
  echo "Monitor already running: ${monitor_session}"
  exit 0
fi

printf -v run_id_q '%q' "${run_id}"
printf -v status_q '%q' "${status_file}"
printf -v run_log_q '%q' "${run_log}"
printf -v diag_dir_q '%q' "${diag_dir}"
printf -v monitor_log_q '%q' "${monitor_log}"
printf -v results_dir_q '%q' "${results_dir}"

tmux new-session -d -s "${monitor_session}" \
  "while :; do { printf '=== '; date -u +%Y-%m-%dT%H:%M:%SZ; if tmux has-session -t ${run_id_q} 2>/dev/null; then echo tmux-running; else echo tmux-not-running; fi; cat ${status_q} 2>/dev/null || true; printf 'result_json='; find ${results_dir_q} -maxdepth 1 -type f -name '*.json' 2>/dev/null | wc -l | tr -d ' '; printf '\ndiagnostics='; find ${diag_dir_q} -type f -name '*.json' 2>/dev/null | wc -l | tr -d ' '; printf '\nrunlog_tail:\n'; tail -5 ${run_log_q} 2>/dev/null || true; printf '\n'; } >> ${monitor_log_q} 2>&1; sleep 1800; done"

echo "Monitor running: ${monitor_session}"
echo "Log: ${monitor_log}"
