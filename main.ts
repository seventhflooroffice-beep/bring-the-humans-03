// bring-the-humans-03 entry program (Node 22, standard library only).
//
// The entry itself is the TikTok video; this program's whole job is to hand
// the video's address to the grader by copying VIDEO.json from the
// repository root into the output directory, where the gate reads it.
//
// Before copying, VIDEO.json is parsed and checked: it must be a JSON
// object whose "url" is an https address. A malformed file fails loudly
// here, with the reason on stderr, instead of reaching the grader as a
// silent invalid entry. The copy itself goes to a temporary name in the
// output directory and is renamed into place, so the output never holds
// a half-written VIDEO.json.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "VIDEO.json");
const targetPath = join(outputDir, "VIDEO.json");

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// Read and validate VIDEO.json before anything is written.
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(sourcePath, "utf8"));
} catch (err) {
  fail(`VIDEO.json could not be read or parsed: ${(err as Error).message}`);
}
const url = (parsed as { url?: unknown } | null)?.url;
if (typeof url !== "string" || !url.startsWith("https://")) {
  fail('VIDEO.json must be an object with an "url" string starting with "https://"');
}

// Copy via a temporary sibling, then rename into place atomically.
mkdirSync(outputDir, { recursive: true });
const tempPath = join(outputDir, "VIDEO.json.tmp");
copyFileSync(sourcePath, tempPath);
renameSync(tempPath, targetPath);
