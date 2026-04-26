# /shots benefits — Benefit Headline Crafting

Craft and refine benefit-driven headlines without generating images. Pure copywriting.

## Steps

### 1. Load config

Read `.shots/config.json`. If it doesn't exist, tell the user to run `/shots` or `/shots-scrape` first.

### 2. Gather context

Understand the app using all available sources:

1. **config.json** — App name, positioning, audience, ASO data
2. **Codebase** (if in a repo) — README, features, navigation, models
3. **App screenshots** — `.shots/app-screenshots/` for visual understanding
4. **Inspo** — `.shots/inspo/` for design direction
5. **Web research** — App Store listing, competitor analysis, reviews

### 3. Phase 1: Feature discovery

Identify 6-8 features worth highlighting. For each, note:
- What the feature does
- What user problem it solves
- What emotional job it fulfills

### 4. Phase 2: Draft benefits

For each feature, draft a benefit headline using one of three approaches:

| Approach | Key | When to use |
|----------|-----|-------------|
| Paint a moment | `moment` | When the micro-moment is vivid and recognizable |
| State an outcome | `outcome` | When the end state is the selling point |
| Kill a pain | `pain` | When the frustration is universal and named |

Each benefit needs all fields:

```json
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
```

### 5. Assign narrative arc positions

Map each benefit to an arc position:

| Position | Role | Purpose |
|----------|------|---------|
| `hero` | Stop the scroll | One massive idea, first impression |
| `differentiator` | Why THIS app | What makes it different from alternatives |
| `core` | Show it working | Key feature in action |
| `trust` | Social proof | Ratings, testimonials, outcomes |
| `closer` | Final push | One strong closing idea |

### 6. Assign panel types, device settings, and breakout elements

Map each benefit to a panel type from the SKILL.md Panel Styles table. Match the content to the format:

- Bold claims get BoldClaim
- Feature showcases get ProductTour
- Social proof gets QuietProof or TestimonialProof
- Closing statements get TypographicCloser

**Device settings:**

- Set `showDevice` from the Panel Styles defaults column (e.g. ProductTour → `true`, BoldClaim → `false`)
- Set `textPosition` based on visual balance — `"top"` is default, use `"bottom"` when the device should lead visually
- **2-of-3 check**: verify at least 2 of every 3 benefits have `showDevice: true`. If not, override the middle benefit to include a device

**Breakout elements:**

- For each device panel, brainstorm `breakoutElements` — pick the most visually striking UI element from the feature and describe it floating forward with 3D depth
- Examples: "notification card and bell icon popping out with drop shadows", "3D star rating badge floating above the device", "calendar event card pulled forward at a slight angle with shadow"
- Keep it to 1-2 elements per panel. Skip breakout elements for BoldClaim and TypographicCloser panels

### 7. Ask clarifying questions

Present the drafted benefits and ask:
1. "Do these headlines capture what makes your app special?"
2. "Which headline feels strongest? Which feels weakest?"
3. "Is there a feature or angle I'm missing?"

### 8. Refine

Based on feedback, refine the headlines. Apply the iron rules from SKILL.md:
- One idea per headline
- 3-5 words per line
- Headlines destabilize, subtitles grant permission

### 9. Save to config

Write the finalized benefits array to `.shots/config.json`.

### 10. Suggest next steps

> Your benefits are saved to config.json. Ready to generate screenshots?
> - `/shots` to generate a full set
> - `/shots-benefits` again to refine further
