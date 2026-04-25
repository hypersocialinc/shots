# /shots translate — Localization Flow

Translate existing screenshots into another language/locale.

## Steps

### 1. Load config and manifest

Read `.shots/config.json` for benefits and ASO data. Read `.shots/manifest.json` for existing shots.

### 2. Ask target locale

Ask: "What language/locale do you want to translate to? (e.g., Japanese, de-DE, fr-FR, es, pt-BR)"

### 3. List recent shots

Show the user recent shots from the manifest:

```
Recent shots:
  1. shot-a1b2c3 — 3 panels, openai, iphone, 2025-01-15 (hero: "See exactly where $200 went")
  2. shot-x7k9m2 — 3 panels, fal, ipad, 2025-01-14 (hero: "Sunday dinner, planned by Friday")
```

If the user provided a shot ID as an argument (e.g., `/shots-translate shot-a1b2c3 ja`), skip the listing and use that ID directly.

### 4. Ask which shot to translate

Ask the user to pick a shot by number or ID to use as the visual basis.

Read the selected shot's `dimensions` and `device` from `.shots/runs/{shotId}/metadata.json` or the manifest entry. Extract:
- `device` (e.g., `iphone`, `ipad`, `android`)
- `dimensions.compositeWidth`, `dimensions.compositeHeight`
- `dimensions.targetWidth`, `dimensions.targetHeight`

If the shot predates the `device` field, fall back to iPhone defaults from SKILL.md.

### 5. Translate benefits

For each benefit in config.json, translate:
- `headline` — Maintain the same emotional approach (moment/outcome/pain). Don't just word-swap; adapt the idiom for the target culture.
- `subtitle` — Translate with the same permission-granting tone

### 6. Translate ASO data

Translate the following fields:
- `aso.title` (max 30 chars in target language)
- `aso.subtitle` (max 30 chars)
- `aso.description` (max 4000 chars)
- `aso.keywords` (max 100 chars, comma-separated)

Present all translations to the user for review before generating.

### 7. Build localized prompt

Use the translated benefits to build a new generation prompt. Keep the same visual style, brand colors, and layout from the original shot. Only the text content changes.

### 8. Generate

Use the original shot's composite dimensions:

```bash
node {{scripts_path}}/generate.mjs \
  --prompt "..." \
  --references "..." \
  --width {compositeWidth} --height {compositeHeight} \
  --quality high \
  --output-dir .shots/runs/shot-{id}-{locale}/
```

Use a locale-suffixed directory name (e.g., `shot-a1b2c3-ja`, `shot-a1b2c3-de`).

### 9. Crop

Use the original shot's target dimensions:

```bash
node {{scripts_path}}/crop.mjs \
  --input .shots/runs/shot-{id}-{locale}/composite.png \
  --panels 3 \
  --target-width {targetWidth} --target-height {targetHeight} \
  --output-dir .shots/runs/shot-{id}-{locale}/screenshot/
```

### 10. Save metadata

Write prompt.md and metadata.json. Include `locale`, `parentId`, and `device` in metadata. Carry forward `device` and `dimensions` from the parent shot.

**metadata.json**:
```json
{
  "id": "shot-{id}-{locale}",
  "model": "gpt-image-2",
  "provider": "openai",
  "quality": "high",
  "panelCount": 3,
  "parentId": "shot-{originalId}",
  "device": "{device}",
  "locale": "{locale}",
  "dimensions": {
    "compositeWidth": "{compositeWidth}",
    "compositeHeight": "{compositeHeight}",
    "targetWidth": "{targetWidth}",
    "targetHeight": "{targetHeight}"
  },
  "createdAt": "..."
}
```

### 11. Update manifest

Append the localized shot to the manifest.

### 12. Open output

```bash
open .shots/runs/shot-{id}-{locale}/
```

### 13. Save translated ASO

Offer to save the translated ASO data to a locale-specific file:

```
.shots/aso-{locale}.json
```

This can be used for App Store Connect localization.
