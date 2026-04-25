#!/usr/bin/env node

/**
 * scrape.mjs — Scrape App Store metadata via iTunes Lookup API
 *
 * Usage:
 *   node scrape.mjs --url <app-store-url> [options]
 *   node scrape.mjs --id <app-id> [options]
 *
 * Options:
 *   --url <url>                  App Store URL (e.g. https://apps.apple.com/app/id123456)
 *   --id <id>                    App Store numeric ID
 *   --country <code>             Country code (default: us)
 *   --output-dir <dir>           Output directory (default: .)
 *   --download-screenshots       Download screenshot images to app-screenshots/
 */

import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    url: { type: "string", default: "" },
    id: { type: "string", default: "" },
    country: { type: "string", default: "us" },
    "output-dir": { type: "string", default: "." },
    "download-screenshots": { type: "boolean", default: false },
  },
});

// Parse app ID from URL
function parseAppStoreId(url) {
  const match = url.match(/\/id(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Resolve app ID
let appId;
if (args.id) {
  appId = parseInt(args.id, 10);
} else if (args.url) {
  appId = parseAppStoreId(args.url);
  if (!appId) {
    console.error("Error: Could not parse app ID from URL. Expected /id{number} in the URL.");
    process.exit(1);
  }
} else {
  console.error("Error: --url or --id is required");
  process.exit(1);
}

const country = args.country;
const outputDir = args["output-dir"];

// Fetch from iTunes Lookup API
console.error(`Scraping App Store data for ID ${appId} (country: ${country})...`);

const params = new URLSearchParams({
  id: String(appId),
  country,
  entity: "software",
});

const res = await fetch(`https://itunes.apple.com/lookup?${params}`);
if (!res.ok) {
  console.error(`Error: iTunes API returned HTTP ${res.status}`);
  process.exit(1);
}

const data = await res.json();
if (!data.results?.length) {
  console.error(`Error: App ${appId} not found in iTunes (country: ${country})`);
  process.exit(1);
}

const app = data.results[0];

const result = {
  appId: app.trackId,
  title: app.trackName ?? "",
  description: app.description ?? "",
  icon: app.artworkUrl512 ?? app.artworkUrl100 ?? "",
  genres: app.genres ?? [],
  genreIds: app.genreIds ?? [],
  developer: app.artistName ?? "",
  version: app.version ?? "",
  releaseNotes: app.releaseNotes ?? "",
  score: app.averageUserRating ?? 0,
  reviews: app.userRatingCount ?? 0,
  screenshots: app.screenshotUrls ?? [],
  url: app.trackViewUrl ?? args.url ?? "",
};

// Print summary to stderr
console.error(`\nApp: ${result.title}`);
console.error(`Developer: ${result.developer}`);
console.error(`Version: ${result.version}`);
console.error(`Rating: ${Math.round(result.score * 10) / 10}/5 (${result.reviews.toLocaleString()} reviews)`);
console.error(`Genres: ${result.genres.join(", ")}`);
console.error(`Screenshots: ${result.screenshots.length} found`);

// Download screenshots if requested
if (args["download-screenshots"] && result.screenshots.length > 0) {
  const screenshotDir = path.join(outputDir, "app-screenshots");
  await fs.mkdir(screenshotDir, { recursive: true });
  console.error("\nDownloading screenshots...");

  for (let i = 0; i < result.screenshots.length; i++) {
    const screenshotUrl = result.screenshots[i];
    try {
      const response = await fetch(screenshotUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = path.extname(new URL(screenshotUrl).pathname) || ".png";
      const filename = `app-screenshot-${i + 1}${ext}`;
      await fs.writeFile(path.join(screenshotDir, filename), buffer);
      console.error(`  Downloaded: ${filename}`);
    } catch (err) {
      console.error(`  Failed to download screenshot ${i + 1}: ${err.message}`);
    }
  }
}

// Write config-compatible JSON to stdout
const configPatch = {
  appName: result.title,
  appStoreUrl: result.url,
  aso: {
    title: result.title.slice(0, 30),
    subtitle: "",
    description: result.description.slice(0, 4000),
    keywords: "",
    genres: result.genres,
    developer: result.developer,
    version: result.version,
    releaseNotes: result.releaseNotes,
  },
  ratings: {
    score: Math.round(result.score * 10) / 10,
    reviewCount: result.reviews,
  },
  scrapedAssets: {
    iconUrl: result.icon,
    screenshotUrls: result.screenshots,
    scrapedAt: new Date().toISOString(),
  },
};

console.log(JSON.stringify(configPatch, null, 2));
