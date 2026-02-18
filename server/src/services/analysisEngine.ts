import { getDb } from '../db/index.js'

// ── Types ───────────────────────────────────────────────────────────

export interface AnalysisConfig {
  timeframe?: 'quarterly' | 'monthly' | 'weekly'
  granularity?: 'dataset' | 'question' | 'datapoint'
  rebase_mode?: 'column' | 'row' | 'total' | 'respondent_base'
  wave_ids?: string[]
  compare_waves?: boolean
}

interface SurveyRow {
  wave_id: string
  question_id: string
  datapoint_id: string
  category: string
  question_name: string
  datapoint_name: string
  respondent_count: number
  percentage: number
  index_vs_avg: number
  sample_size: number
}

interface WaveRow {
  id: string
  name: string
  study_id: string
  study_name: string
  year: number
  quarter: number | null
  start_date: string
  end_date: string
  sample_size: number
}

// ── Output types for run artifacts ─────────────────────────────────

export interface DatasetSummary {
  type: 'dataset_summary'
  wave_count: number
  waves: Array<{ id: string; name: string; sample_size: number }>
  total_respondents: number
  question_count: number
  categories: string[]
}

export interface QuestionBreakdown {
  type: 'question_breakdown'
  question_id: string
  question_name: string
  category: string
  wave_id: string
  wave_name: string
  sample_size: number
  datapoints: Array<{
    id: string
    name: string
    percentage: number
    respondent_count: number
    index_vs_avg: number
  }>
}

export interface DatapointDetail {
  type: 'datapoint_detail'
  datapoint_id: string
  datapoint_name: string
  question_id: string
  question_name: string
  across_waves: Array<{
    wave_id: string
    wave_name: string
    percentage: number
    respondent_count: number
    index_vs_avg: number
    sample_size: number
  }>
}

export interface CrosstabResult {
  type: 'crosstab'
  rows: Array<{
    question: string
    datapoint: string
    wave: string
    percentage: number
    rebased_percentage: number
    respondent_count: number
    index_vs_avg: number
    significance: 'high' | 'medium' | 'low' | 'none'
  }>
  rebase_mode: string
  total_base: number
}

export interface WaveComparison {
  type: 'wave_comparison'
  wave_a: { id: string; name: string }
  wave_b: { id: string; name: string }
  deltas: Array<{
    question: string
    datapoint: string
    pct_a: number
    pct_b: number
    delta: number
    direction: 'up' | 'down' | 'flat'
    significant: boolean
  }>
}

export interface TimeSeriesResult {
  type: 'time_series'
  timeframe: string
  periods: Array<{
    label: string
    start_date: string
    end_date: string
    wave_id: string
    metrics: Array<{
      question: string
      datapoint: string
      percentage: number
      respondent_count: number
    }>
  }>
}

export type AnalysisResult =
  | DatasetSummary
  | QuestionBreakdown
  | DatapointDetail
  | CrosstabResult
  | WaveComparison
  | TimeSeriesResult

// ── Engine ──────────────────────────────────────────────────────────

export class AnalysisEngine {
  /**
   * Run a full analysis based on the provided config.
   * Returns structured results that get attached to run outputs.
   */
  run(config: AnalysisConfig): AnalysisResult[] {
    const results: AnalysisResult[] = []
    const waveIds = this.resolveWaves(config)

    // Always produce a dataset summary
    results.push(this.buildDatasetSummary(waveIds))

    // Granularity determines the detail level of the main analysis
    const granularity = config.granularity ?? 'question'

    if (granularity === 'dataset') {
      // High-level category aggregation only
      results.push(this.buildCrosstab(waveIds, config.rebase_mode, 'dataset'))
    } else if (granularity === 'question') {
      // Per-question breakdowns
      const questions = this.getQuestionsForWaves(waveIds)
      for (const q of questions.slice(0, 5)) { // Top 5 most relevant
        results.push(this.buildQuestionBreakdown(q, waveIds))
      }
      results.push(this.buildCrosstab(waveIds, config.rebase_mode, 'question'))
    } else {
      // Datapoint level — full detail
      const questions = this.getQuestionsForWaves(waveIds)
      for (const q of questions.slice(0, 3)) {
        results.push(this.buildQuestionBreakdown(q, waveIds))
        const datapoints = this.getDatapointsForQuestion(q, waveIds)
        for (const dp of datapoints.slice(0, 3)) {
          results.push(this.buildDatapointDetail(dp, waveIds))
        }
      }
      results.push(this.buildCrosstab(waveIds, config.rebase_mode, 'datapoint'))
    }

    // Timeframe produces time-series if we have multiple waves
    if (config.timeframe && waveIds.length > 1) {
      results.push(this.buildTimeSeries(waveIds, config.timeframe))
    }

    // Wave comparison when enabled and 2+ waves
    if (config.compare_waves && waveIds.length >= 2) {
      // Compare all adjacent pairs
      for (let i = 0; i < waveIds.length - 1; i++) {
        results.push(this.buildWaveComparison(waveIds[i], waveIds[i + 1]))
      }
    }

    return results
  }

