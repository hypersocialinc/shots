---
name: shots-scrape
description: >
  Scrape App Store metadata and screenshots into .shots/config.json.
  Does not generate images — just fetches ASO data, ratings, and assets.
user-invocable: true
argument-hint: "<app store url>"
allowed-tools:
  - Bash(node *)
  - Bash(npm *)
  - Bash(open *)
  - Bash(curl *)
---

# Shots — Scrape

Sub-command of the [shots](../shots/SKILL.md) skill.

Before executing, read and follow the **Setup (non-optional)** section from [../shots/SKILL.md](../shots/SKILL.md). For shared context (Panel Styles, Dimensions, Copywriting Principles, Prompt Construction), refer to that same file.

## Instructions

Follow the steps in [../shots/reference/scrape.md](../shots/reference/scrape.md).
