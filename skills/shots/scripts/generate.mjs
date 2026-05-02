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
 *   --timeout-ms <ms>         Request timeout in milliseconds (default: 900000)
 *   --partial-images <n>      Number of partial images to stream for OpenAI (0-3)
 *   --output-format <fmt>     Output format: png, jpeg, webp (default: png)
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
    "timeout-ms": { type: "string", default: "900000" },
    "partial-images": { type: "string", default: "0" },
    "output-format": { type: "string", default: "png" },
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
const timeoutMs = parseInt(args["timeout-ms"], 10);
const partialImages = parseInt(args["partial-images"], 10);
const outputFormat = args["output-format"];
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

function validateOpenAIImageSize(width, height) {
  const maxEdge = Math.max(width, height);
  const minEdge = Math.min(width, height);
  const totalPixels = width * height;

  return (
    maxEdge <= 3840 &&
    width % 16 === 0 &&
    height % 16 === 0 &&
    maxEdge / minEdge <= 3 &&
    totalPixels >= 655360 &&
    totalPixels <= 8294400
  );
}

function withHeartbeat(label) {
  const startedAt = Date.now();
  const interval = setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    console.error(`${label} still running... ${elapsedSeconds}s elapsed`);
  }, 10000);

  return () => clearInterval(interval);
}

async function updateRunMetadata(runDir, patch) {
  const metadataPath = path.join(runDir, "metadata.json");
  let metadata;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8"));
  } catch {
    return;
  }

  const nextMetadata = {
    ...metadata,
    ...patch,
  };
  await fs.writeFile(metadataPath, JSON.stringify(nextMetadata, null, 2) + "\n");

  const workspaceDir = path.dirname(path.dirname(runDir));
  const manifestPath = path.join(workspaceDir, "manifest.json");
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
  } catch {
    return;
  }

  const shotId = metadata.id ?? path.basename(runDir);
  const shot = manifest.shots?.find((entry) => entry.id === shotId);
  if (!shot) return;

  Object.assign(shot, patch);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

async function savePartialImage(outputDir, prefix, index, imageBase64) {
  const filename = `${prefix}-partial-${index + 1}.png`;
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));
  console.error(`Saved partial image: ${filename}`);
  return filePath;
}

function getCompositeFilename(outputFormat) {
  if (outputFormat === "jpeg") return "composite.jpeg";
  if (outputFormat === "webp") return "composite.webp";
  return "composite.png";
}

// OpenAI provider via Image API (also used for OpenRouter)
async function generateOpenAI(prompt, references, quality, width, height, timeoutMs, partialImages, outputFormat, outputDir, { baseURL, apiKey: overrideKey, model: overrideModel } = {}) {
  const apiKey = overrideKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is required for the openai provider.");

  const { default: OpenAI, toFile } = await import("openai");
  const clientOpts = { apiKey, timeout: timeoutMs };
  if (baseURL) clientOpts.baseURL = baseURL;
  const openai = new OpenAI(clientOpts);

  const referenceFiles = await Promise.all(
    references.map((ref) => toFile(ref.buffer, ref.filename, { type: ref.mimeType }))
  );

  const params = {
    model: overrideModel || "gpt-image-2",
    prompt,
    n: 1,
    size: `${width}x${height}`,
    quality,
    output_format: outputFormat,
  };

  const useStreaming = partialImages > 0 && validateOpenAIImageSize(width, height);

  if (partialImages > 0 && !useStreaming) {
    console.error(
      `Skipping OpenAI partial-image streaming for unsupported size ${width}x${height}. ` +
      "The size must satisfy the gpt-image-2 constraints: <=3840 max edge, multiples of 16, <=3:1 aspect ratio, and 655,360-8,294,400 total pixels."
    );
  }

  if (useStreaming) {
    const streamParams = {
      ...params,
      stream: true,
      partial_images: partialImages,
    };

    const stream =
      referenceFiles.length > 0
        ? await openai.images.edit(
            { ...streamParams, image: referenceFiles },
            { timeout: timeoutMs, stream: true }
          )
        : await openai.images.generate(streamParams, { timeout: timeoutMs, stream: true });

    let finalImage = null;
    let usage = null;
    const partialImageFiles = [];

    for await (const rawEvent of stream) {
      const eventName = rawEvent?.event ?? rawEvent?.type ?? null;
      const eventData = rawEvent?.data ?? rawEvent;

      if (
        eventName === "image_generation.partial_image" ||
        eventName === "image_edit.partial_image" ||
        eventData?.type === "image_generation.partial_image" ||
        eventData?.type === "image_edit.partial_image"
      ) {
        const partialIndex = eventData?.partial_image_index ?? 0;
        const partialB64 = eventData?.b64_json ?? eventData?.partial_image_b64 ?? null;
        if (!partialB64) continue;

        const partialFile = await savePartialImage(outputDir, "composite", partialIndex, partialB64);
        partialImageFiles.push(partialFile);
      }

      if (eventData?.b64_json) {
        finalImage = eventData.b64_json;
        usage = eventData.usage ?? usage ?? null;
      } else if (
        eventName === "image_generation.completed" ||
        eventName === "image_edit.completed" ||
        eventData?.type === "image_generation.completed" ||
        eventData?.type === "image_edit.completed"
      ) {
        finalImage = eventData?.b64_json ?? finalImage;
        usage = eventData?.usage ?? usage ?? null;
      }
    }

    if (!finalImage) throw new Error("OpenAI streaming image call completed without final image data.");

    return {
      imageBuffer: Buffer.from(finalImage, "base64"),
      providerMetadata: {
        api: "images",
        stream: true,
        timeoutMs,
        partialImages,
        outputFormat,
        size: `${width}x${height}`,
        usage,
      },
      partialImageFiles,
    };
  }

  const response =
    referenceFiles.length > 0
      ? await openai.images.edit({ ...params, image: referenceFiles }, { timeout: timeoutMs })
      : await openai.images.generate(params, { timeout: timeoutMs });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI did not return image data.");

  return {
    imageBuffer: Buffer.from(b64, "base64"),
    providerMetadata: {
      api: "images",
      stream: false,
      timeoutMs,
      partialImages: 0,
      outputFormat,
      size: `${width}x${height}`,
      created: response.created ?? null,
      usage: response.usage ?? null,
    },
    partialImageFiles: [],
  };
}

