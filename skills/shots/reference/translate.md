# Shots — Localization Flow

Translate an existing shot or run into a target locale. Keep the visual system and layout the same unless the user explicitly asks for locale-specific redesign.

## Contract

Inputs:

- a base `shot-id` or `run-id`
- a target locale

Output:

- a new localized run under `.shots/runs/`

## Steps

### 1. Resolve the base shot

Read `.shots/manifest.json` and `.shots/config.json`.

If the user supplied a `shot-id` or `run-id`, use it directly.

If they did not, list recent shots and ask them to choose one.

Read the selected shot's:

- original prompt
- `device`
- `panelCount`
- `dimensions`

### 2. Resolve the locale

If the locale was not supplied, ask for it.

### 3. Translate only the visible campaign copy

Translate the screenshot copy from the original prompt / saved benefits:

- keep the same panel roles
- keep the same emotional job of each panel
- adapt idioms where needed
- keep headline length suitable for screenshot readability

Do not redesign the campaign. Preserve:

- the same visual theme
- the same panel order
- the same device mix
- the same core promise

Only adjust strategy-level voice if the user explicitly asks for locale-specific adaptation.

### 4. Build the localized prompt

Follow [prompting.md](prompting.md).

Use the original shot as the base and swap in the localized headline/subtitle copy while preserving the rest of the visual instructions.

### 5. Scaffold, generate, and crop

**A. Scaffold**

```bash
node {{scripts_path}}/scaffold.mjs \
  --device {device} \
  --panel-count {panelCount} \
  --prompt "the full localized prompt" \
  --model gpt-image-2 \
  --provider {openai|fal} \
  --quality high \
  --parent {originalShotId} \
  --locale {locale} \
  --output-dir .shots/
```

**B. Generate**

```bash
node {{scripts_path}}/generate.mjs \
  --prompt "..." \
  --references "..." \
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

### 6. Open output

Run:

```bash
open {runDir}
```

Optional: if the user also wants localized App Store metadata, save a separate `.shots/aso-{locale}.json` file, but do not make that part of the default translation flow.
