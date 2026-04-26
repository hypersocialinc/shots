---
name: shots
description: >
  Generate App Store and Google Play marketing screenshots from scratch.
  Full flow: initialize workspace, scrape App Store metadata, gather
  inspiration, craft benefit-driven headlines, and generate AI composites
  via GPT-Image 2 (OpenAI direct or fal.ai). Supports iPhone, iPad, and
  Android Phone platforms. Triggers: "app store screenshots",
  "marketing screenshots", "store listing images", "screenshot generation",
  "app store assets", "google play screenshots", "shots", ".shots".
  Do NOT use for general image generation, social media graphics, or
  non-store marketing assets.
user-invocable: true
argument-hint: "[app store url or description]"
allowed-tools:
  - Bash(node *)
  - Bash(npm *)
  - Bash(open *)
  - Bash(curl *)
---

# Shots

AI-powered App Store screenshot generator. Creates high-converting App Store screenshots designed to stop the scroll and drive installs.

## Flow

Follow the steps in [reference/create.md](reference/create.md).

- `/shots` — starts the create flow, prompts for app link
- `/shots <url>` — starts the create flow, uses that URL for scraping
- `/shots <description>` — starts the create flow with that as context

## Related commands

| Command | What it does |
|---------|-------------|
| `/shots-revise` | Iterate on existing shots with feedback |
| `/shots-translate` | Localize shots for another language/locale |
| `/shots-scrape` | Scrape App Store metadata into config.json |
| `/shots-benefits` | Craft/refine benefit headlines without generating |

## Setup (non-optional)

Run these checks before **every** sub-command. Do not skip any step.

1. **Dependencies**: Run `npm list --prefix {{scripts_path}} sharp 2>/dev/null`. If it exits non-zero, run `npm install --prefix {{scripts_path}}`.
2. **Workspace**: If `.shots/` doesn't exist, create it with subdirs (`app-screenshots/`, `inspo/`, `runs/`, `styles/`)
3. **API keys**: Verify `OPENAI_API_KEY` or `FAL_KEY` is set. If neither is found, **stop immediately** — tell the user to set one and do not continue. (Not required for `/shots-scrape` or `/shots-benefits`.) Optional: `SEARCHAPI_KEY` enables device-grouped screenshot scraping (iPhone, iPad, Watch, Mac, TV) via SearchAPI.
4. **Config**: Read `.shots/config.json` if it exists

The scripts path is: the `scripts/` directory relative to this SKILL.md file.

## Benefit Discovery

After the workspace is grounded, discover what the app does and draft benefit-driven headlines before generating screenshots.

### Phase 1: Codebase Analysis

Scan the project in priority order to understand what the app does:

1. **README / docs** — Top-level description, value proposition, feature list
2. **Onboarding flows** — Files matching `*onboard*`, `*welcome*`, `*tutorial*`
3. **Navigation / routing** — Tab bars, route definitions, navigation stacks
4. **Models / schemas** — What data the app manages (database models, API types)
5. **UI entry points** — `App.tsx`, `index.tsx`, main activity, root layout
6. **`.shots/config.json` ASO data** — Already-scraped description, genres, ratings, reviews

If no repo exists, replace codebase analysis with:

1. `.shots/config.json`
2. App Store listing metadata and screenshots
3. `.shots/app-screenshots/`
4. `.shots/inspo/`
5. Live web research about the product and positioning

### Phase 2: Draft Benefits

For each major feature discovered, draft a headline using one of three approaches:

| Approach | What it does | Example |
|----------|-------------|---------|
| **Paint a moment** | Captures a specific micro-moment | "Check your coffee without opening the app" |
| **State an outcome** | Describes the end state achieved | "A home for every coffee you buy" |
| **Kill a pain** | Names the frustration eliminated | "Never waste a great bag of coffee" |

Draft 6-8 benefits covering the app's key features. Each benefit needs:
- `headline` — Action-verb headline, 3-5 words per line
- `subtitle` — Supporting line that grants permission or reframes
- `approach` — Which of the three approaches above (`moment`, `outcome`, or `pain`)
- `panelType` — From the Panel Styles table below (BoldClaim, ProductTour, etc.)
- `feature` — Brief description of the backing feature/screen
- `arcPosition` — Where it sits in the narrative arc (`hero`, `differentiator`, `core`, `trust`, `closer`)
- `showDevice` — Boolean: whether to render an iPhone in this panel (see Panel Styles defaults)
- `textPosition` — `"top"` or `"bottom"`: where headline/subtitle sit relative to the device
- `breakoutElements` — (optional) Description of 3D elements that float out of the device or add visual depth (e.g. "heart emoji and chat bubble popping out of screen with drop shadows", "sticky note UI card pulled forward at an angle")

