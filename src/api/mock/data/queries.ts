import type { StatsQueryResponse, CrosstabQueryResult, IntersectionResult, CrosstabDimension } from '../../types'

// Comprehensive label lookup for all datapoint IDs used across mock crosstabs
export const DATAPOINT_LABELS: Record<string, string> = {
  // Social platforms
  dp_facebook: 'Facebook', dp_instagram: 'Instagram', dp_tiktok: 'TikTok', dp_twitter: 'X / Twitter',
  dp_linkedin: 'LinkedIn', dp_youtube: 'YouTube', dp_snapchat: 'Snapchat', dp_pinterest: 'Pinterest',
  dp_reddit: 'Reddit', dp_whatsapp: 'WhatsApp', dp_telegram: 'Telegram', dp_discord: 'Discord',

  // Streaming services
  dp_netflix: 'Netflix', dp_disney: 'Disney+', dp_prime: 'Amazon Prime', dp_hbo: 'HBO Max',
  dp_hulu: 'Hulu', dp_apple_tv: 'Apple TV+', dp_peacock: 'Peacock', dp_paramount: 'Paramount+',
  dp_crunchyroll: 'Crunchyroll', dp_tubi: 'Tubi',

  // Music platforms
  dp_spotify: 'Spotify', dp_apple_music: 'Apple Music', dp_youtube_music: 'YouTube Music',
  dp_amazon_music: 'Amazon Music', dp_tidal: 'Tidal', dp_soundcloud: 'SoundCloud',
  dp_deezer: 'Deezer', dp_pandora: 'Pandora',

  // Podcast platforms
  dp_spotify_pods: 'Spotify Podcasts', dp_apple_pods: 'Apple Podcasts', dp_google_pods: 'Google Podcasts',
  dp_overcast: 'Overcast', dp_pocket_casts: 'Pocket Casts', dp_stitcher: 'Stitcher',

  // News sources
  dp_news_social: 'Social Media News', dp_news_tv: 'TV News', dp_news_online: 'Online News Sites',
  dp_news_podcast: 'News Podcasts', dp_news_print: 'Print Newspapers', dp_news_radio: 'Radio News',
  dp_news_aggregator: 'News Aggregators', dp_news_newsletter: 'Email Newsletters',

  // Gaming platforms
  dp_pc_gaming: 'PC Gaming', dp_ps5: 'PlayStation 5', dp_xbox: 'Xbox Series X/S',
  dp_nintendo: 'Nintendo Switch', dp_mobile_gaming: 'Mobile Gaming', dp_cloud_gaming: 'Cloud Gaming',
  dp_vr_gaming: 'VR Gaming', dp_handheld_gaming: 'Handheld Gaming',

  // Age groups
  dp_age_16_24: '16-24', dp_age_25_34: '25-34', dp_age_35_44: '35-44',
  dp_age_45_54: '45-54', dp_age_55_64: '55-64',

  // Gender
  dp_gender_male: 'Male', dp_gender_female: 'Female', dp_gender_nonbinary: 'Non-binary',

  // Income
  dp_income_low: 'Under $25k', dp_income_mid_low: '$25k-$50k', dp_income_mid: '$50k-$75k',
  dp_income_mid_high: '$75k-$100k', dp_income_high: '$100k+',

  // Region
  dp_region_northeast: 'Northeast', dp_region_southeast: 'Southeast', dp_region_midwest: 'Midwest',
  dp_region_southwest: 'Southwest', dp_region_west: 'West',

  // Education
  dp_edu_hs: 'High School', dp_edu_bachelor: "Bachelor's", dp_edu_master: "Master's", dp_edu_phd: 'PhD',

  // Employment
  dp_emp_full_time: 'Full-time', dp_emp_part_time: 'Part-time', dp_emp_self: 'Self-employed',
  dp_emp_student: 'Student', dp_emp_retired: 'Retired',

  // Marital status
  dp_marital_single: 'Single', dp_marital_married: 'Married', dp_marital_divorced: 'Divorced',
  dp_marital_widowed: 'Widowed',

  // Children
  dp_children_none: 'No Children', dp_children_1: '1 Child', dp_children_2: '2 Children',
  dp_children_3plus: '3+ Children',

  // Purchase categories
  dp_clothing: 'Clothing & Fashion', dp_electronics: 'Electronics', dp_food_delivery: 'Food Delivery',
  dp_beauty: 'Beauty & Personal Care', dp_home_garden: 'Home & Garden',

  // Purchase categories (extended)
  dp_pcat_clothing: 'Clothing & Apparel', dp_pcat_electronics: 'Consumer Electronics',
  dp_pcat_groceries: 'Groceries', dp_pcat_beauty: 'Beauty Products', dp_pcat_home: 'Home Furnishings',
  dp_pcat_sports: 'Sports & Outdoors', dp_pcat_books: 'Books & Media', dp_pcat_toys: 'Toys & Games',
  dp_pcat_automotive: 'Automotive', dp_pcat_jewelry: 'Jewelry & Watches', dp_pcat_pet: 'Pet Supplies',
  dp_pcat_office: 'Office Supplies', dp_pcat_garden: 'Garden & Patio', dp_pcat_health: 'Health & Wellness',
  dp_pcat_travel: 'Travel & Experiences',

  // Purchase channels
  dp_chan_amazon: 'Amazon', dp_chan_brand_website: 'Brand Website', dp_chan_social_commerce: 'Social Commerce',
  dp_chan_marketplace: 'Online Marketplace', dp_chan_in_store: 'In-Store', dp_chan_mobile_app: 'Mobile App',
  dp_chan_subscription: 'Subscription Box', dp_chan_second_hand: 'Second-hand / Resale',
  dp_chan_live_shopping: 'Live Shopping', dp_chan_voice_assistant: 'Voice Assistant',

  // Purchase drivers
  dp_drv_price: 'Best Price', dp_drv_quality: 'Product Quality', dp_drv_brand: 'Brand Reputation',
  dp_drv_reviews: 'Customer Reviews', dp_drv_convenience: 'Convenience', dp_drv_sustainability: 'Sustainability',
  dp_drv_recommendation: 'Personal Recommendation', dp_drv_loyalty_program: 'Loyalty Program',
  dp_drv_free_shipping: 'Free Shipping', dp_drv_returns_policy: 'Returns Policy',

  // Purchase frequency
  dp_freq_daily: 'Daily', dp_freq_weekly: 'Weekly', dp_freq_biweekly: 'Every 2 Weeks',
  dp_freq_monthly: 'Monthly', dp_freq_quarterly: 'Quarterly',

  // Tech brands - awareness
  dp_brand_apple: 'Apple', dp_brand_samsung: 'Samsung', dp_brand_google: 'Google',
  dp_brand_microsoft: 'Microsoft', dp_brand_amazon: 'Amazon', dp_brand_meta: 'Meta',
  dp_brand_sony: 'Sony', dp_brand_lg: 'LG', dp_brand_hp: 'HP', dp_brand_dell: 'Dell',
  dp_brand_lenovo: 'Lenovo', dp_brand_asus: 'ASUS', dp_brand_nvidia: 'NVIDIA',

  // Tech brands - consideration
  dp_consider_apple: 'Apple', dp_consider_samsung: 'Samsung', dp_consider_google: 'Google',
  dp_consider_microsoft: 'Microsoft', dp_consider_amazon: 'Amazon', dp_consider_meta: 'Meta',
  dp_consider_sony: 'Sony', dp_consider_lg: 'LG', dp_consider_hp: 'HP', dp_consider_dell: 'Dell',
  dp_consider_lenovo: 'Lenovo', dp_consider_asus: 'ASUS', dp_consider_nvidia: 'NVIDIA',

  // Brand discovery
  dp_social_ads: 'Social Media Ads', dp_influencer: 'Influencer Content', dp_search: 'Search Engines',
  dp_word_of_mouth: 'Word of Mouth', dp_tv_ads: 'TV Advertising',

  // Fitness
  dp_gym: 'Gym / Weight Training', dp_running: 'Running / Jogging', dp_yoga: 'Yoga / Pilates',
  dp_swimming: 'Swimming', dp_cycling: 'Cycling',

  // Countries
  dp_country_us: 'United States', dp_country_uk: 'United Kingdom', dp_country_de: 'Germany',
  dp_country_fr: 'France', dp_country_jp: 'Japan', dp_country_br: 'Brazil',
  dp_country_in: 'India', dp_country_au: 'Australia', dp_country_ca: 'Canada',
  dp_country_mx: 'Mexico', dp_country_kr: 'South Korea', dp_country_it: 'Italy',

  // Attitude statements - environment
  dp_att_climate_priority: 'Climate change is a top priority', dp_att_recycle_regularly: 'I recycle regularly',
  dp_att_buy_sustainable: 'I try to buy sustainably', dp_att_reduce_plastic: 'I actively reduce plastic use',
  dp_att_carbon_footprint: 'I track my carbon footprint', dp_att_eco_brands: 'I prefer eco-friendly brands',
  dp_att_ev_interest: 'Interested in electric vehicles', dp_att_renewable_energy: 'Support renewable energy',
  dp_att_plant_based: 'Eat more plant-based foods', dp_att_fast_fashion_avoid: 'Avoid fast fashion',

  // Attitude statements - technology
  dp_att_ai_positive: 'AI will improve my life', dp_att_privacy_concerned: 'Concerned about data privacy',
  dp_att_early_adopter: 'I am an early adopter', dp_att_smart_home: 'Use smart home devices',
  dp_att_crypto_interest: 'Interested in cryptocurrency', dp_att_metaverse_interest: 'Interested in the metaverse',
  dp_att_screen_time_worry: 'Worried about screen time', dp_att_digital_detox: 'Regularly do digital detox',
  dp_att_wearable_tech: 'Use wearable technology', dp_att_autonomous_vehicles: 'Trust autonomous vehicles',

  // Attitude statements - health
  dp_att_mental_health_priority: 'Mental health is a priority', dp_att_fitness_important: 'Fitness is important to me',
  dp_att_organic_food: 'Prefer organic food', dp_att_meditation: 'Practice meditation',
  dp_att_sleep_quality: 'Focus on sleep quality', dp_att_work_life_balance: 'Value work-life balance',
  dp_att_preventive_care: 'Believe in preventive care', dp_att_supplements: 'Take health supplements',
  dp_att_gym_member: 'Active gym member', dp_att_health_apps: 'Use health/fitness apps',

  // Attitude statements - finance
  dp_att_saving_priority: 'Saving money is a priority', dp_att_invest_stocks: 'Invest in stocks',
  dp_att_budget_conscious: 'I am budget conscious', dp_att_buy_now_pay_later: 'Use buy-now-pay-later',
  dp_att_financial_anxiety: 'Experience financial anxiety', dp_att_homeownership_goal: 'Homeownership is a goal',
  dp_att_side_hustle: 'Have a side hustle', dp_att_subscription_fatigue: 'Feel subscription fatigue',
  dp_att_luxury_worth: 'Luxury goods are worth it', dp_att_brand_loyalty: 'I am brand loyal',

  // Attitude statements - social
  dp_att_diversity_important: 'Diversity is important', dp_att_community_active: 'Active in my community',
  dp_att_volunteer: 'I volunteer regularly', dp_att_political_engaged: 'Politically engaged',
  dp_att_trust_institutions: 'Trust major institutions', dp_att_social_media_positive: 'Social media is positive',
  dp_att_cancel_culture_concern: 'Concerned about cancel culture', dp_att_local_business_support: 'Support local businesses',
  dp_att_remote_work_prefer: 'Prefer remote work', dp_att_city_life_prefer: 'Prefer city life',
}

