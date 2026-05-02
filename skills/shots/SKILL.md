---
name: shots
description: >
  Generate, revise, translate, and manage App Store / Google Play marketing
  screenshots. Full flow: initialize a .shots workspace, scrape App Store
  metadata, research the product from the repo and listing, identify theme,
  colors, audience, and competitor space, save a strategy brief, craft
  benefit-driven headlines, and generate 3-up GPT-Image 2 composites via
  OpenAI direct or fal.ai before cropping them into upload-ready panels.
  Supports iPhone, iPad, and Android Phone platforms. Triggers: "app store
  screenshots", "marketing screenshots", "store listing images",
  "screenshot generation", "app store assets", "google play screenshots",
  "shots", ".shots", "revise shots", "change screenshots", "fix panels",
  "redo screenshots", "translate screenshots", "localize", "scrape app
  store", "fetch metadata", "import app store".
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

Generate high-converting App Store screenshots. The job is not to decorate existing screens. The job is to infer the app's market, visual language, and strongest promise, then turn that into crop-safe screenshot panels built to drive installs.

## Why Screenshot Quality Matters

Research shows optimized app store screenshots can achieve:
- **68.2% conversion rate** vs 26.4% industry average
- **720% improvement** in install rate
- **7-second decision window** - first 2-3 screenshots are critical

This skill is designed to leverage GPT Image 2's strengths (95%+ text accuracy, UI mockup excellence, 4K output) combined with proven conversion patterns (Story Flow, hybrid captions, visual hierarchy) to create high-converting marketing assets.

## Intent Router

| Intent | Detection | Action |
|--------|-----------|--------|
| Create new | No existing shot referenced, or "new", "create", "generate", or an App Store URL | Run the Create Questionnaire, then follow [reference/create.md](reference/create.md) |
| Revise | References a shot ID, or says "revise", "change", "fix", "redo" | Follow [reference/revise.md](reference/revise.md) |
| Translate | Mentions a locale or says "translate", "localize" | Follow [reference/translate.md](reference/translate.md) |
| Scrape only | Says "scrape", "fetch metadata", "import" with a URL | Follow [reference/scrape.md](reference/scrape.md) |
| Ambiguous | You cannot tell which flow is intended | Ask the user what they want to do |

### Argument Parsing

- `/shots` — start the create questionnaire
- `/shots <url>` — scrape the listing, then continue with create
- `/shots <description>` — create using that context
- `/shots revise [shot-id]` — revision flow
- `/shots translate [shot-id|run-id] [locale]` — localization flow
- `/shots scrape <url>` — scrape only

## Shared Setup

Run these checks before every sub-command. Do not skip them.

1. Run `npm list --prefix {{scripts_path}} sharp 2>/dev/null`. If it fails, run `npm install --prefix {{scripts_path}}`.
2. Run `node {{scripts_path}}/scaffold.mjs --init --output-dir .shots/`.
3. For create, revise, and translate, verify `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `FAL_KEY` is set. Stop immediately if none exists.
4. Read `.shots/config.json` if present.

`{{scripts_path}}` is the `scripts/` directory next to this file.

`scaffold.mjs --init` is the source of truth for the workspace contract. It creates the default `config.json` and `manifest.json`; agents should fill those files in rather than inventing their own schema.

## Create Questionnaire

When the create flow starts and the config is missing or incomplete, ask for all of these in one message:

1. App name
2. **App Store URL** — ask explicitly: "Do you have an existing App Store or Google Play listing? If so, paste the URL." This is the highest-value input: it unlocks automated metadata scraping, competitor research, and existing screenshot analysis.
3. Number of screenshots to generate
4. Devices: iPhone, iPad, Android Phone
5. Languages/locales

Optional (only ask if the user wants to override what you'll infer):

6. Visual style override
7. Brand colors
8. Differentiator override

Defaults:

- `panelCount`: `3`
- `devices`: `["iphone"]`
- `locales`: `["en"]`
- Screenshot counts above 3 are produced as multiple 3-panel composites.

## Research Contract

Before drafting copy or generating images, build and save a `strategyBrief` in `.shots/config.json`. This is the source of truth for benefits and prompt assembly.

Use sources in this order:

1. User-provided brand/colors/style overrides
2. App Store URL and scraped listing data
3. The local repo: README, onboarding, navigation, models, root screens, existing copy
4. `.shots/app-screenshots/`
5. `.shots/inspo/`
6. Competitor listings and review language
7. Ask the user only for the highest-value unknown that cannot be inferred

If an App Store URL exists, do full-stack research by default: listing, screenshots, direct competitors, and review language. If no URL exists, infer from the repo first. If no repo signal exists, infer from screenshots/inspo. If the app is still unclear, ask the user.

Follow [reference/strategy.md](reference/strategy.md) to:

- identify theme, colors, and audience
- map the competitor space
- extract market-native words and repeated pain language
- save the strategy brief
- draft 6-8 benefits ranked for install intent

## Prompt Contract

Always build prompts from the saved `strategyBrief` and approved benefits. Follow [reference/prompting.md](reference/prompting.md).

Hard rules:

- Generate screenshots in batches of 3 panels per composite by default.
- Each composite must crop cleanly into standalone portrait screenshots.
- At least 2 of every 3 panels should show a device unless the concept clearly benefits from a text-only or lifestyle panel.
- Headline text must be short, high-contrast, thumbnail-readable, and verbatim.
- Device screens must show concrete UI, not generic placeholder app chrome.
- Use visual facts, not vague praise words.
- Decorative depth elements must reinforce the feature being sold.
- Do not include app store badges, download buttons, or fake platform chrome.

## Existing Shot Flows

For revise and translate:

- Read `.shots/manifest.json` and list recent shots if no shot ID was supplied.
- Reuse the saved `strategyBrief` unless the user explicitly changes positioning, audience, or visual direction.
- Treat the original prompt as the base artifact and append precise change/preserve instructions.

## Dimensions

| Device | Composite | Final panel | Key |
|--------|-----------|-------------|-----|
| iPhone | `3456x2400` | `1284x2778` | `iphone` |
| iPad | `6144x2732` | `2048x2732` | `ipad` |
| Android Phone | `3240x1920` | `1080x1920` | `android` |

## Config Shape

The initialized `config.json` contains:

- app metadata: `appName`, `appStoreUrl`, `devices`, `locales`, `panelCount`
- generation defaults: `generation.provider`, `generation.quality`, `generation.timeoutMs`, `generation.partialImages`
- brand colors: `brandColors`
- App Store data: `aso`, `ratings`, `scrapedAssets`
- strategy state: `strategyBrief`
- copy state: `benefits`

Do not hand-author a fresh schema in the agent instructions. Read the generated file and fill it in.

## References

- [reference/create.md](reference/create.md) — end-to-end create flow
- [reference/strategy.md](reference/strategy.md) — research, strategy brief, benefits
- [reference/prompting.md](reference/prompting.md) — GPT Image 2 composite prompt contract
- [reference/revise.md](reference/revise.md) — revision workflow
- [reference/translate.md](reference/translate.md) — localization workflow
- [reference/scrape.md](reference/scrape.md) — App Store scraping workflow
