#!/usr/bin/env node
/// <reference lib="es2016" types="node"/>
"use strict";

/** @type { {mirrors: { name: string, config: Record<string, string>}[] } } */
const { mirrors } = require("./mirrors.json");
const child_process = require("child_process");

/**
 *
 * @param {string[]} v
 * @returns { {mirror: string} }
 */
function parseArgs(v) {
  return { mirror: v[v.length - 1] };
}

const args = parseArgs(process.argv);
const selected = mirrors.find(i => i.name === args.mirror);
if (!selected) {
  console.error(`Usage: npm-mirror-set taobao`);
  process.exit(1);
}

function run(file, args) {
  const command = [file, ...args].join(" ");
  console.log("- " + command);
  child_process.execFileSync(file, args, {
    stdio: "inherit",
    shell: true
  });
}

for (const [k, v] of Object.entries(selected.config)) {
  run("npm", ["config", "set", k, v]);
}
