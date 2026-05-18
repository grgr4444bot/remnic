import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveConfigPath } from "./index.js";

const ORIGINAL_ENV = {
  HOME: process.env.HOME,
  USERPROFILE: process.env.USERPROFILE,
  REMNIC_CONFIG_PATH: process.env.REMNIC_CONFIG_PATH,
  ENGRAM_CONFIG_PATH: process.env.ENGRAM_CONFIG_PATH,
};

function restoreEnv(): void {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

test("resolveConfigPath expands home-relative CLI paths", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "remnic-config-home-"));
  try {
    process.env.HOME = home;
    delete process.env.REMNIC_CONFIG_PATH;
    delete process.env.ENGRAM_CONFIG_PATH;

    assert.equal(
      resolveConfigPath("~/remnic.json"),
      path.join(home, "remnic.json"),
    );
    assert.equal(
      resolveConfigPath("$HOME/remnic.json"),
      path.join(home, "remnic.json"),
    );
    assert.equal(
      resolveConfigPath("${HOME}/remnic.json"),
      path.join(home, "remnic.json"),
    );
  } finally {
    restoreEnv();
    await rm(home, { recursive: true, force: true });
  }
});

test("resolveConfigPath expands home-relative env config paths", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "remnic-config-home-"));
  try {
    process.env.HOME = home;
    process.env.REMNIC_CONFIG_PATH = "~/remnic.json";
    delete process.env.ENGRAM_CONFIG_PATH;

    assert.equal(resolveConfigPath(), path.join(home, "remnic.json"));

    delete process.env.REMNIC_CONFIG_PATH;
    process.env.ENGRAM_CONFIG_PATH = "${HOME}/engram.json";

    assert.equal(resolveConfigPath(), path.join(home, "engram.json"));
  } finally {
    restoreEnv();
    await rm(home, { recursive: true, force: true });
  }
});
