import type { Crosstab } from '../../types'
import { daysAgo } from '../helpers'

export const mockCrosstabs: Crosstab[] = [
  {
    id: 'xt_social_by_age', name: 'Social Media Usage by Age Group', description: 'Platform usage cross-tabulated with age demographics',
    created_at: daysAgo(20), updated_at: daysAgo(3), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'heatmap' },
    },
  },
  {
    id: 'xt_streaming_income', name: 'Streaming Services by Income', description: 'Streaming platform preference by household income',
    created_at: daysAgo(15), updated_at: daysAgo(5), user_id: 'user_maria', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_tv_platforms', datapoint_ids: ['dp_netflix', 'dp_disney', 'dp_prime', 'dp_hbo', 'dp_hulu', 'dp_apple_tv'] }],
      columns: [{ type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'above_average', threshold: 110 },
    },
  },
  {
    id: 'xt_purchase_gender', name: 'Online Purchases by Gender', description: 'E-commerce purchase categories split by gender',
    created_at: daysAgo(12), updated_at: daysAgo(4), user_id: 'user_sarah', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_electronics', 'dp_food_delivery', 'dp_beauty', 'dp_home_garden'] }],
      columns: [{ type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female', 'dp_gender_nonbinary'] }],
      metrics: ['audience_percentage', 'audience_size', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      highlight: { type: 'significance' },
    },
  },
  {
    id: 'xt_fitness_age', name: 'Fitness Activities by Age', description: 'Physical activity participation across age groups',
    created_at: daysAgo(10), updated_at: daysAgo(2), user_id: 'user_alex', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_fitness', datapoint_ids: ['dp_gym', 'dp_running', 'dp_yoga', 'dp_swimming', 'dp_cycling'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'heatmap' },
    },
  },
  {
    id: 'xt_brand_by_audience', name: 'Brand Discovery by Audience', description: 'How different audience segments discover brands',
    created_at: daysAgo(7), updated_at: daysAgo(1), user_id: 'user_sophia', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_brand_discovery', datapoint_ids: ['dp_social_ads', 'dp_influencer', 'dp_search', 'dp_word_of_mouth', 'dp_tv_ads'] }],
      columns: [{ type: 'audience', audience_id: 'aud_gen_z_social' }, { type: 'audience', audience_id: 'aud_tech_savvy' }, { type: 'audience', audience_id: 'aud_eco_shoppers' }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'above_average', threshold: 120 },
    },
  },
  {
    id: 'xt_news_education', name: 'News Sources by Education', description: 'News consumption patterns by education level',
    created_at: daysAgo(5), updated_at: daysAgo(0), user_id: 'user_emma', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_news_sources', datapoint_ids: ['dp_news_social', 'dp_news_tv', 'dp_news_online', 'dp_news_podcast', 'dp_news_print'] }],
      columns: [{ type: 'question', question_id: 'q_education', datapoint_ids: ['dp_edu_hs', 'dp_edu_bachelor', 'dp_edu_master', 'dp_edu_phd'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      highlight: { type: 'heatmap' },
    },
  },
]
