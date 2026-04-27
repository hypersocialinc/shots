#!/usr/bin/env node

/**
 * scaffold.mjs — Scaffold shot workspace and run directories
 *
 * Usage:
 *   node scaffold.mjs --init --output-dir .shots/
 *   node scaffold.mjs --device iphone --panel-count 3 --prompt "..." [options]
 *
 * Modes:
 *   --init                    Create workspace structure plus default config/manifest
 *
 * Run options (when not --init):
 *   --device <key>            Device key: iphone, ipad, android (required)
 *   --panel-count <n>         Number of panels (required)
 *   --prompt <text>           Full generation prompt (required)
 *   --model <name>            Model name (default: gpt-image-2)
 *   --provider <name>         Provider: openai or fal (default: openai)
 *   --quality <level>         Quality: high, medium, low (default: high)
 *   --parent <id>             Parent shot ID for revisions/translations
 *   --locale <code>           Locale code for translations (e.g. ja, de, es)
 *   --output-dir <dir>        Base workspace directory (default: .shots/)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    init: { type: "boolean", default: false },
    device: { type: "string" },
    "panel-count": { type: "string" },
    prompt: { type: "string" },
    model: { type: "string", default: "gpt-image-2" },
    provider: { type: "string", default: "openai" },
    quality: { type: "string", default: "high" },
    parent: { type: "string", default: "" },
    locale: { type: "string", default: "" },
    "output-dir": { type: "string", default: ".shots/" },
  },
});

// Dimension lookup by device key
const DIMENSIONS = {
  iphone: {
    compositeWidth: 3456,
    compositeHeight: 2400,
    targetWidth: 1284,
    targetHeight: 2778,
  },
  ipad: {
    compositeWidth: 6144,
    compositeHeight: 2732,
    targetWidth: 2048,
    targetHeight: 2732,
  },
  android: {
    compositeWidth: 3240,
    compositeHeight: 1920,
    targetWidth: 1080,
    targetHeight: 1920,
  },
};

// Device key → directory suffix
const SUFFIX = {
  iphone: "",
  ipad: "-ipad",
  android: "-android",
};

const outputDir = args["output-dir"];

function createDefaultConfig() {
  return {
    appName: "",
    appStoreUrl: "",
    devices: ["iphone"],
    locales: ["en"],
    panelCount: 3,
    brandColors: {
      primary: "",
      secondary: "",
      accent: "",
      text: "",
    },
    generation: {
      provider: "openai",
      quality: "high",
      timeoutMs: 900000,
      partialImages: 0,
      outputFormat: "png",
      visualStyle: "independent",
    },
    aso: {
      title: "",
      subtitle: "",
      description: "",
      keywords: "",
      genres: [],
      developer: "",
      version: "",
      releaseNotes: "",
    },
    ratings: {
      score: 0,
      reviewCount: 0,
    },
    scrapedAssets: {
      iconUrl: "",
      screenshotUrls: [],
      screenshotSource: "itunes",
      screenshotsByDevice: {},
      scrapedAt: "",
    },
    strategyBrief: {
      researchSources: {
        appStoreUrl: false,
        repo: false,
        appScreenshots: false,
        inspo: false,
      },
      appSummary: "",
      category: "",
      targetAudience: "",
      marketMaturity: "",
      competitors: [],
      positioning: {
        corePromise: "",
        differentiator: "",
        proofPoints: [],
      },
      voice: {
        tone: "",
        marketWords: [],
        reviewPhrases: [],
        tabooWords: [],
      },
      visualTheme: {
        styleFamily: "",
        mood: "",
        palette: {
          primary: "",
          secondary: "",
          accent: "",
          text: "",
        },
        motifs: [],
      },
      panelArc: ["hero", "core", "closer"],
    },
    benefits: [],
  };
}

// --init mode: create workspace structure
if (args.init) {
  const dirs = ["app-screenshots", "inspo", "runs", "styles"];
  for (const dir of dirs) {
    await fs.mkdir(path.join(outputDir, dir), { recursive: true });
  }

  const gitignorePath = path.join(outputDir, ".gitignore");
  try {
    await fs.access(gitignorePath);
  } catch {
    await fs.writeFile(gitignorePath, "runs/\n");
  }

  const configPath = path.join(outputDir, "config.json");
  try {
    await fs.access(configPath);
  } catch {
    await fs.writeFile(configPath, JSON.stringify(createDefaultConfig(), null, 2) + "\n");
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  try {
    await fs.access(manifestPath);
  } catch {
    await fs.writeFile(manifestPath, JSON.stringify({ version: 3, shots: [] }, null, 2) + "\n");
  }

  console.error(`Workspace initialized: ${outputDir}`);
  console.log(
    JSON.stringify({
      workspace: outputDir,
      configFile: configPath,
      manifestFile: manifestPath,
    })
  );
  process.exit(0);
}

// Run mode: validate required args
if (!args.device) {
  console.error("Error: --device is required (iphone, ipad, android)");
  process.exit(1);
}
if (!DIMENSIONS[args.device]) {
  console.error(`Error: unknown device "${args.device}". Valid: iphone, ipad, android`);
  process.exit(1);
}
if (!args["panel-count"]) {
  console.error("Error: --panel-count is required");
  process.exit(1);
}
if (!args.prompt) {
  console.error("Error: --prompt is required");
  process.exit(1);
}

const device = args.device;
const panelCount = parseInt(args["panel-count"], 10);
const dimensions = DIMENSIONS[device];
const suffix = SUFFIX[device];

// Generate timestamp ID: shot-YYYYMMDD-HHmmss
function generateId() {
  const now = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `shot-${stamp}`;
}

const id = generateId();

// Compute run directory name
let runDirName = id;
if (args.locale) {
  runDirName = `${id}-${args.locale}`;
} else if (suffix) {
  runDirName = `${id}${suffix}`;
}

const runsDir = path.join(outputDir, "runs");
const runDir = path.join(runsDir, runDirName);
const screenshotDir = path.join(runDir, "screenshot");

// Ensure workspace dirs exist
await fs.mkdir(runsDir, { recursive: true });

// Create run directories
await fs.mkdir(screenshotDir, { recursive: true });
console.error(`Created: ${runDir}`);

// Write prompt.md
const promptContent = `# ${runDirName}\n\n${args.prompt}\n`;
await fs.writeFile(path.join(runDir, "prompt.md"), promptContent);
console.error("Wrote: prompt.md");

// Write metadata.json
const metadata = {
  id: runDirName,
  model: args.model,
  provider: args.provider,
  quality: args.quality,
  panelCount,
  device,
  dimensions,
  parentId: args.parent || null,
  locale: args.locale || null,
  generation: {
    provider: args.provider,
    model: args.model,
    quality: args.quality,
  },
  referenceImages: [],
  createdAt: new Date().toISOString(),
};
await fs.writeFile(
  path.join(runDir, "metadata.json"),
  JSON.stringify(metadata, null, 2) + "\n"
);
console.error("Wrote: metadata.json");

// Append to manifest.json
const manifestPath = path.join(outputDir, "manifest.json");
let manifest;
try {
  manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
} catch {
  manifest = { version: 3, shots: [] };
}

const compositeFile = path.join("runs", runDirName, "composite.png");
const screenshotFiles = Array.from({ length: panelCount }, (_, i) =>
  path.join("runs", runDirName, "screenshot", `panel-${i + 1}.png`)
);

manifest.shots.push({
  id: runDirName,
  compositeFile,
  screenshotFiles,
  prompt: args.prompt,
  model: args.model,
  provider: args.provider,
  quality: args.quality,
  referenceImages: [],
  parentId: args.parent || null,
  device,
  locale: args.locale || null,
  panelCount,
  dimensions,
  generation: {
    provider: args.provider,
    model: args.model,
    quality: args.quality,
  },
  createdAt: metadata.createdAt,
});

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.error("Updated: manifest.json");

// Output JSON to stdout
const result = {
  id,
  runDir,
  compositeFile: path.join(runDir, "composite.png"),
  screenshotDir,
  dimensions,
};
console.log(JSON.stringify(result));