// Question name lookup (used as parent group labels)
const QUESTION_LABELS: Record<string, string> = {
  q_social_platforms: 'Social Media Platforms',
  q_streaming_services: 'Streaming Services',
  q_tv_platforms: 'Streaming Services',
  q_music_platforms: 'Music Platforms',
  q_podcast_platforms: 'Podcast Platforms',
  q_news_sources: 'News Sources',
  q_gaming_platforms: 'Gaming Platforms',
  q_age_group: 'Age Group',
  q_gender: 'Gender',
  q_income: 'Household Income',
  q_region: 'Region',
  q_education: 'Education Level',
  q_employment: 'Employment Status',
  q_marital_status: 'Marital Status',
  q_children: 'Children in Household',
  q_purchase_online: 'Online Purchases',
  q_purchase_categories: 'Purchase Categories',
  q_purchase_channels: 'Purchase Channels',
  q_purchase_drivers: 'Purchase Drivers',
  q_purchase_frequency: 'Purchase Frequency',
  q_tech_brands_awareness: 'Brand Awareness',
  q_tech_brands_consideration: 'Brand Consideration',
  q_brand_discovery: 'Brand Discovery',
  q_fitness: 'Fitness Activities',
  q_country: 'Country',
  q_attitudes_environment: 'Environment Attitudes',
  q_attitudes_technology: 'Technology Attitudes',
  q_attitudes_health: 'Health & Wellness Attitudes',
  q_attitudes_finance: 'Finance Attitudes',
  q_attitudes_social: 'Social Attitudes',
}

