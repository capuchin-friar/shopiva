/**
 * After `tsc`, copy any `.tsx` from `src/` into `dist/` with the same relative paths.
 * TypeScript does not emit .tsx as JS unless configured; this keeps runtime imports working.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcRoot = path.join(root, "src");
const distRoot = path.join(root, "dist");

/** @param {string} dir @param {string[]} out */
function collectTsx(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectTsx(full, out);
    else if (ent.isFile() && ent.name.endsWith(".tsx")) out.push(full);
  }
}

const files = [];
collectTsx(srcRoot, files);

for (const abs of files) {
  const rel = path.relative(srcRoot, abs);
  const dest = path.join(distRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(abs, dest);
}

if (files.length > 0) {
  console.log(`copy-tsx-files: copied ${files.length} file(s) to dist/`);
}
