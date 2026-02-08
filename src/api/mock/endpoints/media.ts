import type { TvStudyConfig, TvStudyResults, PrintRFConfig, PrintRFResults, TvChannel, Publication } from '../../types'
import { mockTvStudies, mockPrintRFStudies, mockTvChannels, mockPublications } from '../data/media'
import type { TvStudyRecord, PrintRFStudyRecord } from '../data/media'
import { delay, findById, newId, now } from '../helpers'

const tvStudies = [...mockTvStudies]
const printStudies = [...mockPrintRFStudies]

export const mediaApi = {
  // TV Study endpoints
  async listTvStudies(): Promise<TvStudyRecord[]> {
    await delay()
    return tvStudies.map((s) => ({ ...s }))
  },

  async getTvStudy(id: string): Promise<TvStudyRecord> {
    await delay()
    const s = findById(tvStudies, id)
    if (!s) throw new Error(`TV study ${id} not found`)
    return { ...s }
  },

  async createTvStudy(config: TvStudyConfig): Promise<TvStudyRecord> {
    await delay()
    const study: TvStudyRecord = {
      id: newId('tv'),
      name: config.name,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_current',
      config,
    }
    tvStudies.unshift(study)
    return { ...study }
  },

  async runTvStudy(id: string): Promise<TvStudyRecord> {
    await delay(500)
    const study = findById(tvStudies, id)
    if (!study) throw new Error(`TV study ${id} not found`)

    // Generate mock results
    const channelCount = study.config.channels.length
    study.results = {
      summary: {
        universe: Math.round(Math.random() * 20000000 + 5000000),
        sample_size: Math.round(Math.random() * 3000 + 1000),
        reach: Math.round(Math.random() * 10000000 + 2000000),
        reach_pct: Math.round(Math.random() * 40 + 20),
        avg_frequency: Math.round(Math.random() * 30 + 15) / 10,
        impacts: Math.round(Math.random() * 30000000 + 5000000),
        grp: Math.round(Math.random() * 200 + 50),
        effective_reach_pct: Math.round(Math.random() * 30 + 15),
        effective_frequency_threshold: 3,
        estimated_spend: study.config.budget ? Math.round(study.config.budget * 0.95) : undefined,
        cpm: Math.round(Math.random() * 3000 + 1000) / 100,
      },
      reach_curve: Array.from({ length: 8 }, (_, i) => ({
        frequency: i + 1,
        reach_pct: Math.max(5, Math.round((50 - i * 6) + Math.random() * 5)),
        cumulative_reach: Math.round(Math.random() * 5000000 + 1000000),
      })),
      daypart_breakdown: study.config.daypart_schedule?.map((dp) => ({
        daypart: dp.daypart,
        label: dp.label,
        reach_pct: Math.round(Math.random() * 30 + 10),
        grp: Math.round(Math.random() * 80 + 20),
        cpm: dp.cpm,
        attention_score: dp.attention_score,
        efficiency_rating: 'medium' as const,
      })) ?? [],
      channel_contribution: study.config.channels.map((chId) => ({
        channel_id: chId,
        channel_name: chId.replace('ch_', '').replace(/_/g, ' ').toUpperCase(),
        incremental_reach: Math.round(Math.random() * 20 + 5),
        overlap_pct: Math.round(Math.random() * 15 + 5),
        exclusive_reach: Math.round(Math.random() * 10 + 3),
      })),
      overlap_matrix: channelCount > 1 ? Array.from({ length: Math.min(channelCount * (channelCount - 1) / 2, 6) }, (_, i) => ({
        channel_a: study.config.channels[i % channelCount],
        channel_b: study.config.channels[(i + 1) % channelCount],
        overlap_pct: Math.round(Math.random() * 20 + 5),
      })) : undefined,
    }

    study.updated_at = now()
    return { ...study }
  },

  async listTvChannels(): Promise<TvChannel[]> {
    await delay()
    return [...mockTvChannels]
  },

  // Print R&F endpoints
  async listPrintStudies(): Promise<PrintRFStudyRecord[]> {
    await delay()
    return printStudies.map((s) => ({ ...s }))
  },

  async getPrintStudy(id: string): Promise<PrintRFStudyRecord> {
    await delay()
    const s = findById(printStudies, id)
    if (!s) throw new Error(`Print study ${id} not found`)
    return { ...s }
  },

  async createPrintStudy(config: PrintRFConfig): Promise<PrintRFStudyRecord> {
    await delay()
    const study: PrintRFStudyRecord = {
      id: newId('print'),
      name: config.name,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_current',
      config,
    }
    printStudies.unshift(study)
    return { ...study }
  },

  async runPrintStudy(id: string): Promise<PrintRFStudyRecord> {
    await delay(500)
    const study = findById(printStudies, id)
    if (!study) throw new Error(`Print study ${id} not found`)

    study.results = {
      summary: {
        universe: Math.round(Math.random() * 20000000 + 5000000),
        sample_size: Math.round(Math.random() * 3000 + 1000),
        net_reach: Math.round(Math.random() * 5000000 + 1000000),
        net_reach_pct: Math.round(Math.random() * 30 + 10),
        gross_reach: Math.round(Math.random() * 10000000 + 2000000),
        avg_frequency: Math.round(Math.random() * 20 + 10) / 10,
        ots: Math.round(Math.random() * 20000000 + 5000000),
        coverage_index: Math.round(Math.random() * 60 + 100),
        total_cost: study.config.budget ? Math.round(study.config.budget * 0.85) : undefined,
        cost_per_reach_point: Math.round(Math.random() * 20000 + 5000),
        cpm: Math.round(Math.random() * 5000 + 2000) / 100,
      },
      frequency_distribution: Array.from({ length: 6 }, (_, i) => ({
        exposures: i,
        audience_pct: Math.max(1, Math.round((i === 0 ? 70 : 30 / i) + Math.random() * 5)),
        cumulative_pct: Math.max(1, Math.round(100 - i * 15 + Math.random() * 5)),
      })),
      publication_contribution: study.config.publications.map((pubId) => ({
        publication_id: pubId,
        publication_name: pubId.replace('pub_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        exclusive_reach_pct: Math.round(Math.random() * 10 + 3),
        incremental_reach: Math.round(Math.random() * 12 + 5),
        affinity_index: Math.round(Math.random() * 80 + 100),
      })),
      duplication_matrix: study.config.publications.length > 1 ? [
        {
          pub_a: study.config.publications[0],
          pub_b: study.config.publications[1],
          overlap_pct: Math.round(Math.random() * 15 + 5),
        },
      ] : undefined,
    }

    study.updated_at = now()
    return { ...study }
  },

  async listPublications(): Promise<Publication[]> {
    await delay()
    return [...mockPublications]
  },
}