function resolveLabel(dpId: string): string {
  return DATAPOINT_LABELS[dpId] ?? dpId.replace(/^dp_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function resolveQuestionLabel(qId: string): string {
  return QUESTION_LABELS[qId] ?? qId.replace(/^q_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function generateStatsResponse(questionIds: string[], options?: { include_trend?: boolean; include_confidence_intervals?: boolean }): StatsQueryResponse {
  const results = questionIds.map((qid) => ({
    question_id: qid,
    question_name: qid.replace('q_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    datapoints: generateDatapoints(qid, options),
  }))

  return {
    results,
    meta: {
      base_size: 45200,
      wave_name: 'Q4 2024',
      location_name: 'United States',
      execution_time_ms: Math.floor(Math.random() * 200) + 50,
      effective_base: 43800,
      weighted_base: 45200,
      confidence_level: 95,
      data_freshness: '2025-01-20T00:00:00Z',
    },
  }
}

function generateDatapoints(questionId: string, options?: { include_trend?: boolean; include_confidence_intervals?: boolean }) {
  const datapointSets: Record<string, Array<{ id: string; name: string }>> = {
    q_social_platforms: [
      { id: 'dp_facebook', name: 'Facebook' }, { id: 'dp_instagram', name: 'Instagram' },
      { id: 'dp_tiktok', name: 'TikTok' }, { id: 'dp_twitter', name: 'X / Twitter' },
      { id: 'dp_linkedin', name: 'LinkedIn' }, { id: 'dp_youtube', name: 'YouTube' },
    ],
    q_device_ownership: [
      { id: 'dp_smartphone', name: 'Smartphone' }, { id: 'dp_laptop', name: 'Laptop' },
      { id: 'dp_tablet', name: 'Tablet' }, { id: 'dp_smartwatch', name: 'Smartwatch' },
    ],
    q_tv_platforms: [
      { id: 'dp_netflix', name: 'Netflix' }, { id: 'dp_disney', name: 'Disney+' },
      { id: 'dp_prime', name: 'Amazon Prime' }, { id: 'dp_hbo', name: 'HBO Max' },
    ],
  }

  const dps = datapointSets[questionId] || [
    { id: `${questionId}_dp1`, name: 'Option A' },
    { id: `${questionId}_dp2`, name: 'Option B' },
    { id: `${questionId}_dp3`, name: 'Option C' },
    { id: `${questionId}_dp4`, name: 'Option D' },
  ]

  return dps.map((dp, index) => {
    const pct = Math.round(Math.random() * 60 + 10)
    const size = Math.round(pct * 452)
    const includeTrend = options?.include_trend && index < 3
    const includeCI = options?.include_confidence_intervals && index < 4

    return {
      datapoint_id: dp.id,
      datapoint_name: dp.name,
      metrics: {
        audience_percentage: pct,
        audience_size: size,
        audience_index: Math.round(Math.random() * 80 + 60),
        audience_sample: Math.round(size * 0.02),
        positive_sample: Math.round(size * 0.02 * (pct / 100)),
        positive_size: Math.round(size * (pct / 100)),
        datapoint_percentage: pct + Math.round(Math.random() * 10 - 5),
        datapoint_size: size + Math.round(Math.random() * 200 - 100),
        datapoint_sample: Math.round(size * 0.02),
      },
      // Trend data: quarterly values over 4 quarters
      ...(includeTrend ? {
        trend_data: [
          pct - Math.round(Math.random() * 8 + 2),
          pct - Math.round(Math.random() * 5 + 1),
          pct - Math.round(Math.random() * 3),
          pct,
        ],
      } : {}),
      // Confidence intervals
      ...(includeCI ? {
        confidence_interval: {
          lower: Math.max(0, pct - Math.round(Math.random() * 3 + 1)),
          upper: Math.min(100, pct + Math.round(Math.random() * 3 + 1)),
        },
      } : {}),
    }
  })
}

export interface CrosstabDimensionInfo {
  rows: CrosstabDimension[]
  columns: CrosstabDimension[]
}

function generateTimeframeColumns(timeframe: 'daily' | 'weekly' | 'monthly'): CrosstabQueryResult['columns'] {
  const now = new Date(2024, 11, 15) // Dec 15, 2024 as reference
  const columns: CrosstabQueryResult['columns'] = []

  if (timeframe === 'daily') {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      columns.push({ id: `day_${i}`, label })
    }
  } else if (timeframe === 'weekly') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const weekNum = Math.ceil(d.getDate() / 7)
      const month = d.toLocaleDateString('en-US', { month: 'short' })
      columns.push({ id: `week_${i}`, label: `W${weekNum} ${month}` })
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      columns.push({ id: `month_${i}`, label })
    }
  }

  return columns
}

export function generateCrosstabResult(
  rowCount: number,
  colCount: number,
  dimensionInfo?: CrosstabDimensionInfo,
  timeframe?: 'daily' | 'weekly' | 'monthly',
): CrosstabQueryResult {
  // If we have dimension info, build rows/columns from actual config
  if (dimensionInfo) {
    return generateFromDimensions(dimensionInfo, timeframe)
  }

  // Fallback: generic rows/columns (legacy path)
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    id: `row_${i}`,
    label: `Row ${i + 1}`,
  }))

  const columns = timeframe
    ? generateTimeframeColumns(timeframe)
    : Array.from({ length: colCount }, (_, i) => ({
        id: `col_${i}`,
        label: `Column ${i + 1}`,
      }))

  const cells = rows.map(() =>
    columns.map((_, colIdx) => {
      const basePct = Math.round(Math.random() * 60 + 5)
      const trend = timeframe ? Math.round((colIdx - columns.length / 2) * (Math.random() * 2)) : 0
      const pct = Math.max(1, Math.min(99, basePct + trend))
      return {
        values: {
          audience_percentage: pct,
          audience_index: Math.round(Math.random() * 100 + 50),
          audience_size: Math.round(Math.random() * 5000 + 500),
        } as Record<string, number>,
        significant: Math.random() > 0.7,
        sample_size: Math.round(Math.random() * 800 + 100),
      }
    }),
  )

  const timeframeLabel = timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : timeframe === 'monthly' ? 'Monthly' : undefined

  return {
    rows,
    columns,
    cells,
    meta: {
      base_size: 45200,
      wave_name: timeframeLabel ? `${timeframeLabel} Trend` : 'Q4 2024',
      location_name: 'United States',
      effective_base: 43800,
      weighted_base: 45200,
    },
  }
}

