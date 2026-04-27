# Shots — App Store Scraping

Scrape App Store metadata and optionally download screenshots. This flow seeds research inputs. It does not generate images by itself.

## Notes

When `SEARCHAPI_KEY` is set, the scraper fetches screenshots grouped by device type through SearchAPI. Without it, screenshots come from iTunes and are typically iPhone-only.

## Steps

### 1. Get the URL

Accept the App Store URL from the user's argument. If it was not provided, ask for it.

### 2. Ensure the workspace exists

Run:

```bash
node {{scripts_path}}/scaffold.mjs --init --output-dir .shots/
```

### 3. Run the scraper

```bash
node {{scripts_path}}/scrape.mjs \
  --url "<url>" \
  --download-screenshots \
  --output-dir .shots/
```

### 4. Merge into config

Read or create `.shots/config.json`, then merge the scraper output into:

- `appName`
- `appStoreUrl`
- `aso.*`
- `ratings.*`
- `scrapedAssets.*`

Preserve any existing:

- `brandColors`
- `strategyBrief`
- `benefits`
- user-written positioning or audience notes

If the config has no `strategyBrief`, leave it blank for the create flow to fill after repo and competitor research.

### 5. Show the summary

Report:

- app name
- developer
- version
- rating and review count
- genres
- screenshot source and device breakdown

### 6. Suggest next steps

Recommend:

- reviewing `.shots/config.json`
- checking `.shots/app-screenshots/`
- running `generate` or `create` next so the strategy brief can be built
