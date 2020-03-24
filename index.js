#!/usr/bin/env node
/// <reference lib="es2016" types="node"/>
"use strict";

const npm = require("npm");
const nopt = require("nopt");
/** @type { {mirrors: { name: string, config: Record<string, string>}[] } } */
const { mirrors } = require("./mirrors.json");

const options = nopt(
  {
    help: Boolean,
    global: Boolean,
    project: Boolean,
    user: Boolean
  },
  {
    h: ["--help"],
    g: ["--global"],
    u: ["--user"],
    p: ["--project"]
  }
);

const usage = `Usage: npm-mirror-set [-gup] <name>

    --global,-g   Save to global npm config.
    --user,-u     Save to user npm config.
                  Default when no save target specified.
    --project,-p  Save to project npm config.
    name          Mirror config name.
         taobao   Use https://npm.taobao.org as mirror

If you want add more config, send PR to
https://github.com/NateScarlet/npm-mirror-set\
`;

if (options.help) {
  console.log(usage);
  process.exit(0);
}

const selected =
  options.argv.remain.length === 1 &&
  mirrors.find(i => i.name === options.argv.remain[0]);
if (!selected) {
  console.error(usage);
  process.exit(1);
}

function handleError(err) {
  if (!err) {
    return;
  }
  console.error(err.stack || err.message);
  process.exit(typeof err.errno === "number" ? err.errno : 1);
}

function applyConfig(mirror, target) {
  for (const [k, v] of Object.entries(mirror.config)) {
    npm.config.set(k, v, target);
  }
  npm.config.save(target, err => {
    handleError(err);
    console.log(
      JSON.stringify({
        msg: "Mirror config set",
        name: mirror.name,
        target,
        path: npm.config.sources[target].path
      })
    );
  });
}

npm.load({}, err => {
  handleError(err);
  const targets = [];
  if (options.global) {
    targets.push("global");
  }
  if (options.user) {
    targets.push("user");
  }
  if (options.project) {
    targets.push("project");
  }
  if (targets.length == 0) {
    targets.push("user");
  }
  for (const i of targets) {
    applyConfig(selected, i);
  }
});