function generateFromDimensions(info: CrosstabDimensionInfo, timeframe?: 'daily' | 'weekly' | 'monthly'): CrosstabQueryResult {
  // Build rows: flatten all row dimensions, preserving parent question as group
  const rows: CrosstabQueryResult['rows'] = []
  for (const dim of info.rows) {
    if (dim.type === 'question') {
      const parentId = dim.question_id ?? 'unknown'
      const datapointIds = dim.datapoint_ids && dim.datapoint_ids.length > 0
        ? dim.datapoint_ids
        : generateDatapoints(parentId).map((datapoint) => datapoint.datapoint_id)

      for (const dpId of datapointIds) {
        rows.push({
          id: dpId,
          label: resolveLabel(dpId),
          parent_id: info.rows.length > 1 ? resolveQuestionLabel(parentId) : undefined,
        })
      }
    }
  }

  // Build columns: use timeframe columns when set, otherwise flatten column dimensions
  let columns: CrosstabQueryResult['columns'] = []
  if (timeframe) {
    columns = generateTimeframeColumns(timeframe)
  } else {
    for (const dim of info.columns) {
      if (dim.type === 'question') {
        const questionId = dim.question_id ?? 'unknown'
        const datapointIds = dim.datapoint_ids && dim.datapoint_ids.length > 0
          ? dim.datapoint_ids
          : generateDatapoints(questionId).map((datapoint) => datapoint.datapoint_id)

        for (const dpId of datapointIds) {
          columns.push({ id: dpId, label: resolveLabel(dpId) })
        }
      } else if (dim.type === 'audience' && dim.audience_id) {
        const label = dim.audience_id.replace(/^aud_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        columns.push({ id: dim.audience_id, label })
      }
    }
  }

  // Ensure query-preview crosstabs are always renderable even without explicit column dims.
  if (!timeframe && columns.length === 0) {
    columns = [{ id: 'total', label: 'Total' }]
  }

  if (rows.length === 0) {
    rows.push({
      id: 'all_respondents',
      label: 'All respondents',
    })
  }

  // Generate cell data with enhanced fields and timeframe trend variation
  const cells = rows.map(() =>
    columns.map((_, colIdx) => {
      const basePct = Math.round(Math.random() * 60 + 5)
      const trend = timeframe ? Math.round((colIdx - columns.length / 2) * (Math.random() * 2)) : 0
      const pct = Math.max(1, Math.min(99, basePct + trend))
      const sampleSize = Math.round(Math.random() * 800 + 100)
      const isSignificant = Math.random() > 0.7
      return {
        values: {
          audience_percentage: pct,
          audience_index: Math.round(Math.random() * 100 + 50),
          audience_size: Math.round(Math.random() * 5000 + 500),
        } as Record<string, number>,
        significant: isSignificant,
        sample_size: sampleSize,
        // Enhanced significance detail on ~30% of cells
        ...(isSignificant ? {
          significance: {
            letters: [String.fromCharCode(65 + Math.floor(Math.random() * 5))],
            p_value: Math.random() * 0.05,
            direction: (Math.random() > 0.5 ? 'higher' : 'lower') as 'higher' | 'lower',
          },
        } : {}),
        // Suppression on very small bases
        ...(sampleSize < 150 ? {
          suppressed: true,
          suppression_reason: 'low_base' as const,
        } : {}),
      }
    }),
  )

  const timeframeLabel = timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : timeframe === 'monthly' ? 'Monthly' : undefined

  return {
    rows,
    columns,
    cells,
    meta: {
      base_size: 45200,
      wave_name: timeframeLabel ? `${timeframeLabel} Trend` : 'Q4 2024',
      location_name: 'United States',
      effective_base: 43800,
      weighted_base: 45200,
    },
    stat_test_summary: {
      test_type: 'z_test',
      primary_confidence: 95,
    },
  }
}

export function generateIntersectionResult(audienceIds: string[]): IntersectionResult {
  const intersections: IntersectionResult['intersections'] = []

  // Generate all pairs
  for (let i = 0; i < audienceIds.length; i++) {
    for (let j = i + 1; j < audienceIds.length; j++) {
      intersections.push({
        audience_combination: [audienceIds[i], audienceIds[j]],
        metrics: {
          audience_percentage: Math.round(Math.random() * 30 + 5),
          audience_size: Math.round(Math.random() * 10000 + 1000),
          audience_index: Math.round(Math.random() * 100 + 50),
        } as Record<string, number>,
      })
    }
  }

  return { intersections }
}
