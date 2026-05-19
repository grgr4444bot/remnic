import assert from "node:assert/strict";
import test from "node:test";

import { mergeRemnicConfigForServer } from "./index.js";

test("server config merge preserves openaiApiKey=false over OPENAI_API_KEY env override", () => {
  const merged = mergeRemnicConfigForServer(
    {
      openaiApiKey: false,
      localLlmEnabled: true,
    },
    {
      openaiApiKey: "sk-env-should-not-be-used",
      memoryDir: "/tmp/remnic-memory",
    },
  );

  assert.equal(merged.openaiApiKey, false);
  assert.equal(merged.localLlmEnabled, true);
  assert.equal(merged.memoryDir, "/tmp/remnic-memory");
});

test("server config merge keeps env OPENAI_API_KEY when direct client is not disabled", () => {
  const merged = mergeRemnicConfigForServer(
    {
      localLlmEnabled: true,
    },
    {
      openaiApiKey: "sk-env",
    },
  );

  assert.equal(merged.openaiApiKey, "sk-env");
});
