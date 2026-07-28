import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../dist");
const textExtensions = new Set([".css", ".html", ".js", ".txt", ".xml"]);
const failures = [];
let htmlPages = 0;
let localReferences = 0;

const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(item)));
    else files.push(item);
  }
  return files;
};

const exists = async (target) => {
  try {
    return (await stat(target)).isFile();
  } catch {
    return false;
  }
};

const resolveLocal = async (reference) => {
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  const target = path.join(dist, clean);
  if (path.extname(target)) return exists(target);
  return (await exists(target)) || exists(path.join(target, "index.html"));
};

const files = await walk(dist);
for (const file of files) {
  const extension = path.extname(file);
  if (!textExtensions.has(extension)) continue;
  const contents = await readFile(file, "utf8");

  if (/squarespace|sqspcdn|static1\.squarespace/i.test(contents)) {
    failures.push(`${path.relative(dist, file)} contains a Squarespace reference`);
  }

  if (extension === ".html") {
    htmlPages += 1;
    const references = [
      ...contents.matchAll(/\b(?:href|src)="([^"]+)"/g),
    ].map((match) => match[1]);
    for (const reference of references) {
      if (!reference.startsWith("/")) continue;
      localReferences += 1;
      if (!(await resolveLocal(reference))) {
        failures.push(
          `${path.relative(dist, file)} has a missing reference: ${reference}`,
        );
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${htmlPages} HTML pages and ${localReferences} local references.`,
  );
}