### Phase 3: Clarifying Questions

Before finalizing, ask the user only for the highest-value unknowns that you could not resolve confidently. Prioritize:
1. What is the **#1 thing** your app does better than alternatives?
2. What is the **most mentioned feature** in your reviews?
3. What should the **first screenshot** convey to someone scrolling the App Store?

### Phase 4: Save to Config

Write the finalized benefits array to `.shots/config.json`:

```json
{
  "benefits": [
    {
      "headline": "See exactly where $200 went",
      "subtitle": "Your spending, mapped by moment",
      "approach": "moment",
      "panelType": "ProductTour",
      "feature": "Spending breakdown dashboard",
      "arcPosition": "core",
      "showDevice": true,
      "textPosition": "top",
      "breakoutElements": "pie chart slice and dollar coin floating out of the screen with drop shadows"
    }
  ]
}
```

## Copywriting Principles

**The goal is installs.** Every screenshot must earn its place in a split-second scroll. If a panel doesn't make someone stop and tap "Get", it's not done. Design for the browse page — thumbnails first, full-size second.

The existing app screenshots are reference for what the app *looks like*, not a template for the copy. Never mirror them — always improve.

### Marketing is prediction installation

Your job isn't to describe features. It's to shift the user's self-concept so buying feels like recognition, not a gamble. Every panel should make someone stop scrolling because it reflects their identity back at them, not because it lists capabilities.

### Three-layer system for each panel's copy

1. **Perception** — Destabilize a cached prediction. Show an angle they didn't consider.
2. **Context** — Shift the frame. Make the screenshot feel like a late-night conversation, not a sales pitch.
3. **Permission** — Remove the imagined consequence. Reflect back the version of them who already decided.

### Headline writing recipe

For each panel, pick one of three approaches:

1. **Paint a moment** — Capture a specific micro-moment the user will recognize. ("Check your coffee without opening the app")
2. **State an outcome** — Describe the end state the feature achieves. ("A home for every coffee you buy")
3. **Kill a pain** — Name the frustration the feature eliminates. ("Never waste a great bag of coffee")

### Iron rules

- **One idea per headline** — if you need "and", it's two panels
- **3-5 words per line** — must be readable at thumbnail size
- **Intentional line breaks** — break where the eye naturally pauses
- **Headlines destabilize**, subtitles grant permission or reframe
- **Don't describe features** — describe the identity shift the feature enables
- Copy that converts doesn't inform — it *recognizes*

### Bad-to-better examples

| Bad | Better | Why |
|-----|--------|-----|
| "Track your finances" | "See exactly where $200 went" | Specific moment > generic verb |
| "AI-powered writing" | "Write the email in 30 seconds" | Outcome > technology |
| "Easy meal planning" | "Sunday dinner, planned by Friday" | Specific moment |
| "Manage your tasks" | "Done before your coffee gets cold" | Paints a moment |

## Panel Styles

Choose the right style for each panel. Not every panel needs a headline + subtitle.

| Style | When to use | Typical content | Default Device | Default Text Pos |
|-------|------------|-----------------|----------------|------------------|
| BoldClaim | Opening impact | Large headline, minimal supporting text | No | top |
| QuietProof | Subtle credibility | Stats, ratings, or quiet social proof | Optional | top |
| BeforeAfter | Transformation | Side-by-side comparison within the panel | Yes | top |
| ProductTour | Feature showcase | App UI screenshots as the hero visual | Yes | top |
| TestimonialProof | Social proof | Quote + attribution | No | top |
| DataResult | Metrics highlight | Key numbers or outcomes | Yes | bottom |
| ProcessSteps | How-it-works | 2-3 simple steps | Yes | top |
| ObjectionCollapse | Address doubt | Pre-empt the most common hesitation | No | top |
| IdentityRecognition | User identity | "You already know..." framing | No | top |
| TypographicCloser | Final CTA | Clean typographic closer, one strong idea | No | top |
| FullBleedVisual | Visual impact | Edge-to-edge imagery, minimal text | Yes | bottom |

## Device Frame & Visual Depth

Screenshots should look like real, high-end App Store creatives — not flat graphics. Use device mockups and 3D breakout elements to create depth and visual impact.

### Device Spec

