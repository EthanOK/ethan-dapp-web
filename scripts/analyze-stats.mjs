import { readFileSync } from "fs";

const html = readFileSync("build/stats.html", "utf-8");
const marker = "const data = ";
const start = html.indexOf(marker) + marker.length;
// data ends at ";\n" before the next statement
const tail = html.slice(start);
// find the matching end: the JSON is followed by ";" then run(...)
let depth = 0,
  end = -1,
  inStr = false,
  esc = false;
for (let i = 0; i < tail.length; i++) {
  const c = tail[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === "\\") esc = true;
    else if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') inStr = true;
  else if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const data = JSON.parse(tail.slice(0, end));

const parts = data.nodeParts; // uid -> { renderedLength, gzipLength, brotliLength, metaUid }
const sizeOf = (uid) => parts[uid]?.gzipLength ?? 0;

// Walk the tree; for each leaf (has uid), attribute to its chunk + package
function pkgName(pathParts) {
  // pathParts is array of node names from chunk root downward
  const idx = pathParts.findIndex((p) => p === "node_modules");
  if (idx === -1) return "(app source)";
  const rest = pathParts.slice(idx + 1);
  if (!rest.length) return "(node_modules)";
  let pkg = rest[0];
  if (pkg.startsWith("@") && rest.length > 1) pkg = pkg + "/" + rest[1];
  return pkg;
}

const chunks = {}; // chunkName -> { total, pkgs: {pkg: size} }

function walk(node, chunkName, trail) {
  if (node.uid) {
    const size = sizeOf(node.uid);
    const pkg = pkgName(trail);
    const c = (chunks[chunkName] ??= { total: 0, pkgs: {} });
    c.total += size;
    c.pkgs[pkg] = (c.pkgs[pkg] ?? 0) + size;
    return;
  }
  if (node.children) {
    for (const ch of node.children) walk(ch, chunkName, [...trail, ch.name]);
  }
}

for (const chunk of data.tree.children) {
  walk(chunk, chunk.name, []);
}

const sorted = Object.entries(chunks).sort((a, b) => b[1].total - a[1].total);

const fmt = (n) => (n / 1024).toFixed(1) + " KB";

console.log("=== Top chunks by gzip size ===\n");
for (const [name, info] of sorted.slice(0, 6)) {
  console.log(`\n### ${name}  —  total gzip ${fmt(info.total)}`);
  const pkgs = Object.entries(info.pkgs).sort((a, b) => b[1] - a[1]);
  for (const [pkg, size] of pkgs.slice(0, 15)) {
    if (size < 1024) continue;
    console.log(`   ${fmt(size).padStart(10)}  ${pkg}`);
  }
}
