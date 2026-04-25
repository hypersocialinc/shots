# /shots revise — Revision Flow

Iterate on existing shots with targeted feedback.

## Steps

### 1. Load manifest

Read `.shots/manifest.json`. If it doesn't exist or has no shots, tell the user to run `/shots` first.

### 2. List recent shots

Show the user recent shots from the manifest:

```
Recent shots:
  1. shot-a1b2c3 — 3 panels, openai, iphone, 2025-01-15 (hero: "See exactly where $200 went")
  2. shot-x7k9m2 — 3 panels, fal, ipad, 2025-01-14 (hero: "Sunday dinner, planned by Friday")
```

If the user provided a shot ID as an argument (e.g., `/shots revise shot-a1b2c3`), skip the listing and use that ID directly.

### 3. Ask which shot to revise

Ask the user to pick a shot by number or ID.

### 4. Ask for feedback

Ask: "What would you change about these panels?"

Guide them to be specific:
- Reference panel positions: "panel 1", "left panel", etc.
- Describe the desired outcome, not just the problem
- If the layout is good but colors are wrong, say so explicitly

### 5. Load original prompt and dimensions

Read the original prompt from `.shots/runs/{shotId}/prompt.md`.

Read dimensions and device from `.shots/runs/{shotId}/metadata.json` or the manifest entry for this shot. Extract:
- `device` (e.g., `iphone`, `ipad`, `android`)
- `dimensions.compositeWidth`, `dimensions.compositeHeight`
- `dimensions.targetWidth`, `dimensions.targetHeight`

If the shot predates the `device` field (no `device` in metadata or manifest), fall back to iPhone defaults from SKILL.md.

### 6. Build revision prompt

Construct a new prompt that includes:
- The original full prompt
- The user's feedback as revision instructions

Format:
```
{original prompt}

REVISION INSTRUCTIONS:
{user feedback}
```

### 7. Optionally accept new references

Ask: "Do you want to add any new reference images? (paths or 'no')"

### 8. Generate

Use the original shot's composite dimensions:

```bash
node {{scripts_path}}/generate.mjs \
  --prompt "..." \
  --references "..." \
  --width {compositeWidth} --height {compositeHeight} \
  --quality high \
  --output-dir .shots/runs/shot-{newId}{suffix}/
```

Where `{suffix}` matches the parent shot's device suffix (empty for iPhone, `-ipad` for iPad, `-android` for Android).

### 9. Crop

Use the original shot's target dimensions:

```bash
node {{scripts_path}}/crop.mjs \
  --input .shots/runs/shot-{newId}{suffix}/composite.png \
  --panels 3 \
  --target-width {targetWidth} --target-height {targetHeight} \
  --output-dir .shots/runs/shot-{newId}{suffix}/screenshot/
```

### 10. Save metadata

Write prompt.md and metadata.json to the new run directory. Set `parentId` to the original shot's ID to maintain the revision chain. Carry forward `device` and `dimensions` from the parent shot.

**metadata.json**:
```json
{
  "id": "shot-{newId}{suffix}",
  "model": "gpt-image-2",
  "provider": "openai",
  "quality": "high",
  "panelCount": 3,
  "parentId": "shot-{originalId}",
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

### 11. Update manifest

Append the new shot to the manifest with `parentId` linking to the original and the same `device` field.

### 12. Open output

```bash
open .shots/runs/shot-{newId}{suffix}/
```

Ask: "How does the revision look? Want to revise further?"