- **Model**: iPhone X — thin bezels, rounded corners, centered notch, jet-black frame, portrait orientation
- **Size**: ~55-70% of panel height, centered horizontally
- **Visibility**: Fully visible by default. Partial crop (bottom edge cut off) is allowed for dynamic energy but must be intentional — never accidental clipping
- **Screen content**: Never blank or placeholder. Always show specific, detailed app UI on the device screen

### Screen Content Strategy

For what to show on the device screen, use this priority:
1. **Existing app screenshots** — idealized/improved versions of real screens from `.shots/app-screenshots/`
2. **Codebase-inferred UI** — reconstruct screens from navigation, models, and UI code in the repo
3. **Plausible UI from feature description** — design a realistic screen that matches the feature being highlighted

Be specific about UI elements visible on screen: "A spending dashboard showing a colorful pie chart, three category rows (Food $340, Transport $120, Shopping $89), and a monthly total of $549" — not "shows the app."

### Text Placement

- `textPosition: "top"` → headline/subtitle in the top ~30%, device in the bottom ~70%
- `textPosition: "bottom"` → device in the top ~70%, headline/subtitle in the bottom ~30%
- Text must never overlap the device frame

### 3D Breakout Elements

Breakout elements are what make App Store screenshots eye-popping. They add depth and draw the eye to the feature being highlighted.

**Floating UI fragments**: Pull key UI elements (cards, buttons, tags, notifications) out of the device screen so they appear to float in front with drop shadows and slight rotation. This draws the eye to the feature being highlighted.

**3D emoji/icons/stickers**: Render glossy, 3D-style emoji, icons, or mascot elements that burst out of the device frame. These add playfulness and break the flat plane.

**Background depth layers**: Use gradient orbs, swooshes, abstract shapes, or blurred circles behind the device to create a sense of layered depth. Not a flat color — a composition with foreground (breakout elements) → midground (device) → background (shapes/gradient).

**When to use breakouts**: ProductTour and feature-focused panels benefit most. BoldClaim and TypographicCloser panels should stay clean. 1-2 breakout elements per panel max — don't clutter.

**Prompt pattern for breakouts**: Include in the per-panel description, e.g. "Floating in front of the device with drop shadows: a 3D heart emoji and a chat bubble showing 'Hey! 👋' — these elements break out of the screen toward the viewer."

### Device Prompt Fragment

For panels with `showDevice: true`, use this template in the per-panel description:

```
[Panel N]: "{headline}" (subtitle: "{subtitle}") — {textPosition} text placement.
iPhone X device (jet-black, thin bezels, centered notch) at ~60% panel height, centered.
Screen shows: {detailed screen content description}.
{breakoutElements ? "Floating in front of the device with drop shadows: " + breakoutElements + "." : ""}
Background: {gradient/shape description for depth — not flat color}.
```

For text-only panels (`showDevice: false`):

```
[Panel N]: "{headline}" (subtitle: "{subtitle}") — headline-dominant layout.
{Optional: "3D app icon / mascot floating with drop shadow" for visual interest.}
Background: {gradient/shape description for depth}.
```

### Default Assignment Rule

At least 2 of every 3 panels must have a device. If the defaults from the Panel Styles table result in fewer than 2/3 device panels, override the middle panel to include a device. Variety matters — not every panel should be identical.

## Narrative Arc

Order your panels to tell a story. The arc determines which benefit goes where.

### Full arc (5+ panels)

| Position | Role | Panel Type | Device | Purpose |
|----------|------|------------|--------|---------|
| 1 | Hero | BoldClaim | No | Stop the scroll. One massive idea. **This panel alone should drive installs.** |
| 2 | Differentiator | IdentityRecognition | No | Why THIS app, not alternatives |
| 3+ | Core Feature | ProductTour | Yes | Show it working — device with breakout elements |
| 2nd-to-last | Trust Signal | QuietProof / DataResult | Yes | Social proof or outcomes |
| Last | Closer | TypographicCloser | No | One strong closing idea |

### 3-panel arc

| Position | Role | Panel Type | Device |
|----------|------|------------|--------|
| 1 | Hero | BoldClaim | No (or device with big headline — can include 3D app icon/mascot floating) |
| 2 | Core Feature | ProductTour | Yes (device with breakout elements showing key feature) |
| 3 | Closer | TypographicCloser / ProductTour | Optional (device with different feature, or text-only closer) |

**Variety guidance**: At least 2 of every 3 panels should have a device. Sometimes 1/3 is fine if one panel is a lifestyle/person shot or pure typographic statement. Mix text positions (top/bottom) across panels to avoid visual monotony.

