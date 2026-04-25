# /shots create — Full Creation Flow

Full end-to-end flow: initialize workspace, gather context, craft benefits, generate screenshots.

## Steps

### 1. Check workspace

If `.shots/` doesn't exist, create it:

```bash
mkdir -p .shots/app-screenshots .shots/inspo .shots/runs .shots/styles
```

Create `.shots/.gitignore` if missing:

```
runs/
```

### 2. Check API keys

Verify `OPENAI_API_KEY` or `FAL_KEY` is set. If neither is set, **stop here** — tell the user:

> No API key found. Set `OPENAI_API_KEY` or `FAL_KEY` in your environment and try again.

Do not continue to the next step.

### 3. Onboarding (if no config.json)

If `.shots/config.json` doesn't exist or is empty, ask these questions:

1. **App name** (required): "What's your app called?"
2. **App Store URL** (optional): "What's your App Store URL? (leave blank to skip)"
3. **Positioning**: "What makes your app different from alternatives?"
4. **Target audience**: "Who is your app for?"
5. **Visual tone**: "Describe the visual aesthetic you want (e.g., clean and modern, bold and vibrant, dark and premium)"
6. **Brand colors** (optional): "Do you have brand colors? (primary, accent, text color)"

### 4. Scrape (if URL provided)

If the user provided an App Store URL:

```bash
node {{scripts_path}}/scrape.mjs --url "<url>" --download-screenshots --output-dir .shots/
```

Parse the JSON output and merge it into config.json.

### 5. Write config.json

Write the gathered data to `.shots/config.json` using the schema from SKILL.md.

### 6. Open folder for inspiration

```bash
open .shots/
```

Tell the user:

> I've opened your `.shots/` folder. Add your current screenshots to `app-screenshots/` and any design inspiration to `inspo/`. Say **"ready"** when you're done.

### 7. Wait for user

Wait for the user to confirm they've added their reference materials.

### 8. Analyze references

Once the user says "ready":
- Read any images in `.shots/app-screenshots/` and `.shots/inspo/`
- If inside a code repo, scan the codebase following the Benefit Discovery process in SKILL.md
- Understand the app's features, visual direction, and competitive position

### 9. Benefit discovery

Follow the full Benefit Discovery process from SKILL.md:
1. Phase 1: Analyze codebase/app
2. Phase 2: Draft 6-8 benefits using the three approaches
3. Phase 3: Ask clarifying questions
4. Phase 4: Save benefits to config.json

Benefits should be conversion-oriented. Each headline should make someone who sees it in a 0.5-second scroll stop and want the app.

Present the drafted benefits to the user for approval before generating.

### 10. Build prompt

Combine the approved benefits with config data to build the generation prompt. Follow the Prompt Template from SKILL.md. Use the first 3 benefits (sorted by narrative arc) for a 3-panel composite.

The screenshots must be high-converting — designed to stop the scroll and drive installs. Every panel earns its spot by making the viewer want the app.

### 11. Select platforms

Ask the user which platforms to generate for. Present as a multi-select with these options:

- **iPhone (6.5")** — App Store, 1284×2778 panels *(selected by default)*
- **iPad (12.9")** — App Store, 2048×2732 panels
- **Android Phone (16:9)** — Google Play, 1080×1920 panels

At least one platform must be selected. Show the target panel dimensions for each.

Platform dimensions reference (from SKILL.md):

| | iPhone | iPad | Android Phone |
|---|---|---|---|
| Composite | 3456×2400 | 6144×2732 | 3240×1920 |
| Panel | 1284×2778 | 2048×2732 | 1080×1920 |
| Device key | `iphone` | `ipad` | `android` |
| Dir suffix | *(none)* | `-ipad` | `-android` |

### 12. Generate

Generate a single base shot ID (e.g., `shot-a1b2c3`). This ID is shared across all selected platforms.

**For each selected platform**, run the generation script with that platform's composite dimensions:

Collect reference image paths from `.shots/inspo/` and `.shots/app-screenshots/`:

```bash
node {{scripts_path}}/generate.mjs \
  --prompt "..." \
  --references "path1.png,path2.png" \
  --width {compositeWidth} --height {compositeHeight} \
  --quality high \
  --output-dir .shots/runs/shot-{id}{suffix}/
```

Where `{suffix}` is empty for iPhone, `-ipad` for iPad, `-android` for Android Phone.

### 13. Crop

**For each selected platform**, crop using that platform's target dimensions:

```bash
node {{scripts_path}}/crop.mjs \
  --input .shots/runs/shot-{id}{suffix}/composite.png \
  --panels 3 \
  --target-width {targetWidth} --target-height {targetHeight} \
  --output-dir .shots/runs/shot-{id}{suffix}/screenshot/
```

### 14. Save metadata

**For each selected platform**, write to the run directory:

**prompt.md**:
```markdown
# shot-{id}{suffix}

## User Prompt
{the user's original request}

## Full Prompt
{the complete prompt sent to the API}
```

**metadata.json**:
```json
{
  "id": "shot-{id}{suffix}",
  "model": "gpt-image-2",
  "provider": "openai",
  "quality": "high",
  "panelCount": 3,
  "parentId": null,
  "device": "{device}",
  "dimensions": {
    "compositeWidth": "{compositeWidth}",
    "compositeHeight": "{compositeHeight}",
    "targetWidth": "{targetWidth}",
    "targetHeight": "{targetHeight}"
  },
  "createdAt": "..."
}
```

### 15. Update manifest

Read `.shots/manifest.json` (or create `{ "version": 2, "shots": [] }` if missing). **Append one entry per platform**, each with the `device` field. Non-iPhone entries use the suffixed ID (e.g., `shot-a1b2c3-ipad`, `shot-a1b2c3-android`). Write back.

### 16. Open output

```bash
open .shots/runs/shot-{id}{suffix}/
```

Open all generated directories (one `open` per platform).

### 17. Next steps

Ask the user:

> How do these look? You can:
> - `/shots-revise` to iterate on any panels
> - `/shots` to generate a new set
> - `/shots-translate` to localize for another language

## Shot ID Generation

Generate a unique 6-character lowercase alphanumeric suffix. Check against existing IDs in the manifest to ensure uniqueness. Format: `shot-{suffix}`.
