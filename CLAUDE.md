# Shots — Project Instructions

## Architecture

Primary skill (`shots`) for the create flow, plus 4 sub-command skills (`shots-*`) each with a thin `SKILL.md` wrapper. Source of truth is `skills/shots/`:

- `SKILL.md` — Frontmatter, shared knowledge (benefits, copywriting, panels, dimensions), create flow entry point
- `reference/` — One `.md` per sub-command with step-by-step agent instructions
- `scripts/` — Bundled Node.js scripts for image generation, cropping, and scraping

Sub-command skills in `skills/shots-*/`:

- `shots-revise` — Iterate on existing shots with feedback
- `shots-translate` — Localize shots for another language/locale
- `shots-scrape` — Scrape App Store metadata
- `shots-benefits` — Craft/refine benefit headlines

Each sub-skill's `SKILL.md` points back to the parent for shared knowledge and to `reference/` for instructions.

## Harness directories

`.claude/skills/shots/`, `.cursor/skills/shots/`, `.agents/skills/shots/` are symlinks to `skills/shots/`. Each `shots-*` sub-skill also has symlinks in all three harness directories. Do not break the symlinks.

## Scripts

All scripts are ES modules in `skills/shots/scripts/`. Run `npm install --prefix skills/shots/scripts` before first use.

- `generate.mjs` — Image generation via OpenAI or fal.ai. Outputs composite path to stdout.
- `crop.mjs` — Crops composite into individual panels. Outputs panel paths to stdout.
- `scrape.mjs` — Scrapes App Store via iTunes API. Outputs config JSON to stdout.

## Workspace

`.shots/` is the user's workspace directory. It contains config, manifest, reference images, and generated runs. The `runs/` subdirectory is gitignored.

## Environment

Requires `OPENAI_API_KEY` or `FAL_KEY` for generation. Scripts auto-detect the provider.
Optional: `SEARCHAPI_KEY` enables device-grouped screenshot scraping via SearchAPI.
