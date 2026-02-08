import type { TvStudyConfig, TvStudyResults, PrintRFConfig, PrintRFResults, TvChannel, Publication } from '../../types'
import { daysAgo } from '../helpers'

// ============== TV Channels ==============

export const mockTvChannels: TvChannel[] = [
  { id: 'ch_abc', name: 'ABC', network: 'ABC', type: 'broadcast', country: 'US' },
  { id: 'ch_nbc', name: 'NBC', network: 'NBC Universal', type: 'broadcast', country: 'US' },
  { id: 'ch_cbs', name: 'CBS', network: 'Paramount', type: 'broadcast', country: 'US' },
  { id: 'ch_fox', name: 'FOX', network: 'Fox Corporation', type: 'broadcast', country: 'US' },
  { id: 'ch_espn', name: 'ESPN', network: 'Disney', type: 'cable', country: 'US' },
  { id: 'ch_cnn', name: 'CNN', network: 'Warner Bros Discovery', type: 'cable', country: 'US' },
  { id: 'ch_hulu_live', name: 'Hulu + Live TV', network: 'Disney', type: 'streaming', country: 'US' },
  { id: 'ch_youtube_tv', name: 'YouTube TV', network: 'Google', type: 'streaming', country: 'US' },
  { id: 'ch_roku', name: 'Roku Channel', network: 'Roku', type: 'ctv', country: 'US' },
  { id: 'ch_samsung_tv', name: 'Samsung TV Plus', network: 'Samsung', type: 'ctv', country: 'US' },
]

// ============== TV Studies ==============

export interface TvStudyRecord {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id: string
  config: TvStudyConfig
  results?: TvStudyResults
}

