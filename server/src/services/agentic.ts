import { v4 as uuid } from 'uuid'
import { getDb } from '../db/index.js'
import { AnalysisEngine, type AnalysisConfig, type AnalysisResult } from './analysisEngine.js'

// ── Types (match frontend API types) ────────────────────────────────

interface Capability {
  id: string; name: string; type: string; category: string; description: string
  inputs: string[]; outputs: string[]; dependencies?: string[]; confidence?: string | null
}

interface FlowStep {
  id: string; name: string; capability_id: string; description: string
  depends_on?: string[]; output_artifacts?: string[]
}

interface Flow {
  id: string; name: string; description: string; triggers: string[]; steps: FlowStep[]
}

interface Linkage {
  id: string; name: string; description: string; endpoints: string[]; auth: string
}

interface RunOutput {
  id: string; label: string
  type: 'insight' | 'chart' | 'crosstab' | 'dashboard' | 'report' | 'deck' | 'alert' | 'dataset'
  summary: string
  data?: AnalysisResult
  citations?: Array<{ text: string; source: string; wave_id?: string; sample_size?: number; confidence_level?: string }>
}

interface Run {
  id: string; flow_id: string; status: string; brief: string
  analysis_config?: AnalysisConfig | null; started_at: string; completed_at?: string | null
  outputs: RunOutput[]
}

// ── Helpers ─────────────────────────────────────────────────────────

