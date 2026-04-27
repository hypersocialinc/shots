# /shots create — Full Creation Flow

Full flow: initialize the workspace, research the app, save a strategy brief, draft benefits, build a prompt, generate a 3-panel composite, and crop upload-ready screenshots.

## Steps

### 1. Ground the workspace

Run setup from `SKILL.md`.

If `.shots/config.json` is missing or obviously incomplete, run the Create Questionnaire from `SKILL.md`. If it exists, ask whether to keep the current config or update it.

### 2. Scrape when a URL exists

If the user gave an App Store URL, run:

```bash
node {{scripts_path}}/scrape.mjs --url "<url>" --download-screenshots --output-dir .shots/
```

Merge the returned JSON into `.shots/config.json` without overwriting existing user-provided positioning, brand, or strategy fields.

### 3. Open the workspace for inputs

Run:

```bash
open .shots/
```

Tell the user to add:

- current screenshots to `.shots/app-screenshots/`
- inspiration to `.shots/inspo/`

Wait for the user to say they are ready.

### 4. Build the strategy brief

Follow [strategy.md](strategy.md).

Do all of this before writing the generation prompt:

1. Research the app from the repo, listing, screenshots, inspo, and competitors.
2. Infer the theme, palette, audience, category expectations, and strongest differentiator.
3. Save a normalized `strategyBrief` to `.shots/config.json`.
4. Draft 6-8 benefits and save them to `.shots/config.json`.

If key unknowns remain, ask only the smallest number of clarifying questions needed to resolve them.

### 5. Present the strategy before generating

Show the user:

- the one-line positioning
- the chosen visual theme and palette
- the 3-5 main market words you plan to lean on
- the first 6-8 benefits

Ask for approval or targeted changes before generation.

### 6. Build the composite prompt

Follow [prompting.md](prompting.md).

Rules:

- Use the saved `strategyBrief` as the source of truth.
- Use the first 3 approved benefits, ordered by `panelArc`, for the first composite.
- For additional screenshots, continue with the next 3 benefits per composite.
- Expand each benefit into a concrete panel spec: exact headline, exact subtitle, exact screen content, breakout elements, and background depth treatment.
- For device panels, describe specific UI elements and data. Never say only "shows the app."

### 7. Select platforms

Read `devices` from `.shots/config.json`. Default to `["iphone"]` if missing.

Dimension mapping is in `SKILL.md`.

### 8. Scaffold, generate, and crop

For each selected platform, run:

**A. Scaffold**

```bash
node {{scripts_path}}/scaffold.mjs \
  --device {device} \
  --panel-count {panelCount} \
  --prompt "the full prompt text" \
  --model gpt-image-2 \
  --provider {openai|fal} \
  --quality high \
  --output-dir .shots/
```

Use the JSON stdout to capture `runDir`, `compositeFile`, `screenshotDir`, and `dimensions`.

**B. Generate**

Collect reference image paths from `.shots/inspo/` and `.shots/app-screenshots/`, then run:

```bash
node {{scripts_path}}/generate.mjs \
  --prompt "..." \
  --references "path1.png,path2.png" \
  --width {dimensions.compositeWidth} --height {dimensions.compositeHeight} \
  --quality high \
  --provider {openai|fal} \
  --output-dir {runDir}
```

**C. Crop**

```bash
node {{scripts_path}}/crop.mjs \
  --input {compositeFile} \
  --panels {panelCount} \
  --target-width {dimensions.targetWidth} --target-height {dimensions.targetHeight} \
  --output-dir {screenshotDir}
```

### 9. Open output

Run:

```bash
open {runDir}
```

Open each generated run directory.

### 10. Offer next steps

Prompt the user with:

- `"revise"` to iterate
- `"generate"` to make a new set
- `"translate to <locale>"` to localize

If multiple locales were requested up front, offer to start translation passes after the primary language is approved.
