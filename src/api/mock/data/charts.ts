import type { Chart } from '../../types'
import { daysAgo } from '../helpers'

export const mockCharts: Chart[] = [
  {
    id: 'chart_social_usage', name: 'Social Media Platform Usage', description: 'Platform penetration across all markets',
    chart_type: 'bar', created_at: daysAgo(20), updated_at: daysAgo(3), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_legend: true, show_grid: true, sort_by: 'value', sort_order: 'desc' },
    },
  },
  {
    id: 'chart_social_time_trend', name: 'Social Media Time - Quarterly Trend', description: 'Time spent on social media over quarters',
    chart_type: 'line', created_at: daysAgo(18), updated_at: daysAgo(5), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_social_time', datapoint_ids: ['dp_time_2h', 'dp_time_3h', 'dp_time_3plus'] }],
      columns: [{ type: 'wave' }], metrics: ['audience_percentage'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }, { study_id: 'study_core', wave_id: 'wave_2024q3' }, { study_id: 'study_core', wave_id: 'wave_2024q2' }],
      location_ids: ['loc_us'], options: { show_legend: true, show_grid: true },
    },
  },
  {
    id: 'chart_device_pie', name: 'Device Ownership Distribution', description: 'Share of device types owned',
    chart_type: 'pie', created_at: daysAgo(15), updated_at: daysAgo(7), user_id: 'user_maria', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_device_ownership', datapoint_ids: ['dp_smartphone', 'dp_laptop', 'dp_tablet', 'dp_smartwatch', 'dp_desktop', 'dp_smart_speaker'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      options: { show_labels: true, show_legend: true },
    },
  },
  {
    id: 'chart_streaming_donut', name: 'Streaming Service Market Share', description: 'Breakdown of streaming platform usage',
    chart_type: 'donut', created_at: daysAgo(14), updated_at: daysAgo(6), user_id: 'user_sarah', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_tv_platforms', datapoint_ids: ['dp_netflix', 'dp_disney', 'dp_prime', 'dp_hbo', 'dp_hulu', 'dp_apple_tv'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_legend: true },
    },
  },
  {
    id: 'chart_age_income_scatter', name: 'Age vs Income Distribution', description: 'Scatter plot of age groups against income levels',
    chart_type: 'scatter', created_at: daysAgo(12), updated_at: daysAgo(4), user_id: 'user_alex', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] }],
      columns: [{ type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] }],
      metrics: ['audience_size'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_grid: true },
    },
  },
  {
    id: 'chart_purchase_stacked', name: 'Online Purchase Categories by Age', description: 'Stacked bar of purchase categories segmented by age',
    chart_type: 'stacked_bar', created_at: daysAgo(10), updated_at: daysAgo(2), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_electronics', 'dp_food_delivery', 'dp_beauty', 'dp_home_garden'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44'] }],
      metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_legend: true, show_grid: true },
    },
  },
  {
    id: 'chart_fitness_table', name: 'Fitness Activities Data Table', description: 'Detailed data table of fitness activity participation',
    chart_type: 'table', created_at: daysAgo(8), updated_at: daysAgo(1), user_id: 'user_emma', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_fitness', datapoint_ids: ['dp_gym', 'dp_running', 'dp_yoga', 'dp_swimming', 'dp_cycling'] }],
      columns: [{ type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female'] }],
      metrics: ['audience_percentage', 'audience_index', 'audience_size'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      options: { show_grid: true },
    },
  },
  {
    id: 'chart_brand_discovery', name: 'Brand Discovery Channels', description: 'How consumers discover new brands',
    chart_type: 'bar', created_at: daysAgo(7), updated_at: daysAgo(2), user_id: 'user_sophia', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_brand_discovery', datapoint_ids: ['dp_social_ads', 'dp_influencer', 'dp_search', 'dp_word_of_mouth', 'dp_tv_ads'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, sort_by: 'value', sort_order: 'desc' },
    },
  },
  {
    id: 'chart_env_concern', name: 'Environmental Concern by Age', description: 'Environmental concern levels across age groups',
    chart_type: 'stacked_bar', created_at: daysAgo(6), updated_at: daysAgo(1), user_id: 'user_maria', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_env_concern', datapoint_ids: ['dp_env_1', 'dp_env_2', 'dp_env_3', 'dp_env_4', 'dp_env_5'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54'] }],
      metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk', 'loc_de'],
      options: { show_legend: true, show_grid: true },
    },
  },
  {
    id: 'chart_gaming_platforms', name: 'Gaming Platform Popularity', description: 'Gaming platform usage rates',
    chart_type: 'bar', created_at: daysAgo(5), updated_at: daysAgo(0), user_id: 'user_james', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_gaming', datapoint_ids: ['dp_mobile_gaming', 'dp_pc_gaming', 'dp_console_ps', 'dp_console_xbox', 'dp_console_switch'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk', 'loc_jp'],
      options: { show_labels: true, show_legend: true, sort_by: 'value', sort_order: 'desc' },
    },
  },
  {
    id: 'chart_ai_adoption', name: 'AI Tool Adoption Rates', description: 'Usage of AI tools across demographics',
    chart_type: 'bar', created_at: daysAgo(3), updated_at: daysAgo(0), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_ai_usage', datapoint_ids: ['dp_ai_chatgpt', 'dp_ai_copilot', 'dp_ai_gemini', 'dp_ai_midjourney', 'dp_ai_claude'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, sort_by: 'value', sort_order: 'desc' },
    },
  },
  {
    id: 'chart_news_sources', name: 'News Consumption by Source', description: 'Where people get their news',
    chart_type: 'pie', created_at: daysAgo(2), updated_at: daysAgo(0), user_id: 'user_emma', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_news_sources', datapoint_ids: ['dp_news_social', 'dp_news_tv', 'dp_news_online', 'dp_news_podcast', 'dp_news_print'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      options: { show_labels: true, show_legend: true },
    },
  },
]
