import type { Dashboard } from '../../types'
import { daysAgo } from '../helpers'

export const mockDashboards: Dashboard[] = [
  {
    id: 'dash_social_overview', name: 'Social Media Overview', description: 'Key social media metrics and trends across platforms',
    created_at: daysAgo(30), updated_at: daysAgo(2), user_id: 'user_sarah', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w1', type: 'chart', title: 'Platform Usage', chart_id: 'chart_social_usage', chart_type: 'bar', position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: 'w2', type: 'chart', title: 'Time Trend', chart_id: 'chart_social_time_trend', chart_type: 'line', position: { x: 6, y: 0, w: 6, h: 4 } },
      { id: 'w3', type: 'stat', title: 'Active Social Users', text_content: '78%', position: { x: 0, y: 4, w: 3, h: 2 } },
      { id: 'w4', type: 'stat', title: 'Avg Daily Time', text_content: '2.4 hrs', position: { x: 3, y: 4, w: 3, h: 2 } },
      { id: 'w5', type: 'text', title: 'Notes', text_content: 'Social media usage continues to grow, with TikTok showing the strongest quarter-over-quarter increase among 16-24 year olds.', position: { x: 6, y: 4, w: 6, h: 2 } },
    ],
  },
  {
    id: 'dash_consumer_tech', name: 'Consumer Technology', description: 'Device ownership, tech adoption, and AI usage trends',
    created_at: daysAgo(25), updated_at: daysAgo(5), user_id: 'user_sarah', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w6', type: 'chart', title: 'Device Ownership', chart_id: 'chart_device_pie', chart_type: 'pie', position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: 'w7', type: 'chart', title: 'AI Tool Adoption', chart_id: 'chart_ai_adoption', chart_type: 'bar', position: { x: 6, y: 0, w: 6, h: 4 } },
      { id: 'w8', type: 'chart', title: 'Gaming Platforms', chart_id: 'chart_gaming_platforms', chart_type: 'bar', position: { x: 0, y: 4, w: 6, h: 4 } },
      { id: 'w9', type: 'stat', title: 'Smartphone Penetration', text_content: '94%', position: { x: 6, y: 4, w: 3, h: 2 } },
      { id: 'w10', type: 'stat', title: 'AI Tool Users', text_content: '42%', position: { x: 9, y: 4, w: 3, h: 2 } },
    ],
  },
  {
    id: 'dash_ecommerce', name: 'E-Commerce Insights', description: 'Online shopping behavior, purchase categories, and payment preferences',
    created_at: daysAgo(20), updated_at: daysAgo(4), user_id: 'user_maria', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w11', type: 'chart', title: 'Purchase Categories by Age', chart_id: 'chart_purchase_stacked', chart_type: 'stacked_bar', position: { x: 0, y: 0, w: 8, h: 4 } },
      { id: 'w12', type: 'stat', title: 'Online Shoppers', text_content: '71%', position: { x: 8, y: 0, w: 4, h: 2 } },
      { id: 'w13', type: 'stat', title: 'Avg Order Value', text_content: '$87', position: { x: 8, y: 2, w: 4, h: 2 } },
      { id: 'w14', type: 'text', title: 'Key Insight', text_content: 'Clothing and electronics remain the top online purchase categories, with Gen Z leading in food delivery.', position: { x: 0, y: 4, w: 12, h: 2 } },
    ],
  },
  {
    id: 'dash_media_mix', name: 'Media Consumption Mix', description: 'Cross-platform media consumption analysis',
    created_at: daysAgo(18), updated_at: daysAgo(3), user_id: 'user_sarah', is_shared: false,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w15', type: 'chart', title: 'Streaming Services', chart_id: 'chart_streaming_donut', chart_type: 'donut', position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: 'w16', type: 'chart', title: 'News Sources', chart_id: 'chart_news_sources', chart_type: 'pie', position: { x: 6, y: 0, w: 6, h: 4 } },
      { id: 'w17', type: 'stat', title: 'Multi-Screen Users', text_content: '63%', position: { x: 0, y: 4, w: 4, h: 2 } },
      { id: 'w18', type: 'stat', title: 'Podcast Listeners', text_content: '38%', position: { x: 4, y: 4, w: 4, h: 2 } },
      { id: 'w19', type: 'stat', title: 'Cord Cutters', text_content: '45%', position: { x: 8, y: 4, w: 4, h: 2 } },
    ],
  },
  {
    id: 'dash_brand', name: 'Brand Engagement Dashboard', description: 'Brand awareness, discovery, and loyalty metrics',
    created_at: daysAgo(15), updated_at: daysAgo(6), user_id: 'user_sophia', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w20', type: 'chart', title: 'Brand Discovery', chart_id: 'chart_brand_discovery', chart_type: 'bar', position: { x: 0, y: 0, w: 8, h: 4 } },
      { id: 'w21', type: 'stat', title: 'Social Ads Reach', text_content: '56%', position: { x: 8, y: 0, w: 4, h: 2 } },
      { id: 'w22', type: 'stat', title: 'Influencer Impact', text_content: '34%', position: { x: 8, y: 2, w: 4, h: 2 } },
    ],
  },
  {
    id: 'dash_demographics', name: 'Demographic Deep Dive', description: 'Detailed demographic analysis with cross-tabulations',
    created_at: daysAgo(12), updated_at: daysAgo(8), user_id: 'user_alex', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w23', type: 'chart', title: 'Age vs Income', chart_id: 'chart_age_income_scatter', chart_type: 'scatter', position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: 'w24', type: 'chart', title: 'Fitness by Gender', chart_id: 'chart_fitness_table', chart_type: 'table', position: { x: 6, y: 0, w: 6, h: 4 } },
      { id: 'w25', type: 'stat', title: 'Sample Size', text_content: '45,200', position: { x: 0, y: 4, w: 4, h: 2 } },
      { id: 'w26', type: 'stat', title: 'Markets Covered', text_content: '20', position: { x: 4, y: 4, w: 4, h: 2 } },
      { id: 'w27', type: 'stat', title: 'Questions', text_content: '30+', position: { x: 8, y: 4, w: 4, h: 2 } },
    ],
  },
  {
    id: 'dash_sustainability', name: 'Sustainability & Attitudes', description: 'Environmental and social attitudes across demographics',
    created_at: daysAgo(8), updated_at: daysAgo(1), user_id: 'user_maria', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w28', type: 'chart', title: 'Environmental Concern by Age', chart_id: 'chart_env_concern', chart_type: 'stacked_bar', position: { x: 0, y: 0, w: 8, h: 4 } },
      { id: 'w29', type: 'stat', title: 'Very/Extremely Concerned', text_content: '47%', position: { x: 8, y: 0, w: 4, h: 2 } },
      { id: 'w30', type: 'stat', title: 'Eco Shoppers', text_content: '31%', position: { x: 8, y: 2, w: 4, h: 2 } },
    ],
  },
  {
    id: 'dash_executive', name: 'Q4 Executive Summary', description: 'High-level overview for leadership team',
    created_at: daysAgo(5), updated_at: daysAgo(0), user_id: 'user_sarah', is_shared: true,
    layout: { columns: 12, row_height: 80 },
    widgets: [
      { id: 'w31', type: 'stat', title: 'Total Respondents', text_content: '45,200', position: { x: 0, y: 0, w: 3, h: 2 } },
      { id: 'w32', type: 'stat', title: 'Markets', text_content: '20', position: { x: 3, y: 0, w: 3, h: 2 } },
      { id: 'w33', type: 'stat', title: 'Questions', text_content: '30', position: { x: 6, y: 0, w: 3, h: 2 } },
      { id: 'w34', type: 'stat', title: 'Audiences Built', text_content: '10', position: { x: 9, y: 0, w: 3, h: 2 } },
      { id: 'w35', type: 'chart', title: 'Social Platform Usage', chart_id: 'chart_social_usage', chart_type: 'bar', position: { x: 0, y: 2, w: 6, h: 4 } },
      { id: 'w36', type: 'chart', title: 'Streaming Market Share', chart_id: 'chart_streaming_donut', chart_type: 'donut', position: { x: 6, y: 2, w: 6, h: 4 } },
    ],
  },
]