## Prompt Construction

### Required Prompt Elements

Every generation prompt MUST specify:

1. **Dimensions**: "Create one 3456x2400 image"
2. **Panel structure**: "with three equal vertical panels"
3. **Content centering**: "center all content horizontally within each panel's column"
4. **Crop independence**: "each panel must crop cleanly into a standalone portrait App Store screenshot"
5. **Text safety**: "keep all text legible and at least 80px away from panel edges"

### Prompt Template

```
Create one {width}x{height} App Store marketing composite for "{appName}" with {panelCount} equal vertical panels and no visible seams.

Visual style: {visualTone}
Brand colors: primary {primary}, accent {accent}, text {textColor}

{Per-panel descriptions — use the device or text-only template from "Device Prompt Fragment" above}

Each panel must crop cleanly into a standalone portrait screenshot at {targetWidth}x{targetHeight}.
Keep text legible, at least 80px from panel edges.
Do not include app icons, download buttons, or platform badges.

CRITICAL LAYOUT RULES:
- Do NOT draw any dividing lines, borders, separators, or visible boundaries between panels
- The background must flow continuously across all panels with no visible seams
- Headlines are bold, heavy-weight, large sans-serif white text
- Subtitles are noticeably smaller, lighter weight, muted color
- Center all content horizontally within each panel's column
- No logos, no app icons, no download buttons

DEVICE RENDERING RULES:
- iPhone X: thin bezels, rounded corners, centered notch, jet-black frame, portrait
- Device is fully visible by default (~55-70% of panel height), centered horizontally
- Screen must show specific, detailed app UI — never blank or placeholder
- Text (headline/subtitle) must not overlap the device frame
- Partial crop at the bottom edge is allowed for dynamic energy

3D & DEPTH RULES:
- Breakout elements (floating UI cards, 3D emoji, icons) have drop shadows and slight scale/rotation
- Elements can overlap the device bezel to break the flat plane
- Backgrounds use gradient orbs, swooshes, or abstract shapes for layered depth — not flat solid colors
- Depth layers: foreground (breakout elements) → midground (device) → background (gradient shapes)
- Max 1-2 breakout elements per panel — don't clutter
```

**Per-panel format — Device panel:**
```
Panel N ({position}): "{headline}" (subtitle: "{subtitle}") — {textPosition} text placement.
iPhone X device (jet-black, thin bezels, centered notch) at ~60% panel height, centered.
Screen shows: {detailed screen content description}.
Floating in front of the device with drop shadows: {breakoutElements}.
Background: {gradient/shape description for depth}.
```

**Per-panel format — Text-only panel:**
```
Panel N ({position}): "{headline}" (subtitle: "{subtitle}") — headline-dominant layout, no device.
{Optional 3D element: e.g. "3D app icon floating with drop shadow" or "glossy 3D emoji for visual interest."}
Background: {gradient/shape description for depth}.
```

### Brand Integration

When `config.json` has brand colors defined:
- Use `primary` for backgrounds or large color blocks
- Use `accent` for highlights, buttons, or emphasis
- Use `text` for body copy
- Maintain sufficient contrast ratios (4.5:1 for body text, 3:1 for large text)

### Anti-patterns

Avoid these common prompt mistakes:
- **Too vague**: "Make nice screenshots" — always specify visual tone and content
- **Too crowded**: Putting too much text on panels — each panel should convey one idea
- **Off-center content**: Not centering content within each panel column
- **Generic stock imagery**: Screenshots should feel specific to the app
- **Fake UI elements**: Don't add fake status bars, app store badges, or download buttons
- **Blank/placeholder screens**: Device screens must show specific, detailed UI — never empty or generic
- **Text overlapping device**: Headlines and subtitles must not overlap the device frame
- **Vague screen descriptions**: "Shows the app" is useless — describe exact UI elements, data, and layout
- **Too many breakout elements**: Max 1-2 floating objects per panel — 3+ looks cluttered
- **Flat lifeless backgrounds**: Solid color with no depth — use gradient orbs, shapes, or swooshes
- **Device on every panel**: Variety matters — mix device and text-only panels
- **Unrelated breakout elements**: Floating objects must relate to the panel's feature, not random decoration

## Shot Selection

Sub-commands that operate on existing shots (`/shots-revise`, `/shots-translate`) share a common selection pattern.

### Loading the manifest

Read `.shots/manifest.json`. If it doesn't exist or has no shots, tell the user to run `/shots` first and stop.

