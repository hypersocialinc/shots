# Shots — Project Instructions

## Architecture

Single skill (`shots`) handles all flows: create, revise, translate, and scrape. Source of truth is `skills/shots/`:

- `SKILL.md` — Frontmatter, intent router, setup, research contract, config contract
- `reference/` — Shared docs and per-flow instructions (`create.md`, `strategy.md`, `prompting.md`, `revise.md`, `translate.md`, `scrape.md`)
- `scripts/` — Bundled Node.js scripts for image generation, cropping, and scraping

Sub-flows are triggered conversationally within a single `/shots` session via the intent router in SKILL.md.

## Harness directories

`.claude/skills/shots/`, `.cursor/skills/shots/`, `.agents/skills/shots/` are symlinks to `skills/shots/`. Do not break the symlinks.

## Scripts

All scripts are ES modules in `skills/shots/scripts/`. Run `npm install --prefix skills/shots/scripts` before first use.

- `scaffold.mjs` — Scaffolds workspace (`--init`) and run directories. `--init` creates the default `config.json` and `manifest.json`. Run mode generates timestamp IDs and writes metadata/prompt. Outputs JSON to stdout.
- `generate.mjs` — Image generation via OpenAI Image API or fal.ai. Supports longer timeouts and optional partial-image streaming for OpenAI direct. Outputs composite path to stdout.
- `crop.mjs` — Crops composite into individual panels. Outputs panel paths to stdout.
- `scrape.mjs` — Scrapes App Store via iTunes API. Outputs config JSON to stdout.

## Workspace

`.shots/` is the user's workspace directory. It contains config, manifest, reference images, and generated runs. The `runs/` subdirectory is gitignored.

`config.json` now stores both `strategyBrief` and `benefits`, and is initialized by `scaffold.mjs`. Prompt assembly should read from those saved artifacts rather than inferring everything from scratch on each generation.

## Environment

Requires `OPENAI_API_KEY` or `FAL_KEY` for generation. Scripts auto-detect the provider.
Optional: `SEARCHAPI_KEY` enables device-grouped screenshot scraping via SearchAPI.