export const mockTvStudies: TvStudyRecord[] = [
  {
    id: 'tv_q4_campaign',
    name: 'Q4 Holiday Campaign - TV Reach Analysis',
    created_at: daysAgo(15),
    updated_at: daysAgo(3),
    user_id: 'user_sarah',
    config: {
      name: 'Q4 Holiday Campaign - TV Reach Analysis',
      channels: ['ch_abc', 'ch_nbc', 'ch_cbs', 'ch_espn'],
      audience_id: 'aud_high_income',
      audience_label: 'High-Income Professionals',
      location_ids: ['loc_us'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }],
      daypart_schedule: [
        { daypart: 'early_peak', label: 'Early Prime (6-8pm)', time_range: '18:00-20:00', weekday: true, weekend: true, cpm: 32.50, attention_score: 78 },
        { daypart: 'peak', label: 'Prime Time (8-10pm)', time_range: '20:00-22:00', weekday: true, weekend: true, cpm: 48.00, attention_score: 85 },
        { daypart: 'late_peak', label: 'Late Prime (10pm-12am)', time_range: '22:00-00:00', weekday: true, weekend: false, cpm: 22.00, attention_score: 65 },
      ],
      timezone: 'local',
      budget: 500000,
      budget_allocation: { ch_abc: 150000, ch_nbc: 150000, ch_cbs: 100000, ch_espn: 100000 },
    },
    results: {
      summary: {
        universe: 8400000,
        sample_size: 1560,
        reach: 4620000,
        reach_pct: 55.0,
        avg_frequency: 4.2,
        impacts: 19404000,
        grp: 231,
        effective_reach_pct: 38.5,
        effective_frequency_threshold: 3,
        estimated_spend: 485000,
        cpm: 25.00,
      },
      reach_curve: [
        { frequency: 1, reach_pct: 55.0, cumulative_reach: 4620000 },
        { frequency: 2, reach_pct: 47.2, cumulative_reach: 3964800 },
        { frequency: 3, reach_pct: 38.5, cumulative_reach: 3234000 },
        { frequency: 4, reach_pct: 30.1, cumulative_reach: 2528400 },
        { frequency: 5, reach_pct: 22.8, cumulative_reach: 1915200 },
        { frequency: 6, reach_pct: 16.4, cumulative_reach: 1377600 },
        { frequency: 7, reach_pct: 11.2, cumulative_reach: 940800 },
        { frequency: 8, reach_pct: 7.5, cumulative_reach: 630000 },
      ],
      daypart_breakdown: [
        { daypart: 'early_peak', label: 'Early Prime (6-8pm)', reach_pct: 32.4, grp: 78, cpm: 32.50, attention_score: 78, efficiency_rating: 'medium' },
        { daypart: 'peak', label: 'Prime Time (8-10pm)', reach_pct: 44.8, grp: 112, cpm: 48.00, attention_score: 85, efficiency_rating: 'high' },
        { daypart: 'late_peak', label: 'Late Prime (10pm-12am)', reach_pct: 18.6, grp: 41, cpm: 22.00, attention_score: 65, efficiency_rating: 'medium' },
      ],
      channel_contribution: [
        { channel_id: 'ch_abc', channel_name: 'ABC', incremental_reach: 22.1, overlap_pct: 15.3, exclusive_reach: 8.4, cost_per_reach_point: 6790 },
        { channel_id: 'ch_nbc', channel_name: 'NBC', incremental_reach: 18.5, overlap_pct: 18.7, exclusive_reach: 7.1, cost_per_reach_point: 8108 },
        { channel_id: 'ch_cbs', channel_name: 'CBS', incremental_reach: 12.3, overlap_pct: 22.1, exclusive_reach: 5.2, cost_per_reach_point: 8130 },
        { channel_id: 'ch_espn', channel_name: 'ESPN', incremental_reach: 15.8, overlap_pct: 12.4, exclusive_reach: 9.3, cost_per_reach_point: 6329 },
      ],
      overlap_matrix: [
        { channel_a: 'ch_abc', channel_b: 'ch_nbc', overlap_pct: 18.7 },
        { channel_a: 'ch_abc', channel_b: 'ch_cbs', overlap_pct: 15.2 },
        { channel_a: 'ch_abc', channel_b: 'ch_espn', overlap_pct: 8.4 },
        { channel_a: 'ch_nbc', channel_b: 'ch_cbs', overlap_pct: 16.9 },
        { channel_a: 'ch_nbc', channel_b: 'ch_espn', overlap_pct: 9.1 },
        { channel_a: 'ch_cbs', channel_b: 'ch_espn', overlap_pct: 7.8 },
      ],
    },
  },
  {
    id: 'tv_ctv_comparison',
    name: 'CTV vs Linear TV Reach Comparison',
    created_at: daysAgo(8),
    updated_at: daysAgo(1),
    user_id: 'user_maria',
    config: {
      name: 'CTV vs Linear TV Reach Comparison',
      channels: ['ch_abc', 'ch_nbc'],
      audience_id: 'aud_gen_z_social',
      audience_label: 'Gen Z Social Media Enthusiasts',
      location_ids: ['loc_us'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }],
      daypart_schedule: [
        { daypart: 'peak', label: 'Prime Time (8-10pm)', time_range: '20:00-22:00', weekday: true, weekend: true, cpm: 48.00, attention_score: 72 },
      ],
      timezone: 'local',
      streaming_platforms: ['ch_hulu_live', 'ch_youtube_tv'],
      include_ctv: true,
      cross_platform_dedup: true,
      budget: 250000,
    },
    results: {
      summary: {
        universe: 18200000,
        sample_size: 3450,
        reach: 7280000,
        reach_pct: 40.0,
        avg_frequency: 3.1,
        impacts: 22568000,
        grp: 124,
        effective_reach_pct: 28.5,
        effective_frequency_threshold: 3,
        estimated_spend: 238000,
        cpm: 10.55,
      },
      reach_curve: [
        { frequency: 1, reach_pct: 40.0, cumulative_reach: 7280000 },
        { frequency: 2, reach_pct: 33.5, cumulative_reach: 6097000 },
        { frequency: 3, reach_pct: 28.5, cumulative_reach: 5187000 },
        { frequency: 4, reach_pct: 22.1, cumulative_reach: 4022200 },
        { frequency: 5, reach_pct: 15.8, cumulative_reach: 2875600 },
      ],
      daypart_breakdown: [
        { daypart: 'peak', label: 'Prime Time (8-10pm)', reach_pct: 40.0, grp: 124, cpm: 10.55, attention_score: 72, efficiency_rating: 'high' },
      ],
      channel_contribution: [
        { channel_id: 'ch_abc', channel_name: 'ABC', incremental_reach: 12.4, overlap_pct: 8.2, exclusive_reach: 5.1 },
        { channel_id: 'ch_nbc', channel_name: 'NBC', incremental_reach: 10.8, overlap_pct: 9.1, exclusive_reach: 4.3 },
        { channel_id: 'ch_hulu_live', channel_name: 'Hulu + Live TV', incremental_reach: 14.2, overlap_pct: 6.5, exclusive_reach: 8.7 },
        { channel_id: 'ch_youtube_tv', channel_name: 'YouTube TV', incremental_reach: 11.6, overlap_pct: 5.8, exclusive_reach: 7.2 },
      ],
      ctv_results: {
        ctv_reach_pct: 28.4,
        linear_only_pct: 11.6,
        ctv_only_pct: 18.2,
        combined_reach_pct: 40.0,
        dedup_savings_pct: 8.2,
      },
    },
  },
]