### Listing recent shots

Show the user a numbered list of recent shots:

```
Recent shots:
  1. shot-a1b2c3 — 3 panels, openai, 2025-01-15 (hero: "See exactly where $200 went")
  2. shot-x7k9m2 — 3 panels, fal, 2025-01-14 (hero: "Sunday dinner, planned by Friday")
```

Each line includes:
- **ID** — the shot ID
- **Panel count** — number of panels
- **Provider** — `openai` or `fal`
- **Date** — `createdAt` formatted as YYYY-MM-DD
- **Hero headline** — the first benefit headline (from the shot's prompt or config)

### Argument handling

All sub-commands accept an optional shot ID as the first argument:
- `/shots-revise shot-a1b2c3` — skip listing, use that ID directly
- `/shots-translate shot-a1b2c3 ja` — skip listing, use that ID and locale

If the argument doesn't match a known shot ID, treat it as a different kind of input (e.g., locale for translate, description for ipad create-new).

### Asking the user to pick

After listing, ask the user to pick a shot by number or ID. Validate the selection before proceeding.

## Dimensions

| | iPhone (6.5") | iPad (12.9") | Android Phone (16:9) |
|---|---|---|---|
| COMPOSITE_WIDTH | 3456 | 6144 | 3240 |
| COMPOSITE_HEIGHT | 2400 | 2732 | 1920 |
| TARGET_WIDTH | 1284 | 2048 | 1080 |
| TARGET_HEIGHT | 2778 | 2732 | 1920 |
| PANEL_COUNT | 3 | 3 | 3 |
| Device key | `iphone` | `ipad` | `android` |
| Dir suffix | *(none)* | `-ipad` | `-android` |

## Configuration

`.shots/config.json` contains all app metadata:

```json
{
  "appName": "My App",
  "appStoreUrl": "",
  "positioning": "",
  "targetAudience": "",
  "visualTone": "clean, modern, premium",
  "brandColors": {
    "primary": "#1a1a2e",
    "secondary": "#16213e",
    "accent": "#0f969c",
    "text": "#f5f5f5"
  },
  "aso": {
    "title": "", "subtitle": "", "description": "",
    "keywords": "", "genres": [], "developer": "",
    "version": "", "releaseNotes": ""
  },
  "ratings": { "score": 0, "reviewCount": 0 },
  "scrapedAssets": { "iconUrl": "", "screenshotUrls": [], "screenshotSource": "itunes", "screenshotsByDevice": {}, "scrapedAt": "" },
  "activeStyle": "",
  "benefits": []
}
```

## File Structure

```
.shots/
  config.json              # App metadata, benefits, brand, ASO
  manifest.json            # All shots history
  .gitignore               # Ignores runs/
  app-screenshots/         # Current App Store screenshots
  inspo/                   # User design inspiration
  runs/
    shot-{id}/             # iPhone (no suffix)
    shot-{id}-ipad/        # iPad
    shot-{id}-android/     # Android Phone
      composite.png        # Full wide image
      screenshot/
        panel-1.png        # {targetWidth}x{targetHeight} final
        panel-2.png
        panel-3.png
      prompt.md            # Prompt used
      metadata.json        # Shot metadata
  styles/                  # Installed style templates
```

### Shot ID Format

- Prefix: `shot-`
- Suffix: 6 lowercase alphanumeric characters
- Example: `shot-a1b2c3`, `shot-x7k9m2`

IDs are unique within a manifest.

### Manifest Schema

```json
{
  "version": 2,
  "shots": [
    {
      "id": "shot-a1b2c3",
      "compositeFile": "runs/shot-a1b2c3/composite.png",
      "screenshotFiles": ["runs/shot-a1b2c3/screenshot/panel-1.png"],
      "prompt": "...",
      "model": "gpt-image-2",
      "provider": "openai",
      "quality": "high",
      "referenceImages": [],
      "parentId": null,
      "device": "iphone",
      "panelCount": 3,
      "dimensions": {
        "compositeWidth": 3456,
        "compositeHeight": 2400,
        "targetWidth": 1284,
        "targetHeight": 2778
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Requirements

- Node.js 18+
- One of the following environment variables:
  - `OPENAI_API_KEY` — OpenAI direct (exact pixel dimensions)
  - `FAL_KEY` — fal.ai proxy (exact pixel dimensions, often cheaper)
- Optional: `SEARCHAPI_KEY` — enables device-grouped screenshot scraping via SearchAPI's apple_product engine (falls back to iTunes without it)
