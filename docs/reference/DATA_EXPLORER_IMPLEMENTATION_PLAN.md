# Data Explorer Plan (Discover -> Understand -> Use)

## Problem
Clients struggle to answer three questions quickly:
1. What data exists for my use case?
2. Is this variable available for my market/timeframe and in the tool I want?
3. How do I use it immediately in audience building, charting, and exploration workflows?

## Product Goal
Reduce time from data idea to first product action to under 3 minutes.

## User Outcomes
- Discover relevant variables from natural-language search and guided filters.
- Understand each variable without leaving context (definition, coverage, caveats, quality signals).
- Use variables directly in downstream workflows with compatibility-aware actions.

## Experience Model

### 1) Discover
- Natural-language search input with intent chips (example use cases).
- Facets: category, variable type, market, wave, study, and target tool.
- Ranked results combining exact matches + semantic hint terms.

### 2) Understand
- Variable detail panel with:
- Definition and category/type metadata.
- Coverage snapshot (markets, waves, sample footprint, latest wave).
- Tool compatibility matrix.
- Distribution preview for answer options.
- Related variables in the same exploration neighborhood.

### 3) Use
- Primary actions:
- Use in Audience.
- Add to Chart.
- Add to Crosstab.
- Ask Spark.
- Save to Collection.
- Compatibility warnings shown before action when a selected facet conflicts.

## MVP Scope Implemented In This Repo
- New `Data Explorer` route and sidebar entry.
- Discover controls:
- natural-language search
- intent chips
- category/type/market/wave/study/tool facets
- Results with ranking and availability badges.
- Detail panel:
- coverage cards
- compatibility matrix
- distribution preview
- related variables
- compatibility warnings
- Use actions that route users into downstream flows.
- Saved collections persisted in `localStorage`.

## Information Architecture
- Entry point: `/app/data-explorer`
- Main regions:
- Discover controls (top)
- Results list (left)
- Detail and Use panel (right)

## Data Sources (Current)
- `taxonomy.questions`
- `taxonomy.categories`
- `taxonomy.waves`
- `taxonomy.locations`
- `taxonomy.studies`

## Ranking & Compatibility Strategy (MVP)
- Ranking score is based on weighted hits in name/description/category/datapoints plus synonym expansions for common business intents.
- Tool support is inferred from question type (for example, open-ended variables are restricted for certain workflows).
- Coverage is inferred from linked waves and wave location IDs.

## Success Metrics
- Median time from search to first action (`use_*`) in explorer.
- Search-to-action conversion rate.
- Zero-result search rate.
- Percentage of explorer sessions that launch Audience/Chart/Crosstab/Spark.
- Repeat usage of saved collections.

## Rollout Plan
1. MVP (this implementation): discover + understand + use with inferred compatibility.
2. Metadata hardening: explicit backend compatibility and caveat fields.
3. Recommendations: personalized related variables and team-level collections.
4. Deeper integrations: one-click prepopulation of downstream builders where supported.

## Risks / Follow-Ups
- Compatibility currently uses inferred logic; should migrate to explicit API metadata.
- Downstream prepopulation is partial by product surface and should be standardized.
- Query relevance can be improved with analytics-driven tuning once usage data arrives.