// ============== Publications ==============

export const mockPublications: Publication[] = [
  { id: 'pub_nyt', name: 'The New York Times', type: 'newspaper', circulation: 860000, rate_card_cpm: 45.00, readership_000: 4200, avg_issue_readership: 1800, country: 'US', frequency: 'daily', has_digital_edition: true, digital_readership_000: 8500 },
  { id: 'pub_wsj', name: 'The Wall Street Journal', type: 'newspaper', circulation: 620000, rate_card_cpm: 52.00, readership_000: 3100, avg_issue_readership: 1400, country: 'US', frequency: 'daily', has_digital_edition: true, digital_readership_000: 5800 },
  { id: 'pub_economist', name: 'The Economist', type: 'magazine', circulation: 420000, rate_card_cpm: 68.00, readership_000: 1800, avg_issue_readership: 950, country: 'US', frequency: 'weekly', has_digital_edition: true, digital_readership_000: 3200 },
  { id: 'pub_time', name: 'Time Magazine', type: 'magazine', circulation: 340000, rate_card_cpm: 38.00, readership_000: 2200, avg_issue_readership: 1100, country: 'US', frequency: 'weekly' },
  { id: 'pub_vogue', name: 'Vogue', type: 'magazine', circulation: 280000, rate_card_cpm: 55.00, readership_000: 1500, avg_issue_readership: 800, country: 'US', frequency: 'monthly' },
  { id: 'pub_wired', name: 'Wired', type: 'magazine', circulation: 180000, rate_card_cpm: 42.00, readership_000: 1200, avg_issue_readership: 620, country: 'US', frequency: 'monthly', has_digital_edition: true, digital_readership_000: 4100 },
  { id: 'pub_adweek', name: 'Adweek', type: 'trade', circulation: 85000, rate_card_cpm: 78.00, readership_000: 450, avg_issue_readership: 220, country: 'US', frequency: 'weekly', has_digital_edition: true, digital_readership_000: 1800 },
]

// ============== Print R&F Studies ==============

export interface PrintRFStudyRecord {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id: string
  config: PrintRFConfig
  results?: PrintRFResults
}

