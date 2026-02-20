# Plan: Add Analysis Filters to Agents

## Problem
Charts, dashboards, and crosstabs all have filtering controls (timeframe, rebasing, granularity level, wave selection) that let users configure how their analysis runs. The agents product has none of these — users can only enter a brief and pick a flow. There's no way to control the time frame (weekly/monthly/quarterly), the analysis granularity (dataset/question/datapoint level), or rebasing of the data within the agentic flows.

## How It Works in Crosstabs (Reference Implementation)

The crosstab product has the most complete filtering system:

- **Types**: `CrosstabConfig` in `src/api/types/crosstab.ts` defines `timeframe`, `RebasingConfig`, `wave_ids`, `stat_test`, `wave_comparison`, `suppression`, etc.
- **Hook**: `useCrosstabConfig` in `src/hooks/useCrosstabConfig.ts` manages config state with setters like `setTimeframe()`, `setRebasingBase()`.
- **UI**: `CrosstabConfigPanel` in `src/components/crosstab/CrosstabConfigPanel.tsx` renders the filters using the shared `Dropdown` component from `src/components/shared/Dropdown.tsx` and `ConfigPill` component.
- **Flow**: Page (`CrosstabDetail`) holds state → passes to config panel → panel fires callbacks → page updates hook → hook updates config → config is sent with queries.

## Plan

### Step 1: Add `AgentAnalysisConfig` type (`src/api/types/agentic.ts`)

Add a new interface that mirrors the relevant parts of crosstab config:

```ts
export type AgentTimeframe = 'quarterly' | 'monthly' | 'weekly'

export type AgentGranularity = 'dataset' | 'question' | 'datapoint'

export type AgentRebaseMode = 'column' | 'row' | 'total' | 'respondent_base'

export interface AgentAnalysisConfig {
  timeframe?: AgentTimeframe
  granularity?: AgentGranularity
  rebase_mode?: AgentRebaseMode
  wave_ids?: string[]
  compare_waves?: boolean
}
```

Update `AgenticRun` to include the optional `analysis_config` field so it's stored with runs.

### Step 2: Create `AgentAnalysisFilters` component (`src/components/agentic/AgentAnalysisFilters.tsx`)

New component that renders filter dropdowns using the existing shared `Dropdown` component (same one used in `CrosstabConfigPanel`). Includes:

- **Timeframe** dropdown: Quarterly / Monthly / Weekly (with "None" default)
- **Granularity** dropdown: Dataset level / Question level / Datapoint level
- **Rebase** dropdown: Column % / Row % / Total % / Respondent base
- **Wave comparison** toggle: Compare across waves checkbox
- **Wave selector**: Pills for selected waves with add/remove (mirrors the crosstab wave pills pattern from `ConfigPill`)

Styling will follow the existing `agentic-section` card pattern from `AgentSpark.css`.

### Step 3: Create `useAgentAnalysisConfig` hook (`src/hooks/useAgentAnalysisConfig.ts`)

A hook that manages the `AgentAnalysisConfig` state with individual setters, following the same pattern as `useCrosstabConfig`:

```ts
export function useAgentAnalysisConfig() {
  const [config, setConfig] = useState<AgentAnalysisConfig>({})

  const setTimeframe = useCallback(...)
  const setGranularity = useCallback(...)
  const setRebaseMode = useCallback(...)
  const setWaveIds = useCallback(...)
  const setCompareWaves = useCallback(...)
  const resetConfig = useCallback(...)

  return { config, setTimeframe, setGranularity, setRebaseMode, setWaveIds, setCompareWaves, resetConfig }
}
```

### Step 4: Add CSS for the filters (`src/components/agentic/AgentAnalysisFilters.css`)

Compact filter styles consistent with the agentic panel design. Uses existing CSS variables and follows the `config-panel__control` pattern from crosstab.

### Step 5: Integrate into `AgentSpark` page (`src/pages/app/AgentSpark.tsx`)

- Import and use `useAgentAnalysisConfig` hook
- Add the `AgentAnalysisFilters` component as a new section in the right-side agentic panel, positioned between the "Agentic Flow Runner" and "Selected Flow Blueprint" sections
- Pass `analysisConfig` into the `runAgenticFlow` mutation call
- Pass `analysisConfig` into the `SparkChat` context so the chat agent knows the user's selected filters
- Reset filters when starting a new chat

### Step 6: Update API layer to carry analysis config

- **`runFlow` API** (`src/api/endpoints/agentic.ts`): Add optional `analysis_config` parameter to `runFlow`
- **`useRunAgenticFlow` hook** (`src/hooks/useAgentic.ts`): Accept `analysisConfig` in mutation params
- **Mock API** (`src/api/mock/endpoints/agentic.ts`): Store `analysis_config` on the run and reflect it in output summaries
- **Orchestrator** (`src/agentic/orchestrator.ts`): Accept `analysisConfig` parameter and include in run output

### Step 7: Add analysis config to SparkContext

- Update `SparkContext` type (`src/api/types/spark.ts`) to include optional `analysis_config` field
- The chat can then reference the user's chosen timeframe/granularity/rebase when generating responses

## Files Modified

| File | Change |
|---|---|
| `src/api/types/agentic.ts` | Add `AgentAnalysisConfig` type, update `AgenticRun` |
| `src/components/agentic/AgentAnalysisFilters.tsx` | **New** — filter component |
| `src/components/agentic/AgentAnalysisFilters.css` | **New** — filter styles |
| `src/hooks/useAgentAnalysisConfig.ts` | **New** — config state hook |
| `src/pages/app/AgentSpark.tsx` | Integrate filters into agentic panel |
| `src/hooks/useAgentic.ts` | Update mutation to accept analysis_config |
| `src/api/endpoints/agentic.ts` | Add analysis_config to runFlow |
| `src/api/mock/endpoints/agentic.ts` | Store and reflect analysis_config |
| `src/agentic/orchestrator.ts` | Accept analysis_config parameter |
| `src/api/types/spark.ts` | Add analysis_config to SparkContext |
