#!/usr/bin/env node
// Installs the bridge for the current user:
//   1. copies it to ~/.wheelman (Firefox may not read macOS-protected folders such as Desktop),
//   2. registers the native messaging host with Firefox,
//   3. registers the MCP server with every AI agent it finds: Claude Code, Codex,
//      Gemini CLI, Antigravity and Cursor (others: see the README).
// Flags: --uninstall removes all three; --bridge-only skips step 3.
// Also clears what the extension's former name, Kamurafox, left behind.
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const NAME = "wheelman";
const EXTENSION_ID = "wheelman@gabrielkamura";
const HOME = path.join(os.homedir(), ".wheelman");
const BRIDGE = path.join(HOME, "bridge");
const LAUNCHER = path.join(HOME, "native-host");
const MANIFEST_DIR = {
  darwin: path.join(os.homedir(), "Library", "Application Support", "Mozilla", "NativeMessagingHosts"),
  linux: path.join(os.homedir(), ".mozilla", "native-messaging-hosts"),
}[process.platform];
const flags = new Set(process.argv.slice(2));

if (!MANIFEST_DIR) {
  console.error("Only macOS and Linux are supported for now.");
  process.exit(1);
}
const MANIFEST = path.join(MANIFEST_DIR, `${NAME}.json`);
const LEGACY = "kamurafox"; // up to 0.1.0 the extension was called Kamurafox

const SERVER = path.join(BRIDGE, "mcp-server.js");
const CURSOR = path.join(os.homedir(), ".cursor");

const run = (bin, args) => spawnSync(bin, args, { encoding: "utf8", timeout: 30000 });
const has = (bin) => spawnSync("sh", ["-c", 'command -v "$0"', bin]).status === 0;

function claude(...args) {
  return run("claude", ["mcp", ...args]);
}

// Agents with an "mcp add" command. Each add first removes, so running setup again is safe.
const AGENTS = [
  {
    label: "Claude Code",
    bin: "claude",
    add: [["mcp", "remove", "-s", "user", NAME], ["mcp", "add", "-s", "user", NAME, "--", process.execPath, SERVER]],
    remove: ["mcp", "remove", "-s", "user", NAME],
  },
  {
    label: "Codex",
    bin: "codex",
    add: [["mcp", "remove", NAME], ["mcp", "add", NAME, "--", process.execPath, SERVER]],
    remove: ["mcp", "remove", NAME],
  },
  {
    label: "Gemini CLI",
    bin: "gemini",
    // Some "gemini" commands are wrappers around other tools: only touch the real CLI.
    real: () => /gemini mcp add/.test(run("gemini", ["mcp", "--help"]).stdout || ""),
    add: [["mcp", "remove", "-s", "user", NAME], ["mcp", "add", "-s", "user", NAME, process.execPath, SERVER]],
    remove: ["mcp", "remove", "-s", "user", NAME],
  },
  {
    label: "Antigravity",
    bin: "agy",
    add: [["mcp", "add", NAME, process.execPath, SERVER]],
    remove: ["mcp", "remove", NAME],
  },
];

// Cursor has no command for it: its servers live in ~/.cursor/mcp.json.
function cursor(install) {
  if (!fs.existsSync(CURSOR)) return null;
  const file = path.join(CURSOR, "mcp.json");
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") return false; // unreadable: leave it alone
  }
  config.mcpServers = config.mcpServers || {};
  if (install) config.mcpServers[NAME] = { command: process.execPath, args: [SERVER] };
  else if (!config.mcpServers[NAME]) return true;
  else delete config.mcpServers[NAME];
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  return true;
}

function agents(install) {
  const done = [];
  const failed = [];
  for (const agent of AGENTS) {
    if (!has(agent.bin) || (agent.real && !agent.real())) continue;
    if (!install) {
      run(agent.bin, agent.remove);
      continue;
    }
    const results = agent.add.map((args) => run(agent.bin, args));
    (results[results.length - 1].status === 0 ? done : failed).push(agent.label);
  }
  const wrote = cursor(install);
  if (install && wrote !== null) (wrote ? done : failed).push("Cursor");
  return { done, failed };
}

function dropLegacy() {
  const manifest = path.join(MANIFEST_DIR, `${LEGACY}.json`);
  const home = path.join(os.homedir(), `.${LEGACY}`);
  if (!fs.existsSync(manifest) && !fs.existsSync(home)) return;
  fs.rmSync(manifest, { force: true });
  fs.rmSync(home, { recursive: true, force: true });
  claude("remove", "-s", "user", LEGACY);
  console.log("Removed the old Kamurafox bridge. Remove the Kamurafox extension itself in Firefox, under about:addons.");
}

dropLegacy();

if (flags.has("--uninstall")) {
  fs.rmSync(MANIFEST, { force: true });
  fs.rmSync(HOME, { recursive: true, force: true });
  agents(false);
  console.log("Wheelman bridge removed. Remove the extension itself in Firefox, under about:addons.");
  process.exit(0);
}

fs.mkdirSync(BRIDGE, { recursive: true, mode: 0o700 });
fs.chmodSync(HOME, 0o700);
for (const file of ["native-host.js", "mcp-server.js"]) {
  fs.copyFileSync(path.join(__dirname, "bridge", file), path.join(BRIDGE, file));
}

// Firefox starts the host with a bare PATH, so the launcher names node by its full path.
fs.writeFileSync(LAUNCHER, `#!/bin/sh\nexec "${process.execPath}" "${path.join(BRIDGE, "native-host.js")}" "$@"\n`, { mode: 0o755 });
fs.chmodSync(LAUNCHER, 0o755);

fs.mkdirSync(MANIFEST_DIR, { recursive: true });
fs.writeFileSync(
  MANIFEST,
  JSON.stringify(
    {
      name: NAME,
      description: "Wheelman bridge between Firefox and local AI agents",
      path: LAUNCHER,
      type: "stdio",
      allowed_extensions: [EXTENSION_ID],
    },
    null,
    2
  ) + "\n"
);
console.log(`Bridge copied to ${BRIDGE}`);
console.log(`Firefox native host registered at ${MANIFEST}`);

if (!flags.has("--bridge-only")) {
  const { done, failed } = agents(true);
  if (done.length) console.log(`MCP server "${NAME}" registered with: ${done.join(", ")}. New sessions will see its tools.`);
  if (failed.length) console.log(`Could not register with: ${failed.join(", ")}. See "Other AI agents" in the README.`);
  if (!done.length && !failed.length) console.log(`No AI agent found. Point yours at the MCP server: "${process.execPath}" "${SERVER}"`);
}