  /** Determine which waves to query based on config */
  private resolveWaves(config: AnalysisConfig): string[] {
    const db = getDb()

    if (config.wave_ids?.length) {
      // Validate that requested waves exist
      const placeholders = config.wave_ids.map(() => '?').join(',')
      const rows = db.prepare(`SELECT id FROM waves WHERE id IN (${placeholders}) ORDER BY start_date DESC`).all(...config.wave_ids) as { id: string }[]
      return rows.map(r => r.id)
    }

    // Default: all waves, most recent first
    const rows = db.prepare('SELECT id FROM waves ORDER BY start_date DESC').all() as { id: string }[]
    return rows.map(r => r.id)
  }

  private getWaveInfo(waveId: string): WaveRow {
    const db = getDb()
    return db.prepare('SELECT * FROM waves WHERE id = ?').get(waveId) as WaveRow
  }

  private getQuestionsForWaves(waveIds: string[]): string[] {
    const db = getDb()
    const placeholders = waveIds.map(() => '?').join(',')
    const rows = db.prepare(`SELECT DISTINCT question_id FROM survey_data WHERE wave_id IN (${placeholders}) ORDER BY question_id`).all(...waveIds) as { question_id: string }[]
    return rows.map(r => r.question_id)
  }

  private getDatapointsForQuestion(questionId: string, waveIds: string[]): string[] {
    const db = getDb()
    const placeholders = waveIds.map(() => '?').join(',')
    const rows = db.prepare(`SELECT DISTINCT datapoint_id FROM survey_data WHERE question_id = ? AND wave_id IN (${placeholders}) ORDER BY datapoint_id`).all(questionId, ...waveIds) as { datapoint_id: string }[]
    return rows.map(r => r.datapoint_id)
  }

  // ── Dataset Summary ──────────────────────────────────────────────

  private buildDatasetSummary(waveIds: string[]): DatasetSummary {
    const db = getDb()
    const placeholders = waveIds.map(() => '?').join(',')

    const waveRows = db.prepare(`SELECT id, name, sample_size FROM waves WHERE id IN (${placeholders}) ORDER BY start_date DESC`).all(...waveIds) as Array<{ id: string; name: string; sample_size: number }>

    const questionCount = (db.prepare(`SELECT COUNT(DISTINCT question_id) as cnt FROM survey_data WHERE wave_id IN (${placeholders})`).get(...waveIds) as { cnt: number }).cnt

    const categories = (db.prepare(`SELECT DISTINCT category FROM survey_data WHERE wave_id IN (${placeholders}) ORDER BY category`).all(...waveIds) as { category: string }[]).map(r => r.category)

    return {
      type: 'dataset_summary',
      wave_count: waveRows.length,
      waves: waveRows,
      total_respondents: waveRows.reduce((sum, w) => sum + w.sample_size, 0),
      question_count: questionCount,
      categories,
    }
  }

  // ── Question Breakdown ───────────────────────────────────────────

