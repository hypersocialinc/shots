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

1. **Initialize** — set up a `.shots/` workspace in your project
2. **Research** — scrape your App Store listing, analyze your repo, inspect screenshots/inspo, and map the competitor space
3. **Strategize** — save a `strategyBrief` with positioning, audience, market words, visual theme, and palette
4. **Craft** — write benefit-driven headlines from that brief
5. **Generate** — create wide composites via the OpenAI Image API or fal.ai, with optional partial-image streaming for OpenAI direct
6. **Crop** — split the composite into individual App Store / Google Play panels
7. **Iterate** — revise with surgical changes or translate for other locales

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
