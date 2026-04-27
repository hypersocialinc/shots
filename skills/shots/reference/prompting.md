# Shots — GPT Image 2 Prompting Contract

Turn the saved `strategyBrief` and chosen `benefits` into one crop-safe composite prompt.

## Objective

Create one wide App Store composite that becomes three standalone ads after cropping. Optimize for thumbnail clarity and install intent first.

## Rules

- use visual facts, not praise words
- use market-native wording from `strategyBrief.voice`
- do not copy competitor claims verbatim
- keep copy short and verbatim
- device screens must show specific UI
- decorative elements must support the promise, not distract from it
- optimize for browse-feed stopping power before full-size polish
- treat panel 1 like it may be the only panel the user really notices
- existing screenshots are visual reference, not copy reference

Avoid words like:

- `stunning`
- `beautiful`
- `masterpiece`
- `innovative`
- `seamless`

## Prompt Template

```text
Create one {width}x{height} App Store marketing composite for "{appName}" with {panelCount} equal vertical panels and no visible seams.

Campaign:
- Goal: maximize thumb-stop attention and install intent
- Category: {category}
- Audience: {targetAudience}
- Core promise: {corePromise}
- Differentiator: {differentiator}

Visual direction:
- Style family: {styleFamily}
- Mood: {mood}
- Palette: primary {primary}, secondary {secondary}, accent {accent}, text {text}
- Motifs: {motif1}, {motif2}, {motif3}

Typography:
- Headline is large, bold, high-contrast, and readable at thumbnail size
- Subtitle is smaller and supportive
- Render all quoted text verbatim

Panels:
{panel blocks}

Constraints:
- each panel crops cleanly to {targetWidth}x{targetHeight}
- keep text at least 80px from crop edges
- no borders, dividers, seams, App Store badges, or fake marketplace chrome
- device screens must show believable UI, never blank placeholders
```

## Panel Blocks

### Device-led panel

```text
Panel {n} ({arcPosition}):
- EXACT HEADLINE: "{headline}"
- EXACT SUBTITLE: "{subtitle}"
- Role: {what the panel must prove}
- Layout: {textPosition} text, centered device
- Device: iPhone X style hardware, jet-black frame, thin bezels, centered notch
- Screen shows: {specific UI content with exact cards, rows, charts, buttons, and example values}
- Breakout elements: {1-2 UI fragments or thematic objects with drop shadows and slight rotation}
- Background depth: {theme-specific depth layers}
```

### Text-led panel

```text
Panel {n} ({arcPosition}):
- EXACT HEADLINE: "{headline}"
- EXACT SUBTITLE: "{subtitle}"
- Role: {why the panel exists}
- Layout: headline-dominant, no device
- Hero visual: {optional object, mascot, cutout, or stat}
- Background depth: {theme-specific layers}
```

## Conversion Defaults

- panel 1 interrupts the category's default expectation
- panel 2 proves the app with concrete UI
- panel 3 closes with confidence, trust, or outcome
- one promise per panel
- if the category is crowded, make the hero panel more specific, not louder
- headlines should create recognition, tension, or a clear outcome
- subtitles should support the headline by reframing, calming doubt, or granting permission

## Device Content

Good:

- `A ranking screen with three profile photo cards, a mint 9.7 badge, score rows for Lighting, Expression, and Composition, and a black pill button that says ANALYZE`

Bad:

- `Shows the app`

If real screenshots exist, idealize them rather than inventing unrelated screens.

## Revision Pattern

Append this to the original prompt for revisions:

```text
REVISION INSTRUCTIONS

Change:
- {exact requested change}

Preserve:
- positioning, panel order, crop safety
- the existing theme, palette, and typography unless explicitly changed
- unchanged device screens, copy, and background elements

Constraints:
- keep everything else the same
```
