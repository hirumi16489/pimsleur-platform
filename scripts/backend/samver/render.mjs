#!/usr/bin/env node
// scripts/samver/render.mjs
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

/**
 * Usage:
 *   node scripts/samver/render.mjs \
 *     --template backend/infra/template.yaml \
 *     --out backend/infra/template.rendered.yaml \
 *     --handlers-root backend/src/application/handlers \
 *     [--strict]
 */

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) {
      const k = cur.slice(2);
      const v = arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true;
      acc.push([k, v]);
    }
    return acc;
  }, [])
);

const templatePath = args.template || "backend/infra/template.yaml";
const outPath = args.out || templatePath.replace(/\.ya?ml$/i, ".rendered.yaml");
const handlersRoot = args["handlers-root"] || "backend/src/application/handlers";
const strict = !!args.strict;

// load template
const templateAbs = path.resolve(templatePath);
if (!fs.existsSync(templateAbs)) {
  console.error(`Template not found: ${templateAbs}`);
  process.exit(1);
}
const tpl = YAML.parse(fs.readFileSync(templateAbs, "utf8")) ?? {};
const resources = tpl.Resources ?? {};

// collect function logical IDs + CodeUri
const functionEntries = Object.entries(resources).filter(
  ([, r]) => r?.Type === "AWS::Serverless::Function"
);

// build LambdaSamver map
const repoRoot = path.resolve(path.dirname(templateAbs), ".."); // adjust if your layout differs
const lambdaSamver = {};

for (const [logicalId, rsrc] of functionEntries) {
  const codeUri = rsrc?.Properties?.CodeUri;
  if (typeof codeUri !== "string") {
    if (strict) throw new Error(`Function ${logicalId} has non-string CodeUri; cannot derive package.json`);
    continue;
  }
  const handlerDir = path.resolve(repoRoot, codeUri);
  const pkgPath = path.join(handlerDir, "package.json");

  if (!fs.existsSync(pkgPath)) {
    const msg = `Missing package.json for ${logicalId} at ${pkgPath}`;
    if (strict) throw new Error(msg);
    console.warn(`[samver] ${msg} (skipping)`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const name = pkg.name || logicalId;
  const version = pkg.version || "0.0.0";

  lambdaSamver[logicalId] = { value: `${name}@${version}` };
}

// inject mapping
tpl.Mappings = { ...(tpl.Mappings ?? {}), LambdaSamver: lambdaSamver };

// write rendered template
const rendered = YAML.stringify(tpl);
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, rendered, "utf8");

console.log(`[samver] Wrote ${outPath}`);
for (const [id, { value }] of Object.entries(lambdaSamver)) {
  console.log(`  - ${id}: ${value}`);
}