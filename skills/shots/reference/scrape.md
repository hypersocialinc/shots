# /shots scrape — App Store Scraping

Scrape App Store metadata and optionally download screenshots. Does not generate images.

**Screenshot sources:** When `SEARCHAPI_KEY` is set, the scraper uses SearchAPI's `apple_product` engine to fetch screenshots grouped by device type (phone, tablet, watch, desktop, tv). Without it, screenshots come from iTunes (iPhone only, ~8 max). SearchAPI failures fall back to iTunes automatically.

## Steps

### 1. Get URL

Accept the App Store URL from the user's argument. If none provided, ask:

> What's the App Store URL for your app? (e.g., https://apps.apple.com/app/my-app/id123456789)

### 2. Check workspace

Ensure `.shots/` directory exists. If not, create it with subdirs.

### 3. Run scraper

```bash
node {{scripts_path}}/scrape.mjs \
  --url "<url>" \
  --download-screenshots \
  --output-dir .shots/
```

The script outputs JSON to stdout containing the scraped data.

### 4. Update config.json

Read `.shots/config.json` (or create a fresh one). Merge the scraped data into it:

- `appName` — from scraped title
- `appStoreUrl` — the URL
- `aso.title`, `aso.description`, `aso.genres`, `aso.developer`, `aso.version`, `aso.releaseNotes`
- `ratings.score`, `ratings.reviewCount`
- `scrapedAssets.iconUrl`, `scrapedAssets.screenshotUrls`, `scrapedAssets.screenshotSource`, `scrapedAssets.scrapedAt`
- `scrapedAssets.screenshotsByDevice` (only present when SearchAPI is the source — `{ phone: [...], tablet: [...] }`)

Preserve any existing user-provided fields (positioning, targetAudience, visualTone, brandColors, benefits).

### 5. Show summary

Display what was found:

When iTunes is the source:
```
App: My App
Developer: My Company
Version: 2.1.0
Rating: 4.7/5 (1,234 reviews)
Genres: Productivity, Business
Screenshots: 8 found via iTunes and downloaded

Config updated: .shots/config.json
```

When SearchAPI is the source, show the device breakdown:
```
App: My App
Developer: My Company
Version: 2.1.0
Rating: 4.7/5 (1,234 reviews)
Genres: Productivity, Business
Screenshots: 18 found via SearchAPI (phone: 8, tablet: 6, desktop: 4)

Config updated: .shots/config.json
```

### 6. Suggest next steps

> Your App Store data is saved. Next steps:
> - Review `.shots/config.json` and fill in positioning/audience
> - Check `.shots/app-screenshots/` for downloaded screenshots
> - Run `/shots` to generate new marketing screenshots
