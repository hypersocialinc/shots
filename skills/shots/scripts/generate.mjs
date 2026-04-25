#!/usr/bin/env node

/**
 * generate.mjs — Image generation via OpenAI or fal.ai
 *
 * Usage:
 *   node generate.mjs --prompt "..." [options]
 *
 * Options:
 *   --prompt <text>           Generation prompt (required)
 *   --provider openai|fal     Provider (default: auto-detect from env vars)
 *   --quality high|medium|low Quality level (default: high)
 *   --width <px>              Image width (default: 3456)
 *   --height <px>             Image height (default: 2400)
 *   --references <paths>      Comma-separated reference image paths
 *   --output-dir <dir>        Output directory (default: .)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    prompt: { type: "string" },
    provider: { type: "string", default: "" },
    quality: { type: "string", default: "high" },
    width: { type: "string", default: "3456" },
    height: { type: "string", default: "2400" },
    references: { type: "string", default: "" },
    "output-dir": { type: "string", default: "." },
  },
});

if (!args.prompt) {
  console.error("Error: --prompt is required");
  process.exit(1);
}

const width = parseInt(args.width, 10);
const height = parseInt(args.height, 10);
const quality = args.quality;
const outputDir = args["output-dir"];

// Load reference images
async function loadReferences(refArg) {
  if (!refArg) return [];
  const paths = refArg.split(",").map((p) => p.trim()).filter(Boolean);
  const refs = [];
  for (const refPath of paths) {
    try {
      const buffer = await fs.readFile(path.resolve(refPath));
      const ext = path.extname(refPath).toLowerCase();
      let mimeType = "image/png";
      if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".webp") mimeType = "image/webp";
      refs.push({ buffer, filename: path.basename(refPath), mimeType });
    } catch (err) {
      console.warn(`Warning: Could not read reference image "${refPath}": ${err.message}`);
    }
  }
  return refs;
}

// OpenAI provider
async function generateOpenAI(prompt, references, quality, width, height) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is required for the openai provider.");

  const { default: OpenAI, toFile } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const referenceFiles = await Promise.all(
    references.map((ref) => toFile(ref.buffer, ref.filename, { type: ref.mimeType }))
  );

  const params = {
    model: "gpt-image-2",
    prompt,
    n: 1,
    size: `${width}x${height}`,
    quality,
  };

  const response =
    referenceFiles.length > 0
      ? await openai.images.edit({ ...params, image: referenceFiles })
      : await openai.images.generate(params);

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI did not return image data.");

  return Buffer.from(b64, "base64");
}

// fal.ai provider
async function generateFal(prompt, references, quality, width, height) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY environment variable is required for the fal provider.");

  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: apiKey });

  // Upload reference images
  const imageUrls = [];
  for (const ref of references) {
    const arrayBuffer = ref.buffer.buffer.slice(
      ref.buffer.byteOffset,
      ref.buffer.byteOffset + ref.buffer.byteLength
    );
    const blob = new Blob([arrayBuffer], { type: ref.mimeType });
    const file = new File([blob], ref.filename, { type: ref.mimeType });
    const url = await fal.storage.upload(file);
    imageUrls.push(url);
  }

  const endpoint = imageUrls.length > 0 ? "fal-ai/gpt-image-2/edit" : "fal-ai/gpt-image-2";

  const inputPayload = {
    prompt,
    image_size: { width, height },
    quality,
    num_images: 1,
  };

  if (imageUrls.length > 0) {
    inputPayload.image_urls = imageUrls;
  }

  const result = await fal.subscribe(endpoint, { input: inputPayload });
  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("fal.ai did not return an image URL.");

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download fal.ai image: ${response.status} ${response.statusText}`);

  return Buffer.from(await response.arrayBuffer());
}

// Auto-detect provider
function detectProvider(explicit) {
  if (explicit === "openai") return "openai";
  if (explicit === "fal") return "fal";
  if (explicit) throw new Error(`Unknown provider "${explicit}". Valid options: openai, fal`);

  if (process.env.OPENAI_API_KEY) {
    console.error("Auto-detected provider: openai (OPENAI_API_KEY is set)");
    return "openai";
  }
  if (process.env.FAL_KEY) {
    console.error("Auto-detected provider: fal (FAL_KEY is set)");
    return "fal";
  }
  throw new Error(
    "No API key found. Set one of:\n  OPENAI_API_KEY — OpenAI direct\n  FAL_KEY — fal.ai proxy"
  );
}

// Main
const references = await loadReferences(args.references);
const provider = detectProvider(args.provider);

console.error(`Generating ${width}x${height} image via ${provider} (quality: ${quality})...`);

const imageBuffer =
  provider === "openai"
    ? await generateOpenAI(args.prompt, references, quality, width, height)
    : await generateFal(args.prompt, references, quality, width, height);

await fs.mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "composite.png");
await fs.writeFile(outputPath, imageBuffer);

console.log(outputPath);
