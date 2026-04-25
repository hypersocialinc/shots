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
 *
 * Environment:
 *   SEARCHAPI_KEY                Optional. When set, fetches device-grouped screenshots
 *                                via SearchAPI's apple_product engine (iPhone, iPad, Watch,
 *                                Mac, TV). Falls back to iTunes if missing or on failure.
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

// Normalize SearchAPI device names to short keys
function normalizeDeviceType(device) {
  const d = device.toLowerCase();
  if (d.includes("iphone") || d.includes("phone")) return "phone";
  if (d.includes("ipad") || d.includes("tablet")) return "tablet";
  if (d.includes("watch")) return "watch";
  if (d.includes("mac") || d.includes("desktop")) return "desktop";
  if (d.includes("tv") || d.includes("apple tv")) return "tv";
  return d;
}

/**
 * Fetch screenshots with device grouping from SearchAPI's apple_product engine.
 * Returns [{url, deviceType, displayOrder}] or null on failure/missing key.
 */
async function fetchSearchApiScreenshots(appId, country) {
  const key = process.env.SEARCHAPI_KEY;
  if (!key) return null;

  const params = new URLSearchParams({
    engine: "apple_product",
    product_id: String(appId),
    country,
    api_key: key,
  });

  try {
    const res = await fetch(`https://www.searchapi.io/api/v1/search?${params}`);
    if (!res.ok) {
      const body = await res.text();
      console.error(`Warning: SearchAPI returned HTTP ${res.status}: ${body.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const groups = data.app_details?.screenshots;
    if (!groups || !Array.isArray(groups)) return null;

    const screenshots = [];
    let order = 0;

    for (const group of groups) {
      const deviceType = normalizeDeviceType(group.device);
      for (const url of group.screenshots) {
        screenshots.push({ url, deviceType, displayOrder: order++ });
      }
    }

    return screenshots.length > 0 ? screenshots : null;
  } catch (err) {
    console.error(`Warning: SearchAPI request failed: ${err.message}`);
    return null;
  }
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

// Try SearchAPI for device-grouped screenshots
let searchApiScreenshots = null;
let screenshotSource = "itunes";

if (process.env.SEARCHAPI_KEY) {
  console.error("\nSearchAPI key detected, fetching device-grouped screenshots...");
  searchApiScreenshots = await fetchSearchApiScreenshots(appId, country);
  if (searchApiScreenshots) {
    screenshotSource = "searchapi";
    console.error(`SearchAPI: ${searchApiScreenshots.length} screenshots across devices`);
  } else {
    console.error("SearchAPI: no results, falling back to iTunes screenshots");
  }
} else {
  console.error("\nNo SEARCHAPI_KEY set, using iTunes screenshots");
}

// Build screenshotsByDevice map when SearchAPI is the source
let screenshotsByDevice = null;
if (screenshotSource === "searchapi" && searchApiScreenshots) {
  screenshotsByDevice = {};
  for (const s of searchApiScreenshots) {
    if (!screenshotsByDevice[s.deviceType]) {
      screenshotsByDevice[s.deviceType] = [];
    }
    screenshotsByDevice[s.deviceType].push(s.url);
  }
}

// Print summary to stderr
console.error(`\nApp: ${result.title}`);
console.error(`Developer: ${result.developer}`);
console.error(`Version: ${result.version}`);
console.error(`Rating: ${Math.round(result.score * 10) / 10}/5 (${result.reviews.toLocaleString()} reviews)`);
console.error(`Genres: ${result.genres.join(", ")}`);
if (screenshotsByDevice) {
  const deviceSummary = Object.entries(screenshotsByDevice)
    .map(([device, urls]) => `${device}: ${urls.length}`)
    .join(", ");
  console.error(`Screenshots: ${searchApiScreenshots.length} found via SearchAPI (${deviceSummary})`);
} else {
  console.error(`Screenshots: ${result.screenshots.length} found via iTunes`);
}

// Download screenshots if requested
if (args["download-screenshots"]) {
  const screenshotDir = path.join(outputDir, "app-screenshots");
  await fs.mkdir(screenshotDir, { recursive: true });
  console.error("\nDownloading screenshots...");

  if (screenshotSource === "searchapi" && searchApiScreenshots) {
    // Device-prefixed filenames: phone-screenshot-1.png, tablet-screenshot-1.png
    const deviceCounters = {};
    for (const s of searchApiScreenshots) {
      deviceCounters[s.deviceType] = (deviceCounters[s.deviceType] || 0) + 1;
      const idx = deviceCounters[s.deviceType];
      try {
        const response = await fetch(s.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = path.extname(new URL(s.url).pathname) || ".png";
        const filename = `${s.deviceType}-screenshot-${idx}${ext}`;
        await fs.writeFile(path.join(screenshotDir, filename), buffer);
        console.error(`  Downloaded: ${filename}`);
      } catch (err) {
        console.error(`  Failed to download ${s.deviceType} screenshot ${idx}: ${err.message}`);
      }
    }
  } else if (result.screenshots.length > 0) {
    // iTunes: app-screenshot-N.png
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
}

// Build flat screenshot URL list (for backward compat)
const allScreenshotUrls = screenshotSource === "searchapi" && searchApiScreenshots
  ? searchApiScreenshots.map((s) => s.url)
  : result.screenshots;

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
    screenshotUrls: allScreenshotUrls,
    screenshotSource,
    ...(screenshotsByDevice && { screenshotsByDevice }),
    scrapedAt: new Date().toISOString(),
  },
};

console.log(JSON.stringify(configPatch, null, 2));
