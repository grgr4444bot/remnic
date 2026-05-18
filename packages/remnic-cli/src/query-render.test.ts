import test from "node:test";
import assert from "node:assert/strict";

import { renderQueryTextLines } from "./index.js";

test("plain text query output renders recall results content", () => {
  const lines = renderQueryTextLines({
    results: [{ content: "known fact" }],
  });

  assert.deepEqual(lines, ["- known fact"]);
});

test("plain text query output falls back to preview and context", () => {
  assert.deepEqual(
    renderQueryTextLines({
      results: [{ preview: "short preview" }],
    }),
    ["- short preview"],
  );
  assert.deepEqual(
    renderQueryTextLines({
      context: "recall context",
      results: [{}],
    }),
    ["- recall context"],
  );
});

test("plain text query output reports no results when recall results are empty", () => {
  assert.deepEqual(renderQueryTextLines({ results: [] }), ["No results."]);
  assert.deepEqual(renderQueryTextLines({}), ["No results."]);
});
