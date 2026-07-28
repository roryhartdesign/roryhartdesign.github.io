import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const siteRoot = path.resolve("site");
const assetRoot = path.join(siteRoot, "assets", "squarespace");
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filePath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(filePath);
  }
}

await walk(siteRoot);
await mkdir(assetRoot, { recursive: true });

const documents = new Map();
const imageSources = new Set();
const fontSources = new Set();
const imagePattern = /https:\/\/images\.squarespace-cdn\.com[^"'<> )]+/g;
const fontPattern = /https:\/\/file\.squarespace-cdn\.com[^"'<> )]+/g;

for (const filePath of htmlFiles) {
  const html = await readFile(filePath, "utf8");
  documents.set(filePath, html);

  for (const match of html.match(imagePattern) ?? []) {
    imageSources.add(match.replaceAll("&amp;", "&").split("?")[0]);
  }
  for (const match of html.match(fontPattern) ?? []) {
    fontSources.add(match.replaceAll("&amp;", "&"));
  }
}

function localName(source, extension) {
  const digest = createHash("sha256").update(source).digest("hex").slice(0, 20);
  return `${digest}${extension}`;
}

const replacements = new Map();
const downloads = [];

for (const source of imageSources) {
  const filename = localName(source, ".webp");
  const publicPath = `/assets/squarespace/${filename}`;
  replacements.set(source, publicPath);
  downloads.push({
    source: `${source}?format=1500w`,
    output: path.join(assetRoot, filename),
  });
}

for (const source of fontSources) {
  const filename = localName(source, ".woff2");
  const publicPath = `/assets/squarespace/${filename}`;
  replacements.set(source, publicPath);
  downloads.push({ source, output: path.join(assetRoot, filename) });
}

let completed = 0;
const queue = [...downloads];

async function worker() {
  while (queue.length) {
    const item = queue.shift();
    const response = await fetch(item.source, {
      headers: { "user-agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`${response.status} ${item.source}`);
    await writeFile(item.output, Buffer.from(await response.arrayBuffer()));
    completed += 1;
    if (completed % 25 === 0 || completed === downloads.length) {
      console.log(`Downloaded ${completed} / ${downloads.length}`);
    }
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()));

for (const [filePath, original] of documents) {
  let html = original;

  html = html.replace(imagePattern, (match) => {
    const decoded = match.replaceAll("&amp;", "&");
    return replacements.get(decoded.split("?")[0]) ?? match;
  });

  html = html.replace(fontPattern, (match) => {
    const decoded = match.replaceAll("&amp;", "&");
    return replacements.get(decoded) ?? match;
  });

  await writeFile(filePath, html);
}

console.log(
  `Mirrored ${imageSources.size} images and ${fontSources.size} fonts across ${htmlFiles.length} pages.`,
);
