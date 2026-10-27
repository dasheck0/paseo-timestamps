#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));
const manifest = JSON.parse(read("paseo-plugin.json"));
const lock = JSON.parse(read("package-lock.json"));
assert.equal(manifest.requirements.paseo, ">=0.13.2");
assert.equal(pkg.engines.node, ">=22");
assert.equal(lock.name, pkg.name);
assert.equal(lock.version, pkg.version);
for (const name of ["@getpaseo/client", "@getpaseo/plugin", "@getpaseo/protocol"]) {
  assert.equal(pkg.devDependencies[name], "0.13.2", `${name}: SDK must match minimum host`);
}
assert.deepEqual(lock.packages[""].devDependencies, pkg.devDependencies, "lockfile dependency mismatch");

// Exact paths only: additions must be explicitly reviewed, never whole directories.
const allowed = new Set([
  "package.json", "paseo-plugin.json", "README.md", "OVERVIEW.md", "LICENSE", "CHANGELOG.md",
  "index.client.tsx", "client/transform.ts", "client/message-schema.ts",
  "client/timestamp-model.ts", "client/timestamps.tsx",
  "assets/logo.png", "assets/preview.svg", "docs/feasibility.md", "docs/releasing.md",
]);
for (const file of pkg.files) assert(allowed.has(file), `Unreviewed package.files entry: ${file}`);
const [pack] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], {
  cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
}));
assert.equal(pack.name, pkg.name);
assert.equal(pack.version, pkg.version);
assert.equal(pack.files.length, new Set(pack.files.map(({ path: file }) => file)).size, "Duplicate packed paths");
const shipped = new Set(pack.files.map(({ path: file }) => file));
for (const file of shipped) assert(allowed.has(file), `Unexpected packed file: ${file}`);
for (const file of allowed) {
  assert(shipped.has(file), `Missing packed file: ${file}`);
}

// Follow source imports, re-exports, literal dynamic imports and require calls.
// The host compiles this source entrypoint; dist is intentionally not published.
const visited = new Set();
function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  assert(shipped.has(file), `Source dependency omitted from package: ${file}`);
  const source = read(file);
  const imports = /\b(?:import|export)\s+(?:[^;]*?\s+from\s*)?["']([^"']+)["']|\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of source.matchAll(imports)) {
    const specifier = match[1] ?? match[2];
    if (!specifier.startsWith(".")) continue;
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
    assert(!base.startsWith("../"), `Import escapes package: ${specifier}`);
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
    if (base.endsWith(".js")) candidates.push(`${base.slice(0, -3)}.ts`, `${base.slice(0, -3)}.tsx`);
    const resolved = candidates.find((candidate) => existsSync(path.join(root, candidate)));
    assert(resolved, `Unresolved source import ${specifier} in ${file}`);
    visit(resolved);
  }
}
visit("index.client.tsx");
for (const file of [manifest.icon, ...(manifest.media ?? [])]) {
  assert.equal(typeof file, "string", "Manifest asset must be a path");
  assert(shipped.has(file), `Manifest asset omitted: ${file}`);
}
console.log(`Package verified: ${shipped.size} reviewed files; ${visited.size} source modules.`);