  private buildQuestionBreakdown(questionId: string, waveIds: string[]): QuestionBreakdown {
    const db = getDb()
    // Use the most recent wave for the primary breakdown
    const waveId = waveIds[0]
    const wave = this.getWaveInfo(waveId)

    const rows = db.prepare(`
      SELECT datapoint_id, datapoint_name, percentage, respondent_count, index_vs_avg, question_name, category
      FROM survey_data WHERE question_id = ? AND wave_id = ?
      ORDER BY percentage DESC
    `).all(questionId, waveId) as (SurveyRow & { datapoint_name: string })[]

    const first = rows[0]
    return {
      type: 'question_breakdown',
      question_id: questionId,
      question_name: first?.question_name ?? questionId,
      category: first?.category ?? 'Unknown',
      wave_id: waveId,
      wave_name: wave.name,
      sample_size: wave.sample_size,
      datapoints: rows.map(r => ({
        id: r.datapoint_id,
        name: r.datapoint_name,
        percentage: r.percentage,
        respondent_count: r.respondent_count,
        index_vs_avg: r.index_vs_avg,
      })),
    }
  }

  // ── Datapoint Detail ─────────────────────────────────────────────

  private buildDatapointDetail(datapointId: string, waveIds: string[]): DatapointDetail {
    const db = getDb()
    const placeholders = waveIds.map(() => '?').join(',')

    const rows = db.prepare(`
      SELECT sd.*, w.name as wave_name
      FROM survey_data sd
      JOIN waves w ON w.id = sd.wave_id
      WHERE sd.datapoint_id = ? AND sd.wave_id IN (${placeholders})
      ORDER BY w.start_date DESC
    `).all(datapointId, ...waveIds) as (SurveyRow & { wave_name: string })[]

    const first = rows[0]
    return {
      type: 'datapoint_detail',
      datapoint_id: datapointId,
      datapoint_name: first?.datapoint_name ?? datapointId,
      question_id: first?.question_id ?? '',
      question_name: first?.question_name ?? '',
      across_waves: rows.map(r => ({
        wave_id: r.wave_id,
        wave_name: r.wave_name,
        percentage: r.percentage,
        respondent_count: r.respondent_count,
        index_vs_avg: r.index_vs_avg,
        sample_size: r.sample_size,
      })),
    }
  }

  // ── Crosstab with Rebase ─────────────────────────────────────────

  private buildCrosstab(waveIds: string[], rebaseMode?: string, level?: string): CrosstabResult {
    const db = getDb()
    const placeholders = waveIds.map(() => '?').join(',')

    // Get total base for rebase calculations
    const totalBase = (db.prepare(`SELECT SUM(sample_size) as total FROM waves WHERE id IN (${placeholders})`).get(...waveIds) as { total: number }).total

    let query: string
    if (level === 'dataset') {
      // Aggregate at category level
      query = `
        SELECT category as question_name, 'All' as datapoint_name, w.name as wave_name,
          AVG(percentage) as percentage, SUM(respondent_count) as respondent_count,
          AVG(index_vs_avg) as index_vs_avg, SUM(sd.sample_size) as sample_size
        FROM survey_data sd
        JOIN waves w ON w.id = sd.wave_id
        WHERE sd.wave_id IN (${placeholders})
        GROUP BY category, w.name
        ORDER BY category, w.start_date DESC
      `
    } else {
      query = `
        SELECT question_name, datapoint_name, w.name as wave_name,
          percentage, respondent_count, index_vs_avg, sd.sample_size
        FROM survey_data sd
        JOIN waves w ON w.id = sd.wave_id
        WHERE sd.wave_id IN (${placeholders})
        ORDER BY question_name, percentage DESC
        LIMIT 100
      `
    }

    const rows = db.prepare(query).all(...waveIds) as Array<{
      question_name: string; datapoint_name: string; wave_name: string
      percentage: number; respondent_count: number; index_vs_avg: number; sample_size: number
    }>

    const rebase = rebaseMode ?? 'total'

    return {
      type: 'crosstab',
      rebase_mode: rebase,
      total_base: totalBase,
      rows: rows.map(r => {
        let rebasedPct: number
        switch (rebase) {
          case 'column':
            // Normalize within the wave (column)
            rebasedPct = r.sample_size > 0 ? (r.respondent_count / r.sample_size) * 100 : 0
            break
          case 'row':
            // Normalize within the question row
            rebasedPct = totalBase > 0 ? (r.respondent_count / totalBase) * 100 * rows.length : r.percentage
            break
          case 'respondent_base':
            rebasedPct = r.sample_size > 0 ? (r.respondent_count / r.sample_size) * 100 : 0
            break
          default: // 'total'
            rebasedPct = totalBase > 0 ? (r.respondent_count / totalBase) * 100 : r.percentage
            break
        }
        rebasedPct = Math.round(rebasedPct * 100) / 100

        // Significance based on index
        let significance: 'high' | 'medium' | 'low' | 'none'
        if (r.index_vs_avg >= 130) significance = 'high'
        else if (r.index_vs_avg >= 110) significance = 'medium'
        else if (r.index_vs_avg <= 70) significance = 'high'
        else if (r.index_vs_avg <= 90) significance = 'low'
        else significance = 'none'

        return {
          question: r.question_name,
          datapoint: r.datapoint_name,
          wave: r.wave_name,
          percentage: r.percentage,
          rebased_percentage: rebasedPct,
          respondent_count: r.respondent_count,
          index_vs_avg: r.index_vs_avg,
          significance,
        }
      }),
    }
  }

