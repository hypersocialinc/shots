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

## Text Rendering Guidelines (GPT Image 2)

GPT Image 2 achieves >95% text accuracy when following these rules:

### Quotation Marks for Exact Copy

Place exact copy in double quotes:
- ✅ "Meditate for 5 minutes daily"
- ✅ "Track Your Habits"
- ❌ Write text about meditation and tracking

### Font Specification

Always specify:
- Font style (sans-serif, modern, geometric, rounded)
- Weight (bold, semibold, regular, light)
- Color (hex or descriptive with brand context)
- Size relationship (large headline, small subtext)

Example: "Bold sans-serif headline in #FF5722, large and high-contrast"

### Verbatim Rendering for Critical Text

For brand names or specific phrases, request verbatim:
"The app name 'HabitFlow' should appear verbatim in the top-left corner"

### Spell Out Tricky Names

For unusual spellings or made-up words:
"App name: M-I-N-D-S-P-A-C-E (all caps, spaced)"

## Visual Hierarchy Rules

### Size Contrast

- Headline: 2-3× larger than body text
- Primary CTA or benefit: Visually dominant in top 2/3 of frame
- Supporting details: Secondary visual weight

### Color Emphasis

- Accent color reserved for 1-2 key elements per panel
- High contrast between text and background (WCAG AA minimum)
- Brand primary color used strategically, not everywhere

### Positioning Strategy

- Critical info in top 2/3 (thumb-scrollable zone on product page)
- Visual entry point in top-left or center
- Device mockup should not obscure headline

### White Space

- Breathing room around focal points (minimum 40px padding)
- Avoid cramming - each panel has ONE primary message
- Empty space guides the eye to important elements

### Dynamic Visual Language

- Use color, character, and warmth (avoid sterile AI aesthetics)
- Include human elements: hands holding device, lifestyle context
- Personality > polish when in doubt

## Panoramic Background (Optional)

For cohesive multi-panel narratives, use a single wide background:

"Design a 10,000px wide gradient background transitioning from [color1] on the left to [color2] on the right, with [geometric element] that spans across the entire width. The three 1284×2778 panels should be evenly spaced crops of this background, creating visual continuity and a cut-off effect that encourages scrolling."

Benefits:
- Creates visual tension that compels next-screenshot viewing
- Reinforces narrative flow across panels
- Professional, high-production feel

Use when: Brand has strong visual identity, story needs strong continuity
Avoid when: Each panel needs fully independent context

## Prompt Structure (5-Element Framework)

### 1. Style/Medium

"A vibrant, modern app store marketing screenshot in a [design style]"

### 2. Subject Description

"Featuring an iPhone 15 Pro displaying [specific UI screen] with the headline '[exact text]' in [font details]"

### 3. Composition/Framing

"The device is positioned in the [left/center/right] third, angled slightly, with [background element] filling the negative space"

### 4. Lighting & Color

"Soft gradient background from [color] to [color], with accent lighting in [brand color] creating depth"

### 5. Negative Constraints

"No badges, no app store buttons, no fake UI chrome, no generic stock photo people, no Lorem Ipsum text"

### Example Full Prompt

"A vibrant, modern app store marketing screenshot featuring an iPhone 15 Pro displaying the Meditation Timer screen with the headline 'Find Your Calm in 5 Minutes' in bold Helvetica Neue, white text with slight shadow for contrast. The device is positioned in the left third, angled 15° clockwise, with a serene gradient background from soft lavender (#E6E6FA) to pale blue (#B0C4DE). Floating abstract lotus petal shapes in the background create depth without distraction. The app screen shows a circular timer interface with purple accent color (#7B68EE), surrounded by subtle glow. Clean, professional, and inviting aesthetic. No badges, no borders, no fake app store elements."

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
- Use quotation marks for exact copy to ensure >95% text accuracy

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
