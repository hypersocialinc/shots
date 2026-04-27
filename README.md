<p align="center">
  <img src="assets/hero.png" alt="Shots — AI-powered App Store screenshots" width="500" />
</p>

<h1 align="center">Shots</h1>

<p align="center">
  <strong>App Store screenshots that drive installs — powered by GPT-Image 2.</strong>
</p>

<p align="center">
  <video src="https://github.com/user-attachments/assets/bd1a9037-470d-4c75-b6e9-bfed07425057" width="600" />
  <br>
  <em>Demo — from App Store URL to finished screenshots</em>
</p>

<p align="center">
  Type <code>/shots</code> in Claude Code. Paste your App Store URL to scrape your listing,<br>
  let the skill research your app, market, theme, colors, and competitors,<br>
  add your own screenshots to <code>.shots/app-screenshots/</code>, drop inspo into <code>.shots/inspo/</code>,<br>
  and get scroll-stopping App Store screenshots in minutes — not days.
</p>

> **⚠️ API Key Required**
> You need either:
> - `OPENAI_API_KEY` with image generation enabled (GPT Image 2 access), OR
> - `FAL_KEY` for fal.ai generation
>
> Optional: `SEARCHAPI_KEY` from [SearchAPI.io](https://www.searchapi.io/) (free trial available) enables device-grouped screenshot scraping for better visual references.

## Install

Install the Shots skill to your AI coding agent:

```bash
# Install to your current project
npx skills add hypersocialinc/shots

# Install globally (available in all projects)
npx skills add hypersocialinc/shots --global

# Install to specific agents
npx skills add hypersocialinc/shots --agent claude-code cursor
```

Works with Claude Code, Cursor, Codex, Cline, and [40+ other AI coding agents](https://github.com/vercel-labs/skills#supported-agents).

## Examples

<table>
  <tr>
    <td><img src="assets/example-tiktok-1.png" width="250" /></td>
    <td><img src="assets/example-tiktok-2.png" width="250" /></td>
    <td><img src="assets/example-tiktok-3.png" width="250" /></td>
  </tr>
  <tr>
    <td colspan="3"><em>TikTok — bold claims, scroll-stopping color</em></td>
  </tr>
  <tr>
    <td><img src="assets/example-miniparty-1.png" width="250" /></td>
    <td><img src="assets/example-miniparty-2.png" width="250" /></td>
    <td><img src="assets/example-miniparty-3.png" width="250" /></td>
  </tr>
  <tr>
    <td colspan="3"><em>Miniparty — playful identity, clear value props</em></td>
  </tr>
  <tr>
    <td><img src="assets/example-snapchat-1.png" width="250" /></td>
    <td><img src="assets/example-snapchat-2.png" width="250" /></td>
    <td><img src="assets/example-snapchat-3.png" width="250" /></td>
  </tr>
  <tr>
    <td colspan="3"><em>Snapchat — high-energy visuals, benefit-first copy</em></td>
  </tr>
  <tr>
    <td><img src="assets/example-chatgpt-1.png" width="250" /></td>
    <td><img src="assets/example-chatgpt-2.png" width="250" /></td>
    <td><img src="assets/example-chatgpt-3.png" width="250" /></td>
  </tr>
  <tr>
    <td colspan="3"><em>ChatGPT — clean product tour, clear benefit headlines</em></td>
  </tr>
</table>

## Platform Support

| Platform | Status | Composite Size | Final Panel Size |
|----------|--------|----------------|------------------|
| iPhone | ✅ Fully tested | 3456×2400 | 1284×2778 |
| iPad | ⚠️ Not fully tested | 6144×2732 | 2048×2732 |
| Android Phone | ⚠️ Not fully tested | 3240×1920 | 1080×1920 |
| Translation | ⚠️ Experimental | - | - |
| Apple Watch | ❌ Not yet supported | - | - |
| App Store Videos | 🔜 Planned | - | - |

## Pricing

**Estimated cost per screenshot set (GPT Image 2, high quality):**
- ~**$0.50-0.54** per request (generates 3 screenshots)
- ~**$0.17-0.18** per individual screenshot

*Based on real generation data and [OpenAI GPT Image 2 pricing](https://platform.openai.com/docs/pricing):*

| | Rate | Cached rate |
|---|---|---|
| Image input | $8.00/1M tokens | $2.00/1M tokens |
| Text input | $5.00/1M tokens | $1.25/1M tokens |
| Image output | $30.00/1M tokens | - |

**Actual cost breakdown (iPhone 3456×2400):**

| | With references | Without references |
|---|---|---|
| Image input | 4,446 tokens → $0.036 | 0 tokens → $0.000 |
| Text input | 1,434 tokens → $0.007 | 977 tokens → $0.005 |
| Image output | 16,554 tokens → $0.497 | 16,554 tokens → $0.497 |
| **Total** | **$0.54** | **$0.50** |

Output tokens are the dominant cost (~95%) and are fixed per composite size. Input costs (prompt + reference images) are negligible. Repeated generations with the same references benefit from cached input pricing, bringing costs closer to the $0.50 floor.

## Commands

Everything runs through a single `/shots` command. Sub-flows are triggered conversationally:

| Input | What it does |
|-------|-------------|
| `/shots` | Full creation flow — questionnaire, workspace setup, generate screenshots |
| `/shots <url>` | Scrape the App Store URL, then start creation flow |
| `/shots revise` | Iterate on existing shots with targeted feedback |
| `/shots translate [shot-id] [locale]` | Localize an existing shot/run into another language/locale |
| `/shots scrape <url>` | Scrape App Store metadata only (no generation) |

You can also trigger sub-flows mid-conversation by saying "revise", "translate to Japanese", "scrape", etc. Benefit headlines are crafted from a saved strategy brief during the create flow.

## How It Works

Shots is a research-first screenshot generation system that produces conversion-optimized App Store and Google Play assets:

### 1. **Initialize Workspace**
Sets up a `.shots/` directory in your project with config schema, manifest tracking, and folders for reference images.

### 2. **Research Your App**
Automatically gathers context from multiple sources:
- **App Store scraping** — Pulls metadata, ratings, description, and existing screenshots from your listing (iTunes API + optional SearchAPI for device-grouped screenshots)
- **Repository analysis** — Reads your README, package.json, and source code to understand your product
- **Visual references** — Inspects screenshots you drop into `.shots/app-screenshots/` and inspiration images in `.shots/inspo/`
- **Competitor mapping** — Identifies 3-5 direct competitors and analyzes their positioning, visual themes, and review language

**SearchAPI Integration:** When `SEARCHAPI_KEY` is set, the scraper fetches device-grouped screenshots (iPhone, iPad, etc.) from the App Store, providing richer visual references than the iTunes API alone. Sign up at [searchapi.io](https://www.searchapi.io/) — free trial available.

### 3. **Build Strategy Brief**
Saves a reusable research artifact (`strategyBrief` in `config.json`) containing:
- App summary, target audience, market maturity
- Positioning (core promise, differentiator, proof points)
- Competitor analysis with visual/copy patterns
- Voice and language bank (tone, market words, taboo phrases)
- Visual theme (style family, mood, palette, motifs)
- Panel arc structure (Value → Flow → Trust narrative)

### 4. **Craft Benefit Headlines**
Generates 6-8 problem-first benefit statements ranked for install intent (transformations, not features). Headlines are saved to `config.json` and reused across revisions/translations.

### 5. **Generate Image Composites**
Creates wide panoramic composites via OpenAI's GPT Image 2 (direct API or fal.ai) using:
- Saved strategy brief and benefits (not regenerated each time)
- Reference images for visual consistency
- Platform-specific dimensions (iPhone: 3456×2400, iPad: 6144×2732, Android: 3240×1920)
- Verbatim quote-based prompting for >95% text accuracy

### 6. **Crop Into Panels**
Automatically splits composites into 3 upload-ready individual screenshots with crop-safe boundaries (no text cutoff or visible seams).

### 7. **Iterate or Translate**
- **Revise:** Make surgical changes to existing shots while preserving strategy and visual identity
- **Translate:** Localize screenshot copy into other languages/locales without rebuilding visuals

All generated assets are versioned in timestamped run directories under `.shots/runs/` (gitignored).

## Requirements

- Node.js 18+
- `OPENAI_API_KEY` or `FAL_KEY`
- `SEARCHAPI_KEY` (optional) — improves App Store screenshot scraping with device grouping

## Project Structure

```
skills/shots/
  SKILL.md                # Router, shared setup, config contract
  reference/
    create.md            # Create flow
    strategy.md          # Research + strategy brief + benefits
    prompting.md         # GPT Image 2 prompt contract
    revise.md            # Revision flow
    translate.md         # Localization flow
    scrape.md            # App Store scrape flow
  scripts/                # generate.mjs, crop.mjs, scrape.mjs
.shots/                   # Per-project workspace (created at runtime)
  config.json             # Scaffold-generated app/workflow schema
  runs/                   # Generated output (gitignored)
```