// fal.ai provider
async function generateFal(prompt, references, quality, width, height, outputFormat) {
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

  const modelPath = process.env.FAL_GPT_IMAGE_2_MODEL || "openai/gpt-image-2";
  const endpoint = imageUrls.length > 0 ? `${modelPath}/edit` : modelPath;

  const inputPayload = {
    prompt,
    image_size: { width, height },
    quality,
    num_images: 1,
    output_format: outputFormat,
  };

  if (imageUrls.length > 0) {
    inputPayload.image_urls = imageUrls;
  }

  const result = await fal.subscribe(endpoint, { input: inputPayload });
  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("fal.ai did not return an image URL.");

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download fal.ai image: ${response.status} ${response.statusText}`);

  return {
    imageBuffer: Buffer.from(await response.arrayBuffer()),
    providerMetadata: {
      api: "fal",
      stream: false,
      outputFormat,
      size: `${width}x${height}`,
      endpoint,
      imageUrl,
    },
    partialImageFiles: [],
  };
}

// Auto-detect provider
function detectProvider(explicit) {
  if (explicit === "openai") return "openai";
  if (explicit === "openrouter") return "openrouter";
  if (explicit === "fal") return "fal";
  if (explicit) throw new Error(`Unknown provider "${explicit}". Valid options: openai, openrouter, fal`);

  if (process.env.OPENAI_API_KEY) {
    console.error("Auto-detected provider: openai (OPENAI_API_KEY is set)");
    return "openai";
  }
  if (process.env.OPENROUTER_API_KEY) {
    console.error("Auto-detected provider: openrouter (OPENROUTER_API_KEY is set)");
    return "openrouter";
  }
  if (process.env.FAL_KEY) {
    console.error("Auto-detected provider: fal (FAL_KEY is set)");
    return "fal";
  }
  throw new Error(
    "No API key found. Set one of:\n  OPENAI_API_KEY — OpenAI direct\n  OPENROUTER_API_KEY — OpenRouter proxy\n  FAL_KEY — fal.ai proxy"
  );
}

// Main
const references = await loadReferences(args.references);
const provider = detectProvider(args.provider);
const referenceImagePaths = args.references
  ? args.references.split(",").map((p) => path.resolve(p.trim())).filter(Boolean)
  : [];

console.error(
  `Generating ${width}x${height} image via ${provider} ` +
  `(quality: ${quality}, timeout: ${timeoutMs}ms, partial images: ${partialImages})...`
);

const stopHeartbeat = withHeartbeat(`Image generation via ${provider}`);

let result;
try {
  if (provider === "openai") {
    result = await generateOpenAI(args.prompt, references, quality, width, height, timeoutMs, partialImages, outputFormat, outputDir);
  } else if (provider === "openrouter") {
    result = await generateOpenAI(args.prompt, references, quality, width, height, timeoutMs, partialImages, outputFormat, outputDir, {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: "openai/gpt-image-2",
    });
  } else {
    result = await generateFal(args.prompt, references, quality, width, height, outputFormat);
  }
} finally {
  stopHeartbeat();
}

await fs.mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, getCompositeFilename(outputFormat));
await fs.writeFile(outputPath, result.imageBuffer);

const modelName = provider === "openrouter" ? "openai/gpt-image-2" : provider === "openai" ? "gpt-image-2" : "openai/gpt-image-2";
await updateRunMetadata(outputDir, {
  quality,
  referenceImages: referenceImagePaths,
  generation: {
    provider,
    model: modelName,
    quality,
    timeoutMs,
    partialImages,
    outputFormat,
  },
  openai: (provider === "openai" || provider === "openrouter") ? result.providerMetadata : undefined,
  fal: provider === "fal" ? result.providerMetadata : undefined,
  partialImageFiles: result.partialImageFiles,
});

console.log(outputPath);