function parseJson<T>(val: string | null, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

function outputTypeFromArtifact(artifact: string): RunOutput['type'] {
  if (artifact.includes('dashboard')) return 'dashboard'
  if (artifact.includes('deck')) return 'deck'
  if (artifact.includes('chart')) return 'chart'
  if (artifact.includes('crosstab') || artifact.includes('significance') || artifact.includes('lift')) return 'crosstab'
  if (artifact.includes('dataset') || artifact.includes('data')) return 'dataset'
  if (artifact.includes('alert')) return 'alert'
  if (artifact.includes('report') || artifact.includes('validation') || artifact.includes('citation')) return 'report'
  return 'insight'
}

function toTitleCase(value: string): string {
  return value.split(/[_-]/g).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

// ── Service ─────────────────────────────────────────────────────────

export class AgenticService {
  private engine = new AnalysisEngine()

  getInventory() {
    const db = getDb()
    const capabilities = (db.prepare('SELECT * FROM capabilities').all() as any[]).map(this.toCapability)
    const flows = (db.prepare('SELECT * FROM flows').all() as any[]).map(this.toFlow)
    const linkages = (db.prepare('SELECT * FROM linkages').all() as any[]).map(this.toLinkage)
    return { capabilities, flows, linkages }
  }

  listFlows(): Flow[] {
    const db = getDb()
    return (db.prepare('SELECT * FROM flows').all() as any[]).map(this.toFlow)
  }

  getFlow(flowId: string): Flow | undefined {
    const db = getDb()
    const row = db.prepare('SELECT * FROM flows WHERE id = ?').get(flowId) as any | undefined
    return row ? this.toFlow(row) : undefined
  }

  listRuns(): Run[] {
    const db = getDb()
    return (db.prepare('SELECT * FROM runs ORDER BY started_at DESC').all() as any[]).map(this.toRun)
  }

  getRun(runId: string): Run | undefined {
    const db = getDb()
    const row = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId) as any | undefined
    return row ? this.toRun(row) : undefined
  }

  runFlow(flowId: string, brief: string, analysisConfig?: AnalysisConfig): Run {
    const db = getDb()
    const flow = this.getFlow(flowId)
    const startedAt = new Date().toISOString()
    const runId = `run-${uuid().slice(0, 8)}`

    if (!flow) {
      const failedRun: Run = {
        id: runId, flow_id: flowId, status: 'failed', brief,
        analysis_config: analysisConfig ?? null,
        started_at: startedAt, completed_at: startedAt,
        outputs: [{
          id: `out-${uuid().slice(0, 8)}`, label: 'Flow Error', type: 'alert',
          summary: `Unable to run flow "${flowId}" because it was not found.`,
        }],
      }
      this.persistRun(failedRun)
      return failedRun
    }

    // Run the analysis engine if config is provided
    let analysisResults: AnalysisResult[] = []
    if (analysisConfig && Object.keys(analysisConfig).some(k => (analysisConfig as any)[k] != null)) {
      analysisResults = this.engine.run(analysisConfig)
    }

    // Build outputs from flow steps, enriched with analysis data
    const outputs = this.buildOutputs(flow, brief, analysisConfig, analysisResults)

    const completedAt = new Date(Date.now() + 90_000).toISOString()

    const run: Run = {
      id: runId, flow_id: flow.id, status: 'completed', brief,
      analysis_config: analysisConfig ?? null,
      started_at: startedAt, completed_at: completedAt, outputs,
    }

    this.persistRun(run)
    return run
  }

  listWaves() {
    const db = getDb()
    return db.prepare('SELECT * FROM waves ORDER BY start_date DESC').all()
  }

  // ── Output building ──────────────────────────────────────────────

  private buildOutputs(flow: Flow, brief: string, config?: AnalysisConfig, results: AnalysisResult[] = []): RunOutput[] {
    const outputs: RunOutput[] = []
    const resultsByType = new Map<string, AnalysisResult[]>()

    for (const r of results) {
      const existing = resultsByType.get(r.type) ?? []
      existing.push(r)
      resultsByType.set(r.type, existing)
    }

    const filterDesc = this.describeFilters(config)

    for (const step of flow.steps) {
      const artifacts = step.output_artifacts?.length ? step.output_artifacts : ['insight_summary']

      for (const artifact of artifacts) {
        const outputType = outputTypeFromArtifact(artifact)
        const outputId = `out-${uuid().slice(0, 8)}`

        // Match analysis results to output type
        let matchedResult: AnalysisResult | undefined
        if (outputType === 'crosstab') {
          matchedResult = resultsByType.get('crosstab')?.[0] ?? resultsByType.get('wave_comparison')?.[0]
        } else if (outputType === 'dataset') {
          matchedResult = resultsByType.get('dataset_summary')?.[0]
        } else if (outputType === 'chart' || outputType === 'dashboard') {
          matchedResult = resultsByType.get('time_series')?.[0] ?? resultsByType.get('question_breakdown')?.[0]
        } else if (outputType === 'insight') {
          matchedResult = resultsByType.get('question_breakdown')?.[0] ?? resultsByType.get('dataset_summary')?.[0]
        }

        // Build a rich summary based on whether we have real data
        const summary = matchedResult
          ? this.buildDataDrivenSummary(step.name, artifact, brief, matchedResult, filterDesc)
          : `${step.name} produced ${toTitleCase(artifact)} for "${brief}".${filterDesc ? ` ${filterDesc}` : ''}`

        const output: RunOutput = {
          id: outputId,
          label: toTitleCase(artifact),
          type: outputType,
          summary,
        }

        // Attach structured data to the output
        if (matchedResult) {
          output.data = matchedResult
        }

        // Add citations for data-backed outputs
        if (matchedResult && (matchedResult.type === 'dataset_summary' || matchedResult.type === 'crosstab')) {
          output.citations = this.buildCitations(matchedResult)
        }

        outputs.push(output)
      }
    }

    return outputs
  }

  private buildDataDrivenSummary(stepName: string, artifact: string, brief: string, result: AnalysisResult, filterDesc: string): string {
    switch (result.type) {
      case 'dataset_summary': {
        const r = result
        return `${stepName}: Analyzed ${r.total_respondents.toLocaleString()} respondents across ${r.wave_count} wave(s) covering ${r.categories.join(', ')}. ${r.question_count} questions available.${filterDesc ? ` ${filterDesc}` : ''}`
      }
      case 'question_breakdown': {
        const r = result
        const top = r.datapoints[0]
        return `${stepName}: ${r.question_name} — top response "${top?.name}" at ${top?.percentage}% (index ${top?.index_vs_avg}) from ${r.wave_name} (n=${r.sample_size.toLocaleString()}).${filterDesc ? ` ${filterDesc}` : ''}`
      }
      case 'crosstab': {
        const r = result
        const sigRows = r.rows.filter(row => row.significance === 'high').length
        return `${stepName}: Crosstab with ${r.rows.length} cells, rebased to ${r.rebase_mode} (base: ${r.total_base.toLocaleString()}). ${sigRows} high-significance findings.${filterDesc ? ` ${filterDesc}` : ''}`
      }
      case 'wave_comparison': {
        const r = result
        const sigDeltas = r.deltas.filter(d => d.significant).length
        const biggestUp = r.deltas.filter(d => d.direction === 'up').sort((a, b) => b.delta - a.delta)[0]
        let s = `${stepName}: ${r.wave_a.name} vs ${r.wave_b.name} — ${sigDeltas} significant shifts found.`
        if (biggestUp) s += ` Biggest increase: "${biggestUp.datapoint}" +${biggestUp.delta}pp.`
        return s + (filterDesc ? ` ${filterDesc}` : '')
      }
      case 'time_series': {
        const r = result
        return `${stepName}: ${r.timeframe} time series across ${r.periods.length} periods for "${brief}".${filterDesc ? ` ${filterDesc}` : ''}`
      }
      case 'datapoint_detail': {
        const r = result
        const trend = r.across_waves.length > 1
          ? ` Trend across ${r.across_waves.length} waves: ${r.across_waves.map(w => `${w.wave_name}: ${w.percentage}%`).join(' → ')}.`
          : ''
        return `${stepName}: Deep dive on "${r.datapoint_name}" (${r.question_name}).${trend}${filterDesc ? ` ${filterDesc}` : ''}`
      }
      default:
        return `${stepName} produced ${toTitleCase(artifact)} for "${brief}".${filterDesc ? ` ${filterDesc}` : ''}`
    }
  }

  private buildCitations(result: AnalysisResult): RunOutput['citations'] {
    if (result.type === 'dataset_summary') {
      return result.waves.map(w => ({
        text: `${w.name} survey data`,
        source: `GWI ${w.name}`,
        wave_id: w.id,
        sample_size: w.sample_size,
        confidence_level: 'high' as const,
      }))
    }
    if (result.type === 'crosstab') {
      return [{
        text: `Crosstab analysis (${result.rebase_mode} rebase)`,
        source: `GWI analysis engine`,
        sample_size: result.total_base,
        confidence_level: 'high' as const,
      }]
    }
    return []
  }

  private describeFilters(config?: AnalysisConfig): string {
    if (!config) return ''
    const parts: string[] = []
    if (config.timeframe) parts.push(`timeframe: ${config.timeframe}`)
    if (config.granularity) parts.push(`granularity: ${config.granularity}`)
    if (config.rebase_mode) parts.push(`rebase: ${config.rebase_mode}`)
    if (config.wave_ids?.length) parts.push(`waves: ${config.wave_ids.length}`)
    if (config.compare_waves) parts.push('wave comparison enabled')
    return parts.length > 0 ? `[Filters: ${parts.join(', ')}]` : ''
  }

  // ── Persistence ──────────────────────────────────────────────────

  private persistRun(run: Run) {
    const db = getDb()
    db.prepare(`INSERT INTO runs (id, flow_id, status, brief, analysis_config, started_at, completed_at, outputs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(run.id, run.flow_id, run.status, run.brief,
        run.analysis_config ? JSON.stringify(run.analysis_config) : null,
        run.started_at, run.completed_at ?? null, JSON.stringify(run.outputs))
  }

  // ── Row mappers ──────────────────────────────────────────────────

  private toCapability(row: any): Capability {
    return {
      id: row.id, name: row.name, type: row.type, category: row.category,
      description: row.description,
      inputs: parseJson(row.inputs, []),
      outputs: parseJson(row.outputs, []),
      dependencies: parseJson(row.dependencies, undefined),
      confidence: row.confidence ?? undefined,
    }
  }

  private toFlow(row: any): Flow {
    return {
      id: row.id, name: row.name, description: row.description,
      triggers: parseJson(row.triggers, []),
      steps: parseJson(row.steps, []),
    }
  }

  private toLinkage(row: any): Linkage {
    return {
      id: row.id, name: row.name, description: row.description,
      endpoints: parseJson(row.endpoints, []),
      auth: row.auth,
    }
  }

  private toRun(row: any): Run {
    return {
      id: row.id, flow_id: row.flow_id, status: row.status, brief: row.brief,
      analysis_config: parseJson(row.analysis_config, undefined),
      started_at: row.started_at, completed_at: row.completed_at ?? undefined,
      outputs: parseJson(row.outputs, []),
    }
  }
}
