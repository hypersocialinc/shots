# /shots scrape — App Store Scraping

Scrape App Store metadata and optionally download screenshots. Does not generate images.

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
- `scrapedAssets.iconUrl`, `scrapedAssets.screenshotUrls`, `scrapedAssets.scrapedAt`

Preserve any existing user-provided fields (positioning, targetAudience, visualTone, brandColors, benefits).

### 5. Show summary

Display what was found:

```
App: My App
Developer: My Company
Version: 2.1.0
Rating: 4.7/5 (1,234 reviews)
Genres: Productivity, Business
Screenshots: 8 found and downloaded

Config updated: .shots/config.json
```

### 6. Suggest next steps

> Your App Store data is saved. Next steps:
> - Review `.shots/config.json` and fill in positioning/audience
> - Check `.shots/app-screenshots/` for downloaded screenshots
> - Run `/shots` to generate new marketing screenshots
