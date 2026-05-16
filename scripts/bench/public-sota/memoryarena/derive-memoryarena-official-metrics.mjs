#!/usr/bin/env node
import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function mean(values) {
  assert(values.length > 0, 'cannot average an empty list');
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function taskKey(task) {
  const domain = String(task.details?.domain ?? '');
  const id = task.details?.taskId;
  assert(domain.length > 0, `missing details.domain on ${task.taskId ?? '<unknown>'}`);
  assert(Number.isInteger(id), `missing integer details.taskId on ${task.taskId ?? '<unknown>'}`);
  return `${domain}:${id}`;
}

export function deriveMemoryArenaOfficialMetrics(result) {
  assert(result.meta?.benchmark === 'memory-arena', 'result must be memory-arena');
  assert(result.meta?.mode === 'full', 'result must be full mode');
  assert(Array.isArray(result.results?.tasks), 'result must contain tasks');

  const tasksByKey = new Map();
  for (const task of result.results.tasks) {
    const key = taskKey(task);
    const domain = String(task.details.domain);
    const taskId = Number(task.details.taskId);
    const subtaskIndex = Number(task.details.subtaskIndex);
    assert(Number.isInteger(subtaskIndex), `missing integer subtaskIndex on ${task.taskId}`);

    const processScore = task.scores?.process_score;
    assert(
      typeof processScore === 'number' && Number.isFinite(processScore),
      `missing finite process_score on ${task.taskId}`,
    );

    const entry = tasksByKey.get(key) ?? {
      key,
      domain,
      taskId,
      subtasks: [],
      finalSubtaskIndex: -1,
      taskSuccessRate: undefined,
    };
    entry.subtasks.push({ subtaskIndex, processScore, scores: task.scores ?? {} });
    if (typeof task.scores?.task_success_rate === 'number') {
      entry.taskSuccessRate = task.scores.task_success_rate;
      entry.finalSubtaskIndex = subtaskIndex;
    }
    tasksByKey.set(key, entry);
  }

  const taskRows = [...tasksByKey.values()].map((task) => {
    task.subtasks.sort((a, b) => a.subtaskIndex - b.subtaskIndex);
    const duplicate = task.subtasks.find((subtask, index) =>
      index > 0 && subtask.subtaskIndex === task.subtasks[index - 1].subtaskIndex,
    );
    assert(!duplicate, `duplicate scored subtask ${duplicate?.subtaskIndex} for ${task.key}`);

    const passed = task.subtasks.filter((subtask) => subtask.processScore >= 1).length;
    const progressScore = passed / task.subtasks.length;
    const final = task.subtasks.at(-1);
    const taskSuccessRate =
      typeof task.taskSuccessRate === 'number'
        ? task.taskSuccessRate
        : (final?.processScore ?? 0);

    const planRecallValues = task.subtasks
      .map((subtask) => subtask.scores.plan_field_recall)
      .filter((value) => typeof value === 'number' && Number.isFinite(value));
    const softProcessValues = task.subtasks
      .map((subtask) => subtask.scores.soft_process_score)
      .filter((value) => typeof value === 'number' && Number.isFinite(value));

    return {
      key: task.key,
      domain: task.domain,
      taskId: task.taskId,
      scoredSubtasks: task.subtasks.length,
      passedSubtasks: passed,
      successRate: taskSuccessRate,
      progressScore,
      ...(planRecallValues.length > 0
        ? { softProgressScore: mean(planRecallValues) }
        : {}),
      ...(softProcessValues.length > 0
        ? { hardTravelProcessScore: mean(softProcessValues) }
        : {}),
    };
  });

  const byDomain = new Map();
  for (const row of taskRows) {
    const domain = byDomain.get(row.domain) ?? [];
    domain.push(row);
    byDomain.set(row.domain, domain);
  }

  const domainRows = [...byDomain.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([domain, rows]) => {
      const softRows = rows.filter((row) => typeof row.softProgressScore === 'number');
      const hardTravelRows = rows.filter((row) => typeof row.hardTravelProcessScore === 'number');
      return {
        domain,
        taskCount: rows.length,
        scoredSubtasks: rows.reduce((sum, row) => sum + row.scoredSubtasks, 0),
        successRate: mean(rows.map((row) => row.successRate)),
        progressScore: mean(rows.map((row) => row.progressScore)),
        ...(softRows.length > 0
          ? { softProgressScore: mean(softRows.map((row) => row.softProgressScore)) }
          : {}),
        ...(hardTravelRows.length > 0
          ? { hardTravelProcessScore: mean(hardTravelRows.map((row) => row.hardTravelProcessScore)) }
          : {}),
      };
    });

  const taskRowsWithSoftProgress = taskRows.filter((row) => typeof row.softProgressScore === 'number');
  const rawAggregate = Object.fromEntries(
    Object.entries(result.results.aggregates ?? {}).map(([key, value]) => [
      key,
      value && typeof value === 'object' && 'mean' in value ? value.mean : value,
    ]),
  );

  return {
    benchmark: result.meta.benchmark,
    mode: result.meta.mode,
    gitSha: result.meta.gitSha,
    taskCount: taskRows.length,
    scoredSubtasks: result.results.tasks.length,
    official: {
      successRate: mean(taskRows.map((row) => row.successRate)),
      progressScore: mean(taskRows.map((row) => row.progressScore)),
      ...(taskRowsWithSoftProgress.length > 0
        ? { softProgressScore: mean(taskRowsWithSoftProgress.map((row) => row.softProgressScore)) }
        : {}),
    },
    byDomain: domainRows,
    rawAggregateMeans: rawAggregate,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [resultPath] = process.argv.slice(2);

  if (!resultPath) {
    console.error('Usage: derive-memoryarena-official-metrics.mjs <raw-memory-arena-result.json>');
    process.exit(2);
  }

  const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const derived = deriveMemoryArenaOfficialMetrics(result);
  console.log(JSON.stringify(derived, null, 2));
}
