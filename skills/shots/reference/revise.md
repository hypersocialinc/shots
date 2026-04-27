# Shots — Revision Flow

Iterate on an existing shot with precise, low-drift changes.

## Steps

### 1. Load the original shot

Read `.shots/manifest.json`. If it does not exist or has no shots, tell the user to run `/shots` first.

If no shot ID was provided, list recent shots and ask the user to pick one by number or ID.

### 2. Load the saved context

Read:

- `.shots/runs/{shotId}/prompt.md`
- `.shots/runs/{shotId}/metadata.json`
- `.shots/config.json`

Treat the original prompt as the base artifact.

Reuse the saved `strategyBrief` and `benefits` unless the user is explicitly changing:

- positioning
- audience
- theme/style family
- brand colors

### 3. Ask for revision feedback

Ask what should change.

Guide the user toward precise feedback:

- which panel
- what outcome they want
- what should stay the same

### 4. Rebuild the prompt surgically

Use the revision pattern from [prompting.md](prompting.md).

Append a `REVISION INSTRUCTIONS` block to the original prompt with:

- `Change`
- `Preserve`
- `Constraints`

If the user changed strategy-level direction, update `.shots/config.json` first, then rebuild the prompt from the revised strategy before appending targeted change/preserve notes.

### 5. Optionally add new references

Ask whether the user wants to add new reference images.

### 6. Scaffold, generate, and crop

Use the original shot's `device`, `panelCount`, and `dimensions`.

**A. Scaffold**

```bash
node {{scripts_path}}/scaffold.mjs \
  --device {device} \
  --panel-count {panelCount} \
  --prompt "the full revision prompt" \
  --model gpt-image-2 \
  --provider {openai|fal} \
  --quality high \
  --parent {originalShotId} \
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

### 7. Open output

Run:

```bash
open {runDir}
```

Ask whether the user wants another revision pass.
