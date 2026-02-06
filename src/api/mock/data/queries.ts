import type { StatsQueryResponse, CrosstabQueryResult, IntersectionResult } from '../../types'

export function generateStatsResponse(questionIds: string[]): StatsQueryResponse {
  const results = questionIds.map((qid) => ({
    question_id: qid,
    question_name: qid.replace('q_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    datapoints: generateDatapoints(qid),
  }))

  return {
    results,
    meta: {
      base_size: 45200,
      wave_name: 'Q4 2024',
      location_name: 'United States',
      execution_time_ms: Math.floor(Math.random() * 200) + 50,
    },
  }
}

function generateDatapoints(questionId: string) {
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

  return dps.map((dp) => {
    const pct = Math.round(Math.random() * 60 + 10)
    const size = Math.round(pct * 452)
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
    }
  })
}

export function generateCrosstabResult(rowCount: number, colCount: number): CrosstabQueryResult {
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    id: `row_${i}`,
    label: `Row ${i + 1}`,
  }))

  const columns = Array.from({ length: colCount }, (_, i) => ({
    id: `col_${i}`,
    label: `Column ${i + 1}`,
  }))

  const cells = rows.map(() =>
    columns.map(() => ({
      values: {
        audience_percentage: Math.round(Math.random() * 60 + 5),
        audience_index: Math.round(Math.random() * 100 + 50),
        audience_size: Math.round(Math.random() * 5000 + 500),
      } as Record<string, number>,
      significant: Math.random() > 0.7,
      sample_size: Math.round(Math.random() * 800 + 100),
    })),
  )

  return {
    rows,
    columns,
    cells,
    meta: {
      base_size: 45200,
      wave_name: 'Q4 2024',
      location_name: 'United States',
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
