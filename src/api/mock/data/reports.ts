import type { Report } from '../../types'
import { daysAgo } from '../helpers'

export const mockReports: Report[] = [
  { id: 'rpt_social_trends', name: 'Social Media Trends 2024', type: 'PDF', size: '4.2 MB', category: 'research', tags: ['social media', 'trends', '2024'], download_url: '#', created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'rpt_gen_z', name: 'Gen Z Consumer Behavior', type: 'PDF', size: '8.1 MB', category: 'research', tags: ['gen z', 'consumer', 'demographics'], download_url: '#', created_at: daysAgo(12), updated_at: daysAgo(10) },
  { id: 'rpt_q4_exec', name: 'Q4 2024 Executive Summary', type: 'PPTX', size: '12.5 MB', category: 'industry', tags: ['quarterly', 'executive', 'summary'], download_url: '#', created_at: daysAgo(8), updated_at: daysAgo(8) },
  { id: 'rpt_ecommerce', name: 'E-Commerce Landscape Report', type: 'PDF', size: '6.3 MB', category: 'industry', tags: ['ecommerce', 'retail', 'online shopping'], download_url: '#', created_at: daysAgo(20), updated_at: daysAgo(18) },
  { id: 'rpt_media_mix', name: 'Media Consumption Mix Analysis', type: 'XLSX', size: '3.8 MB', category: 'custom', tags: ['media', 'consumption', 'analysis'], download_url: '#', created_at: daysAgo(15), updated_at: daysAgo(15) },
  { id: 'rpt_brand_health', name: 'Brand Health Tracker Export', type: 'CSV', size: '1.2 MB', category: 'custom', tags: ['brand', 'health', 'tracker'], download_url: '#', created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'rpt_ai_adoption', name: 'AI Adoption & Attitudes', type: 'PDF', size: '5.7 MB', category: 'research', tags: ['AI', 'technology', 'adoption'], download_url: '#', created_at: daysAgo(7), updated_at: daysAgo(7) },
  { id: 'rpt_gaming', name: 'Global Gaming Market Overview', type: 'PPTX', size: '15.2 MB', category: 'industry', tags: ['gaming', 'esports', 'market'], download_url: '#', created_at: daysAgo(25), updated_at: daysAgo(22) },
  { id: 'rpt_sustainability', name: 'Sustainability Consumer Index', type: 'XLSX', size: '2.9 MB', category: 'research', tags: ['sustainability', 'environment', 'consumer'], download_url: '#', created_at: daysAgo(14), updated_at: daysAgo(14) },
  { id: 'rpt_audience_export', name: 'Custom Audience Data Export', type: 'CSV', size: '0.8 MB', category: 'custom', tags: ['audience', 'export', 'data'], download_url: '#', created_at: daysAgo(1), updated_at: daysAgo(1) },
]