export const mockPrintRFStudies: PrintRFStudyRecord[] = [
  {
    id: 'print_premium_reach',
    name: 'Premium Print Reach Analysis',
    created_at: daysAgo(10),
    updated_at: daysAgo(2),
    user_id: 'user_sophia',
    config: {
      name: 'Premium Print Reach Analysis',
      publications: ['pub_nyt', 'pub_wsj', 'pub_economist'],
      audience_id: 'aud_high_income',
      audience_label: 'High-Income Professionals',
      location_ids: ['loc_us'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }],
      insertion_schedule: [
        { publication_id: 'pub_nyt', publication_name: 'The New York Times', insertions: 12, period: 'monthly', cost_per_insertion: 45000 },
        { publication_id: 'pub_wsj', publication_name: 'The Wall Street Journal', insertions: 8, period: 'monthly', cost_per_insertion: 52000 },
        { publication_id: 'pub_economist', publication_name: 'The Economist', insertions: 4, period: 'monthly', cost_per_insertion: 35000 },
      ],
      include_digital: true,
      cross_platform_dedup: true,
      budget: 1200000,
    },
    results: {
      summary: {
        universe: 8400000,
        sample_size: 1560,
        net_reach: 3360000,
        net_reach_pct: 40.0,
        gross_reach: 6720000,
        avg_frequency: 2.0,
        ots: 13440000,
        coverage_index: 142,
        total_cost: 1096000,
        cost_per_reach_point: 27400,
        cpm: 81.55,
      },
      frequency_distribution: [
        { exposures: 0, audience_pct: 60.0, cumulative_pct: 100.0 },
        { exposures: 1, audience_pct: 18.5, cumulative_pct: 40.0 },
        { exposures: 2, audience_pct: 10.2, cumulative_pct: 21.5 },
        { exposures: 3, audience_pct: 6.1, cumulative_pct: 11.3 },
        { exposures: 4, audience_pct: 3.2, cumulative_pct: 5.2 },
        { exposures: 5, audience_pct: 2.0, cumulative_pct: 2.0 },
      ],
      publication_contribution: [
        { publication_id: 'pub_nyt', publication_name: 'The New York Times', exclusive_reach_pct: 12.4, incremental_reach: 15.2, affinity_index: 156, cost_per_reach_point: 29605 },
        { publication_id: 'pub_wsj', publication_name: 'The Wall Street Journal', exclusive_reach_pct: 8.8, incremental_reach: 11.6, affinity_index: 178, cost_per_reach_point: 35862 },
        { publication_id: 'pub_economist', publication_name: 'The Economist', exclusive_reach_pct: 5.2, incremental_reach: 7.8, affinity_index: 192, cost_per_reach_point: 17949 },
      ],
      duplication_matrix: [
        { pub_a: 'pub_nyt', pub_b: 'pub_wsj', overlap_pct: 22.5 },
        { pub_a: 'pub_nyt', pub_b: 'pub_economist', overlap_pct: 14.8 },
        { pub_a: 'pub_wsj', pub_b: 'pub_economist', overlap_pct: 18.2 },
      ],
      effective_frequency: {
        threshold: 2,
        reach_at_threshold: 21.5,
        under_exposed_pct: 18.5,
        over_exposed_pct: 11.3,
        effectively_reached_pct: 21.5,
      },
      digital_results: {
        print_only_reach_pct: 15.2,
        digital_only_reach_pct: 18.8,
        combined_reach_pct: 52.4,
        dedup_savings_pct: 6.4,
      },
    },
  },
  {
    id: 'print_lifestyle_magazines',
    name: 'Lifestyle Magazine Campaign',
    created_at: daysAgo(5),
    updated_at: daysAgo(0),
    user_id: 'user_maria',
    config: {
      name: 'Lifestyle Magazine Campaign',
      publications: ['pub_vogue', 'pub_time', 'pub_wired'],
      audience_id: 'aud_eco_shoppers',
      audience_label: 'Eco-Conscious Online Shoppers',
      location_ids: ['loc_us'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }],
      insertion_schedule: [
        { publication_id: 'pub_vogue', publication_name: 'Vogue', insertions: 3, period: 'monthly', cost_per_insertion: 28000 },
        { publication_id: 'pub_time', publication_name: 'Time Magazine', insertions: 4, period: 'monthly', cost_per_insertion: 18000 },
        { publication_id: 'pub_wired', publication_name: 'Wired', insertions: 3, period: 'monthly', cost_per_insertion: 15000 },
      ],
      budget: 300000,
    },
    results: {
      summary: {
        universe: 22800000,
        sample_size: 4120,
        net_reach: 4104000,
        net_reach_pct: 18.0,
        gross_reach: 7524000,
        avg_frequency: 1.8,
        ots: 13543200,
        coverage_index: 118,
        total_cost: 201000,
        cost_per_reach_point: 11167,
        cpm: 26.71,
      },
      frequency_distribution: [
        { exposures: 0, audience_pct: 82.0, cumulative_pct: 100.0 },
        { exposures: 1, audience_pct: 9.8, cumulative_pct: 18.0 },
        { exposures: 2, audience_pct: 4.5, cumulative_pct: 8.2 },
        { exposures: 3, audience_pct: 2.4, cumulative_pct: 3.7 },
        { exposures: 4, audience_pct: 1.3, cumulative_pct: 1.3 },
      ],
      publication_contribution: [
        { publication_id: 'pub_vogue', publication_name: 'Vogue', exclusive_reach_pct: 5.8, incremental_reach: 7.2, affinity_index: 134 },
        { publication_id: 'pub_time', publication_name: 'Time Magazine', exclusive_reach_pct: 4.2, incremental_reach: 5.8, affinity_index: 112 },
        { publication_id: 'pub_wired', publication_name: 'Wired', exclusive_reach_pct: 3.1, incremental_reach: 4.5, affinity_index: 145 },
      ],
      duplication_matrix: [
        { pub_a: 'pub_vogue', pub_b: 'pub_time', overlap_pct: 8.4 },
        { pub_a: 'pub_vogue', pub_b: 'pub_wired', overlap_pct: 5.2 },
        { pub_a: 'pub_time', pub_b: 'pub_wired', overlap_pct: 6.8 },
      ],
    },
  },
]
