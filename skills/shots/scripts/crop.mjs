#!/usr/bin/env node

/**
 * crop.mjs — Crop a composite image into individual App Store panels
 *
 * Usage:
 *   node crop.mjs --input composite.png [options]
 *
 * Options:
 *   --input <path>           Input composite image (required)
 *   --panels <n>             Number of panels to crop (default: 3)
 *   --target-width <px>      Target panel width (default: 1284)
 *   --target-height <px>     Target panel height (default: 2778)
 *   --output-dir <dir>       Output directory (default: .)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const { values: args } = parseArgs({
  options: {
    input: { type: "string" },
    panels: { type: "string", default: "3" },
    "target-width": { type: "string", default: "1284" },
    "target-height": { type: "string", default: "2778" },
    "output-dir": { type: "string", default: "." },
  },
});

if (!args.input) {
  console.error("Error: --input is required");
  process.exit(1);
}

const panelCount = parseInt(args.panels, 10);
const targetWidth = parseInt(args["target-width"], 10);
const targetHeight = parseInt(args["target-height"], 10);
const outputDir = args["output-dir"];

const compositeBuffer = await fs.readFile(path.resolve(args.input));
const metadata = await sharp(compositeBuffer).metadata();
const compositeWidth = metadata.width;
const compositeHeight = metadata.height;

console.error(`Input: ${compositeWidth}x${compositeHeight}, cropping into ${panelCount} panels`);
console.error(`Target: ${targetWidth}x${targetHeight} per panel`);

// Calculate crop regions
function getCropRegions(panelCount, compositeWidth, compositeHeight) {
  if (panelCount === 1) {
    return [{ left: 0, top: 0, width: compositeWidth, height: compositeHeight }];
  }
  const columnWidth = Math.floor(compositeWidth / panelCount);
  const regions = [];
  for (let i = 0; i < panelCount; i++) {
    regions.push({
      left: columnWidth * i,
      top: 0,
      width: columnWidth,
      height: compositeHeight,
    });
  }
  return regions;
}

const cropRegions = getCropRegions(panelCount, compositeWidth, compositeHeight);

await fs.mkdir(outputDir, { recursive: true });

const outputFiles = [];

await Promise.all(
  cropRegions.map(async (crop, index) => {
    const panelBuffer = await sharp(compositeBuffer)
      .extract(crop)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();

    const filename = `panel-${index + 1}.png`;
    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, panelBuffer);
    outputFiles[index] = filePath;
    console.error(`  Saved: ${filename}`);
  })
);

// Print output paths to stdout (one per line)
for (const f of outputFiles) {
  console.log(f);
}