  // ── Wave Comparison ──────────────────────────────────────────────

  private buildWaveComparison(waveIdA: string, waveIdB: string): WaveComparison {
    const db = getDb()
    const waveA = this.getWaveInfo(waveIdA)
    const waveB = this.getWaveInfo(waveIdB)

    // Find questions that exist in both waves
    const shared = db.prepare(`
      SELECT DISTINCT a.question_id, a.datapoint_id, a.question_name, a.datapoint_name,
        a.percentage as pct_a, b.percentage as pct_b
      FROM survey_data a
      JOIN survey_data b ON a.question_id = b.question_id AND a.datapoint_id = b.datapoint_id
      WHERE a.wave_id = ? AND b.wave_id = ?
      ORDER BY ABS(a.percentage - b.percentage) DESC
      LIMIT 50
    `).all(waveIdA, waveIdB) as Array<{
      question_id: string; datapoint_id: string; question_name: string; datapoint_name: string
      pct_a: number; pct_b: number
    }>

    return {
      type: 'wave_comparison',
      wave_a: { id: waveIdA, name: waveA.name },
      wave_b: { id: waveIdB, name: waveB.name },
      deltas: shared.map(r => {
        const delta = Math.round((r.pct_a - r.pct_b) * 100) / 100
        return {
          question: r.question_name,
          datapoint: r.datapoint_name,
          pct_a: r.pct_a,
          pct_b: r.pct_b,
          delta,
          direction: (delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
          significant: Math.abs(delta) > 3,
        }
      }),
    }
  }

  // ── Time Series ──────────────────────────────────────────────────

  private buildTimeSeries(waveIds: string[], timeframe: string): TimeSeriesResult {
    const db = getDb()
    const placeholders = waveIds.map(() => '?').join(',')

    const waveRows = db.prepare(`SELECT * FROM waves WHERE id IN (${placeholders}) ORDER BY start_date ASC`).all(...waveIds) as WaveRow[]

    // Group waves into periods based on timeframe
    const periods = waveRows.map(wave => {
      let label: string
      if (timeframe === 'quarterly') {
        label = wave.quarter ? `Q${wave.quarter} ${wave.year}` : wave.name
      } else if (timeframe === 'monthly') {
        const start = new Date(wave.start_date)
        label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } else {
        // Weekly — use the wave start date as the week label
        label = `Week of ${wave.start_date}`
      }

      // Get top metrics for this wave
      const metrics = db.prepare(`
        SELECT question_name as question, datapoint_name as datapoint, percentage, respondent_count
        FROM survey_data WHERE wave_id = ?
        ORDER BY percentage DESC LIMIT 20
      `).all(wave.id) as Array<{ question: string; datapoint: string; percentage: number; respondent_count: number }>

      return {
        label,
        start_date: wave.start_date,
        end_date: wave.end_date,
        wave_id: wave.id,
        metrics,
      }
    })

    return {
      type: 'time_series',
      timeframe,
      periods,
    }
  }
}
