import type { Chart } from '../../types'
import { daysAgo } from '../helpers'

export const mockCharts: Chart[] = [
  {
    id: 'chart_social_usage', name: 'Social Media Platform Usage', description: 'Platform penetration across all markets',
    chart_type: 'bar', created_at: daysAgo(20), updated_at: daysAgo(3), user_id: 'user_sarah', project_id: 'proj_brand_q1', team_id: 'team_brand', is_shared: true,
    tags: ['social_media', 'quarterly'],
    folder_id: 'folder_social',
    sharing: { visibility: 'team', shared_with_teams: [{ team_id: 'team_research', permission: 'view' }] },
    config: {
      rows: [{ type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_legend: true, show_grid: true, sort_by: 'value', sort_order: 'desc' },
      annotations: [
        { id: 'ann_1', type: 'callout', content: 'YouTube leads with 88% penetration', anchor: { data_point_index: 5, position: 'top' }, style: { font_size: 12, color: '#1a73e8', arrow: true } },
      ],
    },
  },
  {
    id: 'chart_social_time_trend', name: 'Social Media Time - Quarterly Trend', description: 'Time spent on social media over quarters',
    chart_type: 'line', created_at: daysAgo(18), updated_at: daysAgo(5), user_id: 'user_sarah', project_id: 'proj_brand_q1', team_id: 'team_brand', is_shared: true,
    tags: ['social_media', 'trend'],
    config: {
      rows: [{ type: 'question', question_id: 'q_social_time', datapoint_ids: ['dp_time_2h', 'dp_time_3h', 'dp_time_3plus'] }],
      columns: [{ type: 'wave' }], metrics: ['audience_percentage'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }, { study_id: 'study_core', wave_id: 'wave_2024q3' }, { study_id: 'study_core', wave_id: 'wave_2024q2' }],
      location_ids: ['loc_us'], options: { show_legend: true, show_grid: true },
      statistical_overlays: {
        trend_line: { enabled: true, type: 'linear', show_equation: false, show_r_squared: true, color: '#999999' },
        confidence_interval: { enabled: true, level: 0.95, color: 'rgba(66,133,244,0.15)' },
      },
    },
  },
  {
    id: 'chart_device_pie', name: 'Device Ownership Distribution', description: 'Share of device types owned',
    chart_type: 'pie', created_at: daysAgo(15), updated_at: daysAgo(7), user_id: 'user_maria', project_id: 'proj_product_launch', team_id: 'team_product', is_shared: true,
    folder_id: 'folder_tech',
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
    tags: ['demographics'],
    sharing: { visibility: 'organization' },
    config: {
      rows: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] }],
      columns: [{ type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] }],
      metrics: ['audience_size'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_grid: true },
      statistical_overlays: {
        trend_line: { enabled: true, type: 'linear', show_r_squared: true },
        reference_lines: [
          { type: 'mean', label: 'Average Income', style: 'dashed', color: '#ff6b6b' },
        ],
      },
    },
  },
  {
    id: 'chart_purchase_stacked', name: 'Online Purchase Categories by Age', description: 'Stacked bar of purchase categories segmented by age',
    chart_type: 'stacked_bar', created_at: daysAgo(10), updated_at: daysAgo(2), user_id: 'user_sarah', is_shared: true,
    tags: ['ecommerce', 'demographics'],
    folder_id: 'folder_ecommerce',
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
    tags: ['brand_health', 'quarterly'],
    folder_id: 'folder_brand',
    sharing: { visibility: 'team', shared_with: [{ user_id: 'user_maria', permission: 'edit' }] },
    config: {
      rows: [{ type: 'question', question_id: 'q_brand_discovery', datapoint_ids: ['dp_social_ads', 'dp_influencer', 'dp_search', 'dp_word_of_mouth', 'dp_tv_ads'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, sort_by: 'value', sort_order: 'desc' },
      annotations: [
        { id: 'ann_2', type: 'text', content: 'Social ads overtook TV ads in Q3 2024', anchor: { data_point_index: 0, position: 'right' }, style: { font_size: 11, color: '#34a853' } },
        { id: 'ann_3', type: 'highlight_region', content: 'Digital channels', anchor: { x_value: 0, y_value: 56 }, style: { background: 'rgba(66,133,244,0.1)' } },
      ],
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
    tags: ['technology', 'AI'],
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

  // --- New chart types ---

  {
    id: 'chart_purchase_grouped', name: 'Purchase Categories - Grouped Comparison', description: 'Grouped bar comparing purchase categories by gender',
    chart_type: 'grouped_bar', created_at: daysAgo(4), updated_at: daysAgo(0), user_id: 'user_maria', is_shared: true,
    tags: ['ecommerce'],
    config: {
      rows: [{ type: 'question', question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_electronics', 'dp_food_delivery', 'dp_beauty', 'dp_home_garden'] }],
      columns: [{ type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female'] }],
      metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_legend: true, show_grid: true },
    },
  },
  {
    id: 'chart_social_horizontal', name: 'Social Platform Reach - Horizontal', description: 'Horizontal bar of social platform reach',
    chart_type: 'horizontal_bar', created_at: daysAgo(4), updated_at: daysAgo(1), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, sort_by: 'value', sort_order: 'desc', orientation: 'horizontal' },
    },
  },
  {
    id: 'chart_streaming_area', name: 'Streaming Adoption Over Time', description: 'Area chart showing streaming adoption growth',
    chart_type: 'area', created_at: daysAgo(3), updated_at: daysAgo(0), user_id: 'user_alex', is_shared: true,
    tags: ['media', 'trend'],
    config: {
      rows: [{ type: 'question', question_id: 'q_tv_platforms', datapoint_ids: ['dp_netflix', 'dp_disney', 'dp_prime', 'dp_hbo'] }],
      columns: [{ type: 'wave' }], metrics: ['audience_percentage'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }, { study_id: 'study_core', wave_id: 'wave_2024q3' }, { study_id: 'study_core', wave_id: 'wave_2024q2' }],
      location_ids: ['loc_us'],
      options: { show_legend: true, show_grid: true, enable_animation: true, animation_duration_ms: 800 },
    },
  },
  {
    id: 'chart_brand_combo', name: 'Brand Awareness vs Consideration', description: 'Combo chart with awareness bars and consideration line',
    chart_type: 'combo', created_at: daysAgo(3), updated_at: daysAgo(0), user_id: 'user_sophia', is_shared: true,
    tags: ['brand_health'],
    folder_id: 'folder_brand',
    config: {
      rows: [{ type: 'question', question_id: 'q_brand_discovery', datapoint_ids: ['dp_social_ads', 'dp_influencer', 'dp_search', 'dp_word_of_mouth', 'dp_tv_ads'] }],
      columns: [], metrics: ['audience_percentage', 'audience_index'],
      wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_legend: true, show_grid: true, secondary_axis_metrics: ['audience_index'], secondary_chart_type: 'line' },
    },
  },
  {
    id: 'chart_purchase_waterfall', name: 'Purchase Funnel Waterfall', description: 'Waterfall showing purchase funnel progression',
    chart_type: 'waterfall', created_at: daysAgo(2), updated_at: daysAgo(0), user_id: 'user_maria', is_shared: true,
    tags: ['ecommerce', 'funnel'],
    config: {
      rows: [{ type: 'question', question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_electronics', 'dp_food_delivery', 'dp_beauty', 'dp_home_garden'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_values_on_chart: true },
    },
  },
  {
    id: 'chart_brand_funnel', name: 'Brand Awareness Funnel', description: 'Funnel chart showing brand funnel stages',
    chart_type: 'funnel', created_at: daysAgo(2), updated_at: daysAgo(0), user_id: 'user_sophia', is_shared: true,
    tags: ['brand_health'],
    config: {
      rows: [{ type: 'question', question_id: 'q_brand_discovery', datapoint_ids: ['dp_social_ads', 'dp_influencer', 'dp_search', 'dp_word_of_mouth', 'dp_tv_ads'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_values_on_chart: true },
    },
  },
  {
    id: 'chart_fitness_radar', name: 'Fitness Activity Profile by Gender', description: 'Radar chart comparing fitness profiles',
    chart_type: 'radar', created_at: daysAgo(2), updated_at: daysAgo(0), user_id: 'user_alex', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_fitness', datapoint_ids: ['dp_gym', 'dp_running', 'dp_yoga', 'dp_swimming', 'dp_cycling'] }],
      columns: [{ type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female'] }],
      metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_legend: true },
    },
  },
  {
    id: 'chart_purchase_treemap', name: 'Purchase Category Market Size', description: 'Treemap of purchase categories by market size',
    chart_type: 'treemap', created_at: daysAgo(1), updated_at: daysAgo(0), user_id: 'user_sarah', is_shared: true,
    tags: ['ecommerce'],
    config: {
      rows: [{ type: 'question', question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_electronics', 'dp_food_delivery', 'dp_beauty', 'dp_home_garden'] }],
      columns: [], metrics: ['audience_size'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, color_by: 'value' },
    },
  },
  {
    id: 'chart_social_heatmap', name: 'Social Platform Usage by Age & Gender', description: 'Heatmap of platform usage across demographics',
    chart_type: 'heatmap', created_at: daysAgo(1), updated_at: daysAgo(0), user_id: 'user_emma', is_shared: true,
    tags: ['social_media', 'demographics'],
    folder_id: 'folder_social',
    config: {
      rows: [{ type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] }],
      metrics: ['audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: { show_labels: true, show_values_on_chart: true, tooltip_format: 'detailed' },
    },
  },
  {
    id: 'chart_ai_gauge', name: 'AI Adoption Gauge', description: 'Gauge showing overall AI tool adoption rate',
    chart_type: 'gauge', created_at: daysAgo(1), updated_at: daysAgo(0), user_id: 'user_sarah', is_shared: true,
    tags: ['technology', 'AI'],
    folder_id: 'folder_tech',
    config: {
      rows: [{ type: 'question', question_id: 'q_ai_usage', datapoint_ids: ['dp_ai_chatgpt'] }],
      columns: [], metrics: ['audience_percentage'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      options: {
        gauge_min: 0, gauge_max: 100,
        gauge_thresholds: [
          { value: 25, color: '#ea4335', label: 'Low' },
          { value: 50, color: '#fbbc04', label: 'Medium' },
          { value: 75, color: '#34a853', label: 'High' },
          { value: 100, color: '#1a73e8', label: 'Very High' },
        ],
      },
    },
  },
]
