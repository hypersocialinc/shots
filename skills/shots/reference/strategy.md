# Shots — Strategy Brief And Benefits

Do this research pass once per app, then reuse it until the positioning changes.

## Output

Write two things to `.shots/config.json`:

1. `strategyBrief`
2. `benefits`

## Source Priority

1. user overrides already in config
2. App Store listing and screenshots
3. local repo
4. `.shots/app-screenshots/`
5. `.shots/inspo/`
6. competitor listings and review language

If an App Store URL exists, competitor research is part of the default flow.

## Research Pass

### Product

Read, in order:

1. README and docs
2. onboarding, tutorial, paywall, and landing copy
3. navigation and root screens
4. models, schemas, APIs
5. existing screenshots

Capture:

- what the app does
- who it is for
- which moments, pains, and outcomes matter most

### Visual System

Infer theme from:

1. explicit brand colors and overrides
2. design tokens, assets, app icon
3. screenshots
4. inspo

Pick one style family:

| Family | Best fit |
|--------|----------|
| `clean-premium` | finance, productivity, premium utility |
| `playful-collage` | social, creator, youth |
| `glossy-y2k` | Gen Z, entertainment, bold social |
| `editorial-luxury` | fashion, lifestyle, luxury |
| `utility-bold` | crowded categories that need punch |
| `calm-warm` | wellness, journaling, family |
| `sport-kinetic` | fitness, live events, action |

Save:

- `visualTheme.styleFamily`
- `visualTheme.mood`
- `visualTheme.palette`
- `visualTheme.motifs`

### Competitors

Identify 3-5 direct competitors. For each, save:

- `name`
- `whyTheyCompete`
- `visualPattern`
- `copyPattern`
- `gapToExploit`

### Language Bank

Pull repeated phrases from:

- listing subtitle and description
- reviews and complaints
- competitor screenshot headlines
- repo copy

Save only the distilled result:

- `voice.tone`
- `voice.marketWords`
- `voice.reviewPhrases`
- `voice.tabooWords`

## Strategy Brief Schema

```json
{
  "strategyBrief": {
    "researchSources": {
      "appStoreUrl": true,
      "repo": true,
      "appScreenshots": true,
      "inspo": true
    },
    "appSummary": "",
    "category": "",
    "targetAudience": "",
    "marketMaturity": "established",
    "competitors": [],
    "positioning": {
      "corePromise": "",
      "differentiator": "",
      "proofPoints": []
    },
    "voice": {
      "tone": "",
      "marketWords": [],
      "reviewPhrases": [],
      "tabooWords": []
    },
    "visualTheme": {
      "styleFamily": "",
      "mood": "",
      "palette": {
        "primary": "",
        "secondary": "",
        "accent": "",
        "text": ""
      },
      "motifs": []
    },
    "panelArc": ["hero", "core", "closer"]
  }
}
```

## Benefits

Draft 6-8 benefits from the brief, not from a feature list.

The goal is installs. Design for the browse page first: if a panel does not make someone stop in a split-second scroll, it is not doing enough.

Use existing app screenshots as reference for what the product looks like, not as a template for the copy. Improve the framing instead of mirroring it.

Allowed `approach` values:

- `moment`
- `outcome`
- `pain`

Each benefit needs:

```json
{
  "headline": "",
  "subtitle": "",
  "approach": "moment",
  "panelType": "ProductTour",
  "feature": "",
  "arcPosition": "core",
  "showDevice": true,
  "textPosition": "top",
  "breakoutElements": ""
}
```

Rules:

- one promise per headline
- 3-5 words per line
- concrete verbs and outcomes
- category-native words when useful
- no empty AI adjectives
- avoid `and` in headlines when possible
- do not describe features directly when you can describe the user's new state instead
- headline should create recognition or tension; subtitle should reduce doubt, grant permission, or reframe

Use this compact copy lens for each panel:

- `perception` — interrupt the old assumption
- `context` — frame the app in a more favorable lens
- `permission` — make the next action feel safe, obvious, or overdue

Panel defaults:

| Type | Default device | Default text position |
|------|----------------|-----------------------|
| `BoldClaim` | `false` | `top` |
| `ProductTour` | `true` | `top` |
| `QuietProof` | `true` | `top` |
| `DataResult` | `true` | `bottom` |
| `IdentityRecognition` | `false` | `top` |
| `TypographicCloser` | `false` | `top` |
| `FullBleedVisual` | `true` | `bottom` |

At least 2 of every 3 selected panels should have a device unless the concept clearly calls for something else.

## Clarify Only If Needed

If a high-impact unknown remains, ask for:

1. the strongest differentiator
2. the main audience
3. what panel 1 must communicate

## Reuse

Reuse the saved `strategyBrief` on revisions and translations unless the user changes the direction.
