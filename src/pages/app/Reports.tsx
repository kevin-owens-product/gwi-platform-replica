import { useState, useMemo } from 'react';
import {
  FileText, Download, ExternalLink, Loader2, Plus, Share2, Copy, Grid,
  List, SlidersHorizontal, ChevronDown, ChevronUp, GripVertical, Trash2,
  Eye, Sparkles, Save, Send, Play, Image, BarChart3, Table2,
  Type, BookOpen, FileSearch, Layers, Minus, Layout, Clock,
  Users, Calendar, Mail, ToggleLeft, ToggleRight, Star, Presentation,
  FileSpreadsheet, Film, FileType2, Palette, Settings2, X,
  ArrowUpDown, MessageSquare, Megaphone, Target, TrendingUp,
  Heart, Award, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { SearchInput, Tabs, Pagination, EmptyState, Badge } from '@/components/shared';
import IntegrationDestinationPicker from '@/components/integrations/IntegrationDestinationPicker';
import { useReports } from '@/hooks/useReports';
import { useIntegrationConnections } from '@/hooks/useIntegrations';
import { useWorkspaceStore } from '@/stores/workspace';
import { formatDate, formatRelativeDate } from '@/utils/format';
import type {
  Report, ReportBuilder, ReportSection, ReportSectionType, BrandConfig,
  DataStory, DataStorySlide, DataStorySlideType, ReportTemplate, ReportSchedule,
  ExportFormat,
} from '@/api/types';
import './Reports.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const REPORTS_PER_PAGE = 6;

const mainTabItems = [
  { id: 'all-reports', label: 'All Reports' },
  { id: 'report-builder', label: 'Report Builder' },
  { id: 'data-stories', label: 'Data Stories' },
  { id: 'templates', label: 'Templates' },
  { id: 'scheduled', label: 'Scheduled' },
];

const categoryTabItems = [
  { id: 'all', label: 'All' },
  { id: 'industry', label: 'Industry' },
  { id: 'research', label: 'Research' },
  { id: 'custom', label: 'Custom' },
];

const FORMAT_OPTIONS: ExportFormat[] = ['pdf', 'xlsx', 'csv', 'pptx', 'docx'];
const AUTHOR_OPTIONS = ['Sarah Chen', 'James Miller', 'Priya Patel', 'Marcus Johnson', 'Emily Watson'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'view_count', label: 'Most Viewed' },
];

// ─── Section Type Metadata ───────────────────────────────────────────────────

const SECTION_TYPE_META: Record<ReportSectionType, { label: string; icon: React.ReactNode; color: string }> = {
  cover: { label: 'Cover Page', icon: <Layout size={16} />, color: 'var(--color-primary)' },
  executive_summary: { label: 'Executive Summary', icon: <BookOpen size={16} />, color: '#8b5cf6' },
  chart: { label: 'Chart', icon: <BarChart3 size={16} />, color: '#059669' },
  table: { label: 'Table', icon: <Table2 size={16} />, color: '#d97706' },
  crosstab: { label: 'Crosstab', icon: <Grid size={16} />, color: '#dc2626' },
  narrative: { label: 'Narrative', icon: <Type size={16} />, color: '#2563eb' },
  key_findings: { label: 'Key Findings', icon: <Star size={16} />, color: '#f59e0b' },
  methodology: { label: 'Methodology', icon: <FileSearch size={16} />, color: '#6b7280' },
  appendix: { label: 'Appendix', icon: <Layers size={16} />, color: '#64748b' },
  divider: { label: 'Divider', icon: <Minus size={16} />, color: '#94a3b8' },
  image: { label: 'Image', icon: <Image size={16} />, color: '#ec4899' },
  two_column: { label: 'Two Column', icon: <Layout size={16} />, color: '#14b8a6' },
};

const SLIDE_TYPE_META: Record<DataStorySlideType, { label: string; icon: React.ReactNode; color: string }> = {
  title: { label: 'Title Slide', icon: <Type size={16} />, color: 'var(--color-primary)' },
  insight: { label: 'Insight', icon: <Sparkles size={16} />, color: '#8b5cf6' },
  chart: { label: 'Chart', icon: <BarChart3 size={16} />, color: '#059669' },
  comparison: { label: 'Comparison', icon: <ArrowUpDown size={16} />, color: '#d97706' },
  callout: { label: 'Callout', icon: <AlertCircle size={16} />, color: '#dc2626' },
  conclusion: { label: 'Conclusion', icon: <Award size={16} />, color: '#2563eb' },
  data_table: { label: 'Data Table', icon: <Table2 size={16} />, color: '#64748b' },
  quote: { label: 'Quote', icon: <MessageSquare size={16} />, color: '#ec4899' },
};

const TEMPLATE_CATEGORY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  executive_summary: { label: 'Executive Summary', icon: <BookOpen size={16} /> },
  deep_dive: { label: 'Deep Dive', icon: <FileSearch size={16} /> },
  competitive: { label: 'Competitive', icon: <Target size={16} /> },
  media_plan: { label: 'Media Plan', icon: <Megaphone size={16} /> },
  audience_profile: { label: 'Audience Profile', icon: <Users size={16} /> },
  brand_health: { label: 'Brand Health', icon: <Heart size={16} /> },
  custom: { label: 'Custom', icon: <Settings2 size={16} /> },
};

// ─── Format Icon Helper ─────────────────────────────────────────────────────

function FormatIcon({ format, size = 16 }: { format: string; size?: number }) {
  const f = format.toLowerCase();
  if (f === 'pdf') return <FileText size={size} />;
  if (f === 'xlsx' || f === 'csv') return <FileSpreadsheet size={size} />;
  if (f === 'pptx') return <Presentation size={size} />;
  if (f === 'docx') return <FileType2 size={size} />;
  return <FileText size={size} />;
}

// ─── Mock Data: All Reports (enhanced) ───────────────────────────────────────

const fallbackReports: Report[] = [
  { id: '1', name: 'Q4 2024 Consumer Trends Report', type: 'pdf', size: '2.4 MB', category: 'research', tags: ['Consumer Trends', 'Global'], download_url: '', created_at: '2025-01-15', updated_at: '2025-01-15', author: 'Sarah Chen', view_count: 342, last_viewed_at: '2025-01-28' },
  { id: '2', name: 'Social Media Landscape 2024', type: 'pptx', size: '3.1 MB', category: 'industry', tags: ['Social Media', 'Digital'], download_url: '', created_at: '2025-01-08', updated_at: '2025-01-08', author: 'James Miller', view_count: 218, last_viewed_at: '2025-01-25' },
  { id: '3', name: 'Gen Z Purchase Behavior Analysis', type: 'pdf', size: '1.8 MB', category: 'research', tags: ['Gen Z', 'Purchase'], download_url: '', created_at: '2025-01-02', updated_at: '2025-01-02', author: 'Priya Patel', view_count: 156, last_viewed_at: '2025-01-20' },
  { id: '4', name: 'Global Brand Perception Study', type: 'xlsx', size: '4.2 MB', category: 'industry', tags: ['Brand', 'Global'], download_url: '', created_at: '2024-12-18', updated_at: '2024-12-18', author: 'Marcus Johnson', view_count: 89, last_viewed_at: '2025-01-18' },
  { id: '5', name: 'US Digital Advertising Report', type: 'pdf', size: '2.8 MB', category: 'industry', tags: ['Advertising', 'USA'], download_url: '', created_at: '2024-12-10', updated_at: '2024-12-10', author: 'Emily Watson', view_count: 412, last_viewed_at: '2025-01-27' },
  { id: '6', name: 'Sustainability Consumer Index', type: 'csv', size: '1.5 MB', category: 'research', tags: ['Sustainability', 'Attitudes'], download_url: '', created_at: '2024-11-28', updated_at: '2024-11-28', author: 'Sarah Chen', view_count: 67, last_viewed_at: '2025-01-10' },
  { id: '7', name: 'Media Consumption Q3 Summary', type: 'docx', size: '3.4 MB', category: 'custom', tags: ['Media', 'Quarterly'], download_url: '', created_at: '2024-11-15', updated_at: '2024-11-15', author: 'James Miller', view_count: 134, last_viewed_at: '2025-01-22' },
  { id: '8', name: 'E-commerce Growth Forecast 2025', type: 'pptx', size: '2.1 MB', category: 'industry', tags: ['E-commerce', 'Forecast'], download_url: '', created_at: '2024-11-05', updated_at: '2024-11-05', author: 'Priya Patel', view_count: 278, last_viewed_at: '2025-01-26' },
  { id: '9', name: 'Health & Wellness Trend Report', type: 'pdf', size: '2.9 MB', category: 'research', tags: ['Health', 'Wellness'], download_url: '', created_at: '2024-10-20', updated_at: '2024-10-20', author: 'Marcus Johnson', view_count: 195, last_viewed_at: '2025-01-15' },
  { id: '10', name: 'Custom Competitive Analysis', type: 'xlsx', size: '1.2 MB', category: 'custom', tags: ['Competitive', 'Custom'], download_url: '', created_at: '2024-10-10', updated_at: '2024-10-10', author: 'Emily Watson', view_count: 51, last_viewed_at: '2024-12-30' },
];

// ─── Mock Data: Report Builders ──────────────────────────────────────────────

const mockReportBuilders: ReportBuilder[] = [
  {
    id: 'rb-1', name: 'Q1 2025 Brand Health Report', description: 'Quarterly brand health tracking report with key metrics and competitive analysis', format: 'PDF',
    brand_config: { primary_color: '#1e40af', secondary_color: '#3b82f6', font_family: 'Inter', footer_text: 'Confidential - GWI 2025' },
    sections: [
      { id: 's1', type: 'cover', title: 'Q1 2025 Brand Health', order: 0, text_content: 'Prepared by GWI Research Team' },
      { id: 's2', type: 'executive_summary', title: 'Executive Summary', order: 1, text_content: 'Key findings from Q1 brand tracking study...', ai_generated: true },
      { id: 's3', type: 'chart', title: 'Brand Awareness Trends', order: 2, chart_id: 'chart-001' },
      { id: 's4', type: 'key_findings', title: 'Top 5 Findings', order: 3, text_content: '1. Brand awareness increased 12%...' },
      { id: 's5', type: 'methodology', title: 'Methodology', order: 4, text_content: 'n=5,000 respondents across 15 markets' },
    ],
    status: 'draft', created_at: '2025-01-20', updated_at: '2025-01-28', author: 'Sarah Chen',
  },
  {
    id: 'rb-2', name: 'Audience Deep Dive: Millennials', description: 'Comprehensive audience profile for millennial consumers', format: 'PPTX',
    brand_config: { primary_color: '#7c3aed', secondary_color: '#a78bfa', font_family: 'Inter', footer_text: 'GWI Audience Insights' },
    sections: [
      { id: 's6', type: 'cover', title: 'Millennial Audience Deep Dive', order: 0 },
      { id: 's7', type: 'narrative', title: 'Who Are Millennials?', order: 1, text_content: 'Demographics and defining characteristics...', ai_generated: true },
      { id: 's8', type: 'chart', title: 'Media Consumption', order: 2 },
      { id: 's9', type: 'crosstab', title: 'Brand Preferences by Region', order: 3 },
      { id: 's10', type: 'table', title: 'Key Metrics Summary', order: 4 },
      { id: 's11', type: 'appendix', title: 'Data Sources', order: 5 },
    ],
    status: 'published', created_at: '2025-01-10', updated_at: '2025-01-25', author: 'Priya Patel',
  },
  {
    id: 'rb-3', name: 'Competitive Landscape Analysis', description: 'Market positioning and competitor benchmarking', format: 'DOCX',
    brand_config: { primary_color: '#059669', secondary_color: '#34d399', font_family: 'Inter', footer_text: 'Strictly Confidential' },
    sections: [
      { id: 's12', type: 'cover', title: 'Competitive Landscape 2025', order: 0 },
      { id: 's13', type: 'executive_summary', title: 'Overview', order: 1, text_content: 'Market share analysis reveals...', ai_generated: false },
      { id: 's14', type: 'chart', title: 'Market Share by Segment', order: 2 },
      { id: 's15', type: 'chart', title: 'Brand Perception Comparison', order: 3 },
    ],
    status: 'draft', created_at: '2025-01-05', updated_at: '2025-01-22', author: 'James Miller',
  },
];

// ─── Mock Data: Data Stories ─────────────────────────────────────────────────

const mockDataStories: DataStory[] = [
  {
    id: 'ds-1', title: 'The Rise of Conscious Consumerism', description: 'How sustainability is reshaping purchase decisions globally',
    author: 'Sarah Chen', created_at: '2025-01-22', updated_at: '2025-01-27', status: 'published', view_count: 523,
    slides: [
      { id: 'sl1', order: 0, type: 'title', title: 'The Rise of Conscious Consumerism', narrative: 'A data-driven exploration of how sustainability concerns are transforming consumer behavior worldwide.' },
      { id: 'sl2', order: 1, type: 'insight', title: '73% Say Sustainability Matters', narrative: 'Nearly three-quarters of global consumers say environmental sustainability influences their purchase decisions.', transition_text: 'But the story goes deeper...' },
      { id: 'sl3', order: 2, type: 'chart', title: 'Sustainability Concern by Generation', narrative: 'Gen Z leads the charge, but the gap is closing fast across all age groups.', chart_id: 'chart-sus-01' },
      { id: 'sl4', order: 3, type: 'comparison', title: 'Willingness to Pay More', narrative: 'Consumers in emerging markets are 2.3x more likely to pay a premium for sustainable products.', transition_text: 'What does this mean for brands?' },
      { id: 'sl5', order: 4, type: 'callout', title: 'The Authenticity Gap', narrative: '62% of consumers believe most brands\' sustainability claims are just marketing. Transparency is the new currency of trust.' },
      { id: 'sl6', order: 5, type: 'conclusion', title: 'Key Takeaways', narrative: 'Brands that embed sustainability authentically into their value proposition will capture the growing conscious consumer segment.' },
    ],
    tags: ['Sustainability', 'Consumer Behavior', 'Global'],
  },
  {
    id: 'ds-2', title: 'Gen Z: The Digital Native Consumer', description: 'Understanding the next generation of brand loyalists',
    author: 'Priya Patel', created_at: '2025-01-18', updated_at: '2025-01-24', status: 'published', view_count: 891,
    slides: [
      { id: 'sl7', order: 0, type: 'title', title: 'Gen Z: The Digital Native Consumer', narrative: 'What makes Gen Z tick, and what brands need to know.' },
      { id: 'sl8', order: 1, type: 'insight', title: 'Social Commerce is Their Mall', narrative: '48% of Gen Z discovered their last purchase through social media.' },
      { id: 'sl9', order: 2, type: 'chart', title: 'Platform Preference', narrative: 'TikTok has overtaken Instagram for product discovery among 18-24s.' },
      { id: 'sl10', order: 3, type: 'conclusion', title: 'The Opportunity', narrative: 'Meet them where they are: short-form, authentic, creator-driven content.' },
    ],
    tags: ['Gen Z', 'Social Media', 'Digital'],
  },
  {
    id: 'ds-3', title: 'The Future of Connected TV', description: 'How streaming is fragmenting the media landscape',
    author: 'James Miller', created_at: '2025-01-12', updated_at: '2025-01-20', status: 'draft', view_count: 156,
    slides: [
      { id: 'sl11', order: 0, type: 'title', title: 'The Future of Connected TV', narrative: 'Streaming wars, ad-supported tiers, and what it means for advertisers.' },
      { id: 'sl12', order: 1, type: 'insight', title: 'Ad-Tier Adoption Surges', narrative: '38% of streamers now use an ad-supported tier, up from 22% last year.' },
      { id: 'sl13', order: 2, type: 'chart', title: 'Streaming Platform Market Share', narrative: 'The top 5 platforms now control 82% of viewing time.' },
    ],
    tags: ['Media', 'Streaming', 'CTV'],
  },
  {
    id: 'ds-4', title: 'Health & Wellness Economy', description: 'Mapping the $1.5T wellness market opportunity',
    author: 'Marcus Johnson', created_at: '2025-01-08', updated_at: '2025-01-15', status: 'published', view_count: 345,
    slides: [
      { id: 'sl14', order: 0, type: 'title', title: 'Health & Wellness Economy', narrative: 'The wellness market is booming. Here is what is driving growth.' },
      { id: 'sl15', order: 1, type: 'insight', title: 'Mental Health is #1 Priority', narrative: '67% of consumers rank mental health as their top wellness concern.' },
      { id: 'sl16', order: 2, type: 'comparison', title: 'Wellness Spending by Category', narrative: 'Fitness tech grew 45% YoY while traditional gym memberships declined.' },
      { id: 'sl17', order: 3, type: 'callout', title: 'The Sleep Economy', narrative: 'Sleep-related products and services now represent a $432B market.' },
      { id: 'sl18', order: 4, type: 'conclusion', title: 'Where to Play', narrative: 'The convergence of tech and wellness creates a massive opportunity for brands that prioritize holistic well-being.' },
    ],
    tags: ['Health', 'Wellness', 'Trends'],
  },
];

// ─── Mock Data: Templates ────────────────────────────────────────────────────

const mockTemplates: ReportTemplate[] = [
  {
    id: 't-1', name: 'Executive Summary', description: 'High-level overview with key metrics, trends, and recommendations for C-suite stakeholders.', format: 'PDF',
    category: 'executive_summary', thumbnail_url: '', usage_count: 847,
    brand_config: { primary_color: '#1e40af', secondary_color: '#3b82f6', font_family: 'Inter', footer_text: '' },
    sections: [
      { id: 'ts1', type: 'cover', order: 0 }, { id: 'ts2', type: 'executive_summary', order: 1 },
      { id: 'ts3', type: 'key_findings', order: 2 }, { id: 'ts4', type: 'chart', order: 3 },
    ],
  },
  {
    id: 't-2', name: 'Deep Dive Analysis', description: 'Comprehensive multi-section report with detailed data tables, charts, and narrative insights.', format: 'PDF',
    category: 'deep_dive', thumbnail_url: '', usage_count: 523,
    brand_config: { primary_color: '#7c3aed', secondary_color: '#a78bfa', font_family: 'Inter', footer_text: '' },
    sections: [
      { id: 'ts5', type: 'cover', order: 0 }, { id: 'ts6', type: 'executive_summary', order: 1 },
      { id: 'ts7', type: 'chart', order: 2 }, { id: 'ts8', type: 'table', order: 3 },
      { id: 'ts9', type: 'crosstab', order: 4 }, { id: 'ts10', type: 'methodology', order: 5 },
    ],
  },
  {
    id: 't-3', name: 'Competitive Benchmark', description: 'Side-by-side competitor comparison with market positioning, brand health, and share of voice.', format: 'PPTX',
    category: 'competitive', thumbnail_url: '', usage_count: 312,
    brand_config: { primary_color: '#059669', secondary_color: '#34d399', font_family: 'Inter', footer_text: '' },
    sections: [
      { id: 'ts11', type: 'cover', order: 0 }, { id: 'ts12', type: 'executive_summary', order: 1 },
      { id: 'ts13', type: 'chart', order: 2 }, { id: 'ts14', type: 'chart', order: 3 },
      { id: 'ts15', type: 'key_findings', order: 4 },
    ],
  },
  {
    id: 't-4', name: 'Media Plan Brief', description: 'Audience media consumption profile with platform recommendations and targeting strategies.', format: 'PPTX',
    category: 'media_plan', thumbnail_url: '', usage_count: 198,
    brand_config: { primary_color: '#dc2626', secondary_color: '#f87171', font_family: 'Inter', footer_text: '' },
    sections: [
      { id: 'ts16', type: 'cover', order: 0 }, { id: 'ts17', type: 'narrative', order: 1 },
      { id: 'ts18', type: 'chart', order: 2 }, { id: 'ts19', type: 'table', order: 3 },
    ],
  },
  {
    id: 't-5', name: 'Audience Profile', description: 'Detailed demographic, psychographic, and behavioral profile of a target audience segment.', format: 'PDF',
    category: 'audience_profile', thumbnail_url: '', usage_count: 654,
    brand_config: { primary_color: '#d97706', secondary_color: '#fbbf24', font_family: 'Inter', footer_text: '' },
    sections: [
      { id: 'ts20', type: 'cover', order: 0 }, { id: 'ts21', type: 'executive_summary', order: 1 },
      { id: 'ts22', type: 'chart', order: 2 }, { id: 'ts23', type: 'chart', order: 3 },
      { id: 'ts24', type: 'table', order: 4 }, { id: 'ts25', type: 'narrative', order: 5 },
    ],
  },
  {
    id: 't-6', name: 'Brand Health Tracker', description: 'Brand awareness, consideration, preference, and NPS tracking with wave-over-wave comparison.', format: 'DOCX',
    category: 'brand_health', thumbnail_url: '', usage_count: 421,
    brand_config: { primary_color: '#ec4899', secondary_color: '#f9a8d4', font_family: 'Inter', footer_text: '' },
    sections: [
      { id: 'ts26', type: 'cover', order: 0 }, { id: 'ts27', type: 'executive_summary', order: 1 },
      { id: 'ts28', type: 'chart', order: 2 }, { id: 'ts29', type: 'chart', order: 3 },
      { id: 'ts30', type: 'key_findings', order: 4 }, { id: 'ts31', type: 'methodology', order: 5 },
    ],
  },
];

// ─── Mock Data: Schedules ────────────────────────────────────────────────────

const mockSchedules: ReportSchedule[] = [
  {
    id: 'sch-1', name: 'Weekly Brand Health Digest', frequency: 'weekly', day_of_week: 1, time: '08:00', timezone: 'America/New_York',
    recipients: ['team-leads@company.com', 'marketing@company.com'], format: 'pdf', include_narrative: true, auto_update_data: true,
    delivery_destinations: [
      { type: 'slack', connection_id: 'conn_slack_1', include_summary: true, include_attachments: true },
    ],
    enabled: true, last_sent_at: '2025-01-27T08:00:00Z', next_send_at: '2025-02-03T08:00:00Z', report_builder_id: 'rb-1',
  },
  {
    id: 'sch-2', name: 'Monthly Competitive Report', frequency: 'monthly', day_of_month: 1, time: '09:00', timezone: 'Europe/London',
    recipients: ['strategy@company.com', 'cmo@company.com', 'insights@company.com'], format: 'pptx', include_narrative: true, auto_update_data: true,
    delivery_destinations: [
      { type: 'power_bi', connection_id: 'conn_power_bi_1', include_summary: true, include_attachments: true },
    ],
    enabled: true, last_sent_at: '2025-01-01T09:00:00Z', next_send_at: '2025-02-01T09:00:00Z', report_builder_id: 'rb-3',
  },
  {
    id: 'sch-3', name: 'Quarterly Exec Summary', frequency: 'quarterly', day_of_month: 1, time: '07:00', timezone: 'America/New_York',
    recipients: ['c-suite@company.com'], format: 'pdf', include_narrative: true, auto_update_data: true,
    enabled: true, last_sent_at: '2025-01-01T07:00:00Z', next_send_at: '2025-04-01T07:00:00Z', template_id: 't-1',
  },
  {
    id: 'sch-4', name: 'Daily Social Metrics', frequency: 'daily', time: '06:00', timezone: 'America/Los_Angeles',
    recipients: ['social-team@company.com'], format: 'csv', include_narrative: false, auto_update_data: true,
    enabled: false, last_sent_at: '2025-01-25T06:00:00Z', next_send_at: '2025-01-29T06:00:00Z',
  },
  {
    id: 'sch-5', name: 'Weekly Audience Snapshot', frequency: 'weekly', day_of_week: 5, time: '16:00', timezone: 'Europe/London',
    recipients: ['planning@company.com', 'research@company.com'], format: 'xlsx', include_narrative: false, auto_update_data: true,
    enabled: true, last_sent_at: '2025-01-24T16:00:00Z', next_send_at: '2025-01-31T16:00:00Z', template_id: 't-5',
  },
];

// ─── Helper: Generate unique ID ──────────────────────────────────────────────

let _idCounter = 100;
function generateId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${_idCounter}`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Reports(): React.JSX.Element {
  const [mainTab, setMainTab] = useState<string>('all-reports');
  const activeProject = useWorkspaceStore((s) => s.activeProject);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="page-title">Reports</h1>
        {activeProject && (
          <Badge variant="info">Project: {activeProject.name}</Badge>
        )}
        <div className="reports-main-tabs">
          <Tabs tabs={mainTabItems} activeTab={mainTab} onChange={setMainTab} />
        </div>
      </div>

      {mainTab === 'all-reports' && <AllReportsTab />}
      {mainTab === 'report-builder' && <ReportBuilderTab />}
      {mainTab === 'data-stories' && <DataStoriesTab />}
      {mainTab === 'templates' && <TemplatesTab />}
      {mainTab === 'scheduled' && <ScheduledTab />}
    </div>
  );
}

// =============================================================================
// TAB 1: ALL REPORTS (Enhanced)
// =============================================================================

function AllReportsTab(): React.JSX.Element {
  const [categoryTab, setCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [formatFilter, setFormatFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [showFilters, setShowFilters] = useState(false);

  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);

  const { data: apiResponse, isLoading, isError } = useReports({
    page,
    per_page: REPORTS_PER_PAGE,
    search: searchQuery || undefined,
    project_id: activeProjectId || undefined,
    category: categoryTab !== 'all' ? categoryTab : undefined,
  });

  const hasApiData = apiResponse?.data && apiResponse.data.length > 0;

  const reports = useMemo(() => {
    let items: Report[];
    if (hasApiData) {
      items = [...apiResponse.data];
    } else {
      items = fallbackReports.filter((report) => {
        const matchesTab = categoryTab === 'all' || report.category === categoryTab;
        const matchesSearch = !searchQuery || report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
      });
    }

    // Apply format filter
    if (formatFilter) {
      items = items.filter((r) => r.type.toLowerCase() === formatFilter.toLowerCase());
    }

    // Apply author filter
    if (authorFilter) {
      items = items.filter((r) => r.author === authorFilter);
    }

    // Apply sorting
    items.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'view_count') return (b.view_count ?? 0) - (a.view_count ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return items;
  }, [hasApiData, apiResponse, categoryTab, searchQuery, formatFilter, authorFilter, sortBy]);

  const totalPages = hasApiData
    ? apiResponse.meta.total_pages
    : Math.ceil(reports.length / REPORTS_PER_PAGE);

  const displayReports = hasApiData
    ? reports
    : reports.slice((page - 1) * REPORTS_PER_PAGE, page * REPORTS_PER_PAGE);

  const handleDownload = (id: string): void => {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  const activeFilterCount = [formatFilter, authorFilter].filter(Boolean).length;

  return (
    <>
      {/* Sub-tabs for category */}
      <div className="reports-sub-tabs">
        <Tabs tabs={categoryTabItems} activeTab={categoryTab} onChange={(id) => { setCategoryTab(id); setPage(1); }} />
      </div>

      {/* Filters bar */}
      <div className="reports-filters">
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          placeholder="Search reports by name, tag, or author..."
        />
        <button className={`reports-filter-btn ${showFilters ? 'reports-filter-btn--active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="reports-filter-badge">{activeFilterCount}</span>}
        </button>
        <div className="reports-sort-select">
          <ArrowUpDown size={14} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="reports-view-toggle">
          <button className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`} onClick={() => setViewMode('list')} title="List view">
            <List size={16} />
          </button>
          <button className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="reports-filter-panel">
          <div className="filter-group">
            <label className="filter-label">Format</label>
            <div className="filter-chips">
              <button className={`filter-chip ${!formatFilter ? 'filter-chip--active' : ''}`} onClick={() => setFormatFilter('')}>All</button>
              {FORMAT_OPTIONS.map((fmt) => (
                <button key={fmt} className={`filter-chip ${formatFilter === fmt ? 'filter-chip--active' : ''}`} onClick={() => setFormatFilter(formatFilter === fmt ? '' : fmt)}>
                  <FormatIcon format={fmt} size={12} />
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Author</label>
            <div className="filter-chips">
              <button className={`filter-chip ${!authorFilter ? 'filter-chip--active' : ''}`} onClick={() => setAuthorFilter('')}>All</button>
              {AUTHOR_OPTIONS.map((auth) => (
                <button key={auth} className={`filter-chip ${authorFilter === auth ? 'filter-chip--active' : ''}`} onClick={() => setAuthorFilter(authorFilter === auth ? '' : auth)}>
                  {auth}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button className="filter-clear-btn" onClick={() => { setFormatFilter(''); setAuthorFilter(''); }}>
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading && !hasApiData ? (
        <div className="reports-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading reports...</p>
        </div>
      ) : isError && !hasApiData && displayReports.length === 0 ? (
        <EmptyState
          icon={<FileText size={40} />}
          title="Unable to load reports"
          description="There was an error loading reports. Please try again."
        />
      ) : displayReports.length === 0 ? (
        <EmptyState
          icon={<FileText size={40} />}
          title="No reports found"
          description={searchQuery ? 'No reports match your search criteria' : 'No reports available in this category'}
          action={
            (searchQuery || categoryTab !== 'all' || formatFilter || authorFilter) ? (
              <button className="reports-empty-btn" onClick={() => { setSearchQuery(''); setCategoryTab('all'); setFormatFilter(''); setAuthorFilter(''); setPage(1); }}>Clear filters</button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'reports-grid' : 'reports-list'}>
            {displayReports.map((report) => (
              viewMode === 'grid' ? (
                <ReportGridCard key={report.id} report={report} downloadingId={downloadingId} onDownload={handleDownload} />
              ) : (
                <ReportListCard key={report.id} report={report} downloadingId={downloadingId} onDownload={handleDownload} />
              )
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}

// ─── Report List Card ────────────────────────────────────────────────────────

function ReportListCard({ report, downloadingId, onDownload }: { report: Report; downloadingId: string | null; onDownload: (id: string) => void }) {
  return (
    <div className="report-card">
      <div className="report-icon">
        <FormatIcon format={report.type} size={24} />
      </div>
      <div className="report-info">
        <h3 className="report-name">{report.name}</h3>
        <div className="report-meta-row">
          <Badge variant="default">{report.type.toUpperCase()}</Badge>
          <span className="report-meta-dot">&middot;</span>
          <span className="report-meta-item">{report.size}</span>
          <span className="report-meta-dot">&middot;</span>
          <span className="report-meta-item">{formatDate(report.created_at)}</span>
          {report.author && (
            <>
              <span className="report-meta-dot">&middot;</span>
              <span className="report-meta-item">{report.author}</span>
            </>
          )}
        </div>
        <div className="report-indicators">
          <div className="report-tags">
            {report.tags.map((tag) => (
              <Badge key={tag} variant="info" className="report-tag">{tag}</Badge>
            ))}
          </div>
          {report.view_count !== undefined && (
            <span className="report-views">
              <Eye size={12} />
              {report.view_count} views
              {report.last_viewed_at && <> &middot; Last viewed {formatRelativeDate(report.last_viewed_at)}</>}
            </span>
          )}
        </div>
      </div>
      <div className="report-actions">
        <button className="icon-btn" title="Share">
          <Share2 size={16} />
        </button>
        <button className="icon-btn" title="Duplicate">
          <Copy size={16} />
        </button>
        <button
          className="report-download-btn"
          onClick={() => onDownload(report.id)}
          disabled={downloadingId === report.id}
        >
          <Download size={16} />
          <span>{downloadingId === report.id ? 'Downloading...' : 'Download'}</span>
        </button>
        <button className="icon-btn" title="Open">
          <ExternalLink size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Report Grid Card ────────────────────────────────────────────────────────

function ReportGridCard({ report, downloadingId, onDownload }: { report: Report; downloadingId: string | null; onDownload: (id: string) => void }) {
  return (
    <div className="report-grid-card">
      <div className="report-grid-card__header">
        <div className="report-grid-card__icon">
          <FormatIcon format={report.type} size={28} />
        </div>
        <Badge variant="default">{report.type.toUpperCase()}</Badge>
      </div>
      <h3 className="report-grid-card__name">{report.name}</h3>
      <div className="report-grid-card__meta">
        <span>{report.size}</span>
        <span>&middot;</span>
        <span>{formatDate(report.created_at)}</span>
      </div>
      {report.author && <div className="report-grid-card__author">{report.author}</div>}
      <div className="report-grid-card__tags">
        {report.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="info" className="report-tag">{tag}</Badge>
        ))}
      </div>
      {report.view_count !== undefined && (
        <div className="report-grid-card__views">
          <Eye size={12} />
          <span>{report.view_count} views</span>
        </div>
      )}
      <div className="report-grid-card__actions">
        <button className="icon-btn" title="Share"><Share2 size={14} /></button>
        <button className="icon-btn" title="Duplicate"><Copy size={14} /></button>
        <button
          className="report-download-btn report-download-btn--sm"
          onClick={() => onDownload(report.id)}
          disabled={downloadingId === report.id}
        >
          <Download size={14} />
          <span>{downloadingId === report.id ? '...' : 'Download'}</span>
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// TAB 2: REPORT BUILDER
// =============================================================================

function ReportBuilderTab(): React.JSX.Element {
  const [builders, setBuilders] = useState<ReportBuilder[]>(mockReportBuilders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const editingBuilder = editingId ? builders.find((b) => b.id === editingId) ?? null : null;

  const handleCreateNew = () => {
    const newBuilder: ReportBuilder = {
      id: generateId('rb'),
      name: 'Untitled Report',
      format: 'PDF',
      brand_config: { primary_color: '#1e40af', secondary_color: '#3b82f6', font_family: 'Inter', footer_text: '' },
      sections: [{ id: generateId('s'), type: 'cover', title: 'Cover Page', order: 0 }],
      status: 'draft',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      author: 'You',
    };
    setBuilders((prev) => [newBuilder, ...prev]);
    setEditingId(newBuilder.id);
    setShowNewForm(false);
  };

  const handleUpdateBuilder = (updated: ReportBuilder) => {
    setBuilders((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  if (editingBuilder) {
    return (
      <ReportBuilderEditor
        builder={editingBuilder}
        onUpdate={handleUpdateBuilder}
        onBack={() => setEditingId(null)}
      />
    );
  }

  return (
    <div className="builder-tab">
      <div className="builder-tab__header">
        <div>
          <h2 className="section-title">Your Reports</h2>
          <p className="section-subtitle">Create and manage custom reports with the drag-and-drop builder.</p>
        </div>
        <button className="btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> Create New Report
        </button>
      </div>

      <div className="builder-list">
        {builders.map((builder) => (
          <div key={builder.id} className="builder-card" onClick={() => setEditingId(builder.id)}>
            <div className="builder-card__icon" style={{ backgroundColor: builder.brand_config.primary_color + '18', color: builder.brand_config.primary_color }}>
              <FormatIcon format={builder.format} size={24} />
            </div>
            <div className="builder-card__info">
              <h3 className="builder-card__name">{builder.name}</h3>
              {builder.description && <p className="builder-card__desc">{builder.description}</p>}
              <div className="builder-card__meta">
                <Badge variant={builder.status === 'published' ? 'success' : builder.status === 'draft' ? 'warning' : 'default'}>
                  {builder.status}
                </Badge>
                <span>{builder.format}</span>
                <span>&middot;</span>
                <span>{builder.sections.length} sections</span>
                <span>&middot;</span>
                <span>Updated {formatRelativeDate(builder.updated_at)}</span>
              </div>
            </div>
            <div className="builder-card__author">{builder.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Report Builder Editor ───────────────────────────────────────────────────

function ReportBuilderEditor({ builder, onUpdate, onBack }: { builder: ReportBuilder; onUpdate: (b: ReportBuilder) => void; onBack: () => void }) {
  const [name, setName] = useState(builder.name);
  const [format, setFormat] = useState(builder.format);
  const [sections, setSections] = useState<ReportSection[]>([...builder.sections].sort((a, b) => a.order - b.order));
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({ ...builder.brand_config });
  const [showAddSection, setShowAddSection] = useState(false);
  const [showBrandConfig, setShowBrandConfig] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [status, setStatus] = useState(builder.status);

  const handleAddSection = (type: ReportSectionType) => {
    const meta = SECTION_TYPE_META[type];
    const newSection: ReportSection = {
      id: generateId('s'),
      type,
      title: meta.label,
      order: sections.length,
      text_content: type === 'narrative' || type === 'executive_summary' || type === 'key_findings' ? '' : undefined,
      ai_generated: false,
    };
    setSections((prev) => [...prev, newSection]);
    setShowAddSection(false);
  };

  const handleRemoveSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    [newSections[idx], newSections[targetIdx]] = [newSections[targetIdx], newSections[idx]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const handleToggleAI = (id: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ai_generated: !s.ai_generated } : s));
  };

  const handleSectionTitleChange = (id: string, title: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, title } : s));
  };

  const handleSave = (newStatus: 'draft' | 'published') => {
    const updated: ReportBuilder = {
      ...builder,
      name,
      format,
      brand_config: brandConfig,
      sections,
      status: newStatus,
      updated_at: new Date().toISOString().split('T')[0],
    };
    onUpdate(updated);
    setStatus(newStatus);
  };

  return (
    <div className="builder-editor">
      <div className="builder-editor__toolbar">
        <button className="btn-ghost" onClick={onBack}>
          <ChevronLeft size={16} /> Back to Reports
        </button>
        <div className="builder-editor__toolbar-right">
          <button className="btn-secondary" onClick={() => handleSave('draft')}>
            <Save size={16} /> Save Draft
          </button>
          <button className="btn-primary" onClick={() => handleSave('published')}>
            <Send size={16} /> Publish
          </button>
        </div>
      </div>

      <div className="builder-editor__layout">
        {/* Left: Section Builder */}
        <div className="builder-editor__main">
          {/* Report name & format */}
          <div className="builder-editor__name-row">
            <input
              type="text"
              className="builder-editor__name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Report name..."
            />
            <div className="builder-editor__format-select">
              {(['PDF', 'PPTX', 'DOCX'] as const).map((fmt) => (
                <button key={fmt} className={`format-btn ${format === fmt ? 'format-btn--active' : ''}`} onClick={() => setFormat(fmt)}>
                  <FormatIcon format={fmt} size={14} />
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Brand config toggle */}
          <button className="builder-editor__brand-toggle" onClick={() => setShowBrandConfig(!showBrandConfig)}>
            <Palette size={16} />
            <span>Brand Configuration</span>
            {showBrandConfig ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showBrandConfig && (
            <div className="brand-config-panel">
              <div className="brand-config-row">
                <div className="brand-config-field">
                  <label>Primary Color</label>
                  <div className="color-input-wrapper">
                    <input type="color" value={brandConfig.primary_color} onChange={(e) => setBrandConfig({ ...brandConfig, primary_color: e.target.value })} />
                    <span>{brandConfig.primary_color}</span>
                  </div>
                </div>
                <div className="brand-config-field">
                  <label>Secondary Color</label>
                  <div className="color-input-wrapper">
                    <input type="color" value={brandConfig.secondary_color} onChange={(e) => setBrandConfig({ ...brandConfig, secondary_color: e.target.value })} />
                    <span>{brandConfig.secondary_color}</span>
                  </div>
                </div>
                <div className="brand-config-field">
                  <label>Font Family</label>
                  <select value={brandConfig.font_family} onChange={(e) => setBrandConfig({ ...brandConfig, font_family: e.target.value })}>
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Lato</option>
                    <option>Montserrat</option>
                  </select>
                </div>
              </div>
              <div className="brand-config-row">
                <div className="brand-config-field brand-config-field--wide">
                  <label>Logo URL</label>
                  <input type="text" value={brandConfig.logo_url ?? ''} onChange={(e) => setBrandConfig({ ...brandConfig, logo_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="brand-config-field brand-config-field--wide">
                  <label>Footer Text</label>
                  <input type="text" value={brandConfig.footer_text} onChange={(e) => setBrandConfig({ ...brandConfig, footer_text: e.target.value })} placeholder="Confidential..." />
                </div>
              </div>
            </div>
          )}

          {/* Section list */}
          <div className="section-list">
            <div className="section-list__header">
              <h3>Sections ({sections.length})</h3>
            </div>
            {sections.map((section, idx) => {
              const meta = SECTION_TYPE_META[section.type];
              return (
                <div key={section.id} className={`section-item ${dragIdx === idx ? 'section-item--dragging' : ''}`}>
                  <div className="section-item__grip">
                    <GripVertical size={16} />
                  </div>
                  <div className="section-item__type-icon" style={{ color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div className="section-item__content">
                    <input
                      className="section-item__title-input"
                      value={section.title ?? ''}
                      onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                      placeholder={meta.label}
                    />
                    <div className="section-item__type-label">
                      <Badge variant="default">{meta.label}</Badge>
                      {section.ai_generated && (
                        <Badge variant="primary"><Sparkles size={10} /> AI</Badge>
                      )}
                      {section.text_content && (
                        <span className="section-item__preview">{section.text_content.substring(0, 60)}...</span>
                      )}
                    </div>
                  </div>
                  <div className="section-item__actions">
                    {(section.type === 'narrative' || section.type === 'executive_summary' || section.type === 'key_findings') && (
                      <button
                        className={`icon-btn icon-btn--sm ${section.ai_generated ? 'icon-btn--active' : ''}`}
                        title={section.ai_generated ? 'Disable AI generation' : 'Enable AI generation'}
                        onClick={() => handleToggleAI(section.id)}
                      >
                        <Sparkles size={14} />
                      </button>
                    )}
                    <button className="icon-btn icon-btn--sm" title="Move up" onClick={() => handleMoveSection(idx, 'up')} disabled={idx === 0}>
                      <ChevronUp size={14} />
                    </button>
                    <button className="icon-btn icon-btn--sm" title="Move down" onClick={() => handleMoveSection(idx, 'down')} disabled={idx === sections.length - 1}>
                      <ChevronDown size={14} />
                    </button>
                    <button className="icon-btn icon-btn--sm icon-btn--danger" title="Remove" onClick={() => handleRemoveSection(section.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add section button / picker */}
            <div className="section-add-area">
              {showAddSection ? (
                <div className="section-type-picker">
                  <div className="section-type-picker__header">
                    <span>Choose section type</span>
                    <button className="icon-btn icon-btn--sm" onClick={() => setShowAddSection(false)}><X size={14} /></button>
                  </div>
                  <div className="section-type-picker__grid">
                    {(Object.keys(SECTION_TYPE_META) as ReportSectionType[]).map((type) => {
                      const meta = SECTION_TYPE_META[type];
                      return (
                        <button key={type} className="section-type-option" onClick={() => handleAddSection(type)}>
                          <span className="section-type-option__icon" style={{ color: meta.color }}>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button className="btn-dashed" onClick={() => setShowAddSection(true)}>
                  <Plus size={16} /> Add Section
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="builder-editor__preview">
          <div className="preview-panel">
            <div className="preview-panel__header">
              <Eye size={16} />
              <span>Live Preview</span>
              <Badge variant="default">{format}</Badge>
            </div>
            <div className="preview-panel__content">
              <div className="preview-document" style={{ borderTopColor: brandConfig.primary_color }}>
                {sections.map((section) => {
                  const meta = SECTION_TYPE_META[section.type];
                  return (
                    <div key={section.id} className={`preview-section preview-section--${section.type}`}>
                      {section.type === 'cover' ? (
                        <div className="preview-cover" style={{ backgroundColor: brandConfig.primary_color + '0d' }}>
                          <div className="preview-cover__title" style={{ color: brandConfig.primary_color }}>{section.title || name}</div>
                          {brandConfig.footer_text && <div className="preview-cover__footer">{brandConfig.footer_text}</div>}
                        </div>
                      ) : section.type === 'divider' ? (
                        <div className="preview-divider" />
                      ) : (
                        <div className="preview-content-section">
                          <div className="preview-section__header">
                            <span className="preview-section__icon" style={{ color: meta.color }}>{meta.icon}</span>
                            <span className="preview-section__title">{section.title || meta.label}</span>
                            {section.ai_generated && <Sparkles size={10} className="preview-ai-icon" />}
                          </div>
                          {section.text_content ? (
                            <p className="preview-section__text">{section.text_content}</p>
                          ) : (
                            <div className="preview-section__placeholder">
                              {section.type === 'chart' && <BarChart3 size={24} />}
                              {section.type === 'table' && <Table2 size={24} />}
                              {section.type === 'crosstab' && <Grid size={24} />}
                              {section.type === 'image' && <Image size={24} />}
                              <span>{meta.label} content</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {brandConfig.footer_text && (
                  <div className="preview-footer">{brandConfig.footer_text}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB 3: DATA STORIES
// =============================================================================

function DataStoriesTab(): React.JSX.Element {
  const [stories, setStories] = useState<DataStory[]>(mockDataStories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const editingStory = editingId ? stories.find((s) => s.id === editingId) ?? null : null;

  const handleCreateNew = () => {
    const newStory: DataStory = {
      id: generateId('ds'),
      title: 'Untitled Story',
      author: 'You',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      status: 'draft',
      slides: [
        { id: generateId('sl'), order: 0, type: 'title', title: 'Untitled Story', narrative: 'Start telling your data story...' },
      ],
      tags: [],
    };
    setStories((prev) => [newStory, ...prev]);
    setEditingId(newStory.id);
  };

  const handleUpdateStory = (updated: DataStory) => {
    setStories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const filteredStories = stories.filter((s) =>
    !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (editingStory) {
    return (
      <DataStoryEditor
        story={editingStory}
        onUpdate={handleUpdateStory}
        onBack={() => setEditingId(null)}
      />
    );
  }

  return (
    <div className="stories-tab">
      <div className="stories-tab__header">
        <div>
          <h2 className="section-title">Data Stories</h2>
          <p className="section-subtitle">Create compelling, slide-based narratives powered by your data insights.</p>
        </div>
        <button className="btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> Create New Story
        </button>
      </div>

      <div className="stories-tab__search">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search stories..." />
      </div>

      {filteredStories.length === 0 ? (
        <EmptyState
          icon={<Film size={40} />}
          title="No stories found"
          description="Create your first data story to share insights with your team."
          action={<button className="btn-primary" onClick={handleCreateNew}><Plus size={16} /> Create Story</button>}
        />
      ) : (
        <div className="stories-grid">
          {filteredStories.map((story) => (
            <div key={story.id} className="story-card" onClick={() => setEditingId(story.id)}>
              <div className="story-card__header">
                <Badge variant={story.status === 'published' ? 'success' : 'warning'}>{story.status}</Badge>
                {story.view_count !== undefined && (
                  <span className="story-card__views"><Eye size={12} /> {story.view_count}</span>
                )}
              </div>
              <h3 className="story-card__title">{story.title}</h3>
              {story.description && <p className="story-card__desc">{story.description}</p>}
              <div className="story-card__meta">
                <span className="story-card__author">{story.author}</span>
                <span>&middot;</span>
                <span>{formatDate(story.created_at)}</span>
                <span>&middot;</span>
                <span>{story.slides.length} slides</span>
              </div>
              {story.tags && story.tags.length > 0 && (
                <div className="story-card__tags">
                  {story.tags.map((tag) => (
                    <Badge key={tag} variant="info" className="report-tag">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Data Story Editor ───────────────────────────────────────────────────────

function DataStoryEditor({ story, onUpdate, onBack }: { story: DataStory; onUpdate: (s: DataStory) => void; onBack: () => void }) {
  const [title, setTitle] = useState(story.title);
  const [slides, setSlides] = useState<DataStorySlide[]>([...story.slides].sort((a, b) => a.order - b.order));
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [showAddSlide, setShowAddSlide] = useState(false);

  const activeSlide = slides[activeSlideIdx] ?? null;

  const handleAddSlide = (type: DataStorySlideType) => {
    const meta = SLIDE_TYPE_META[type];
    const newSlide: DataStorySlide = {
      id: generateId('sl'),
      order: slides.length,
      type,
      title: meta.label,
      narrative: '',
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIdx(slides.length);
    setShowAddSlide(false);
  };

  const handleRemoveSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    setSlides(updated);
    if (activeSlideIdx >= updated.length) setActiveSlideIdx(updated.length - 1);
    else if (activeSlideIdx > idx) setActiveSlideIdx(activeSlideIdx - 1);
  };

  const handleSlideUpdate = (field: keyof DataStorySlide, value: string) => {
    setSlides((prev) => prev.map((s, i) => i === activeSlideIdx ? { ...s, [field]: value } : s));
  };

  const handleSave = (status: 'draft' | 'published') => {
    onUpdate({ ...story, title, slides, status, updated_at: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="story-editor">
      <div className="story-editor__toolbar">
        <button className="btn-ghost" onClick={onBack}>
          <ChevronLeft size={16} /> Back to Stories
        </button>
        <input
          type="text"
          className="story-editor__title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title..."
        />
        <div className="story-editor__toolbar-right">
          <button className="btn-secondary" onClick={() => handleSave('draft')}>
            <Save size={16} /> Save Draft
          </button>
          <button className="btn-primary" onClick={() => handleSave('published')}>
            <Send size={16} /> Publish
          </button>
          <button className="btn-accent">
            <Play size={16} /> Present
          </button>
        </div>
      </div>

      <div className="story-editor__layout">
        {/* Left sidebar: slide thumbnails */}
        <div className="story-editor__sidebar">
          <div className="slide-thumbnails">
            {slides.map((slide, idx) => {
              const meta = SLIDE_TYPE_META[slide.type];
              return (
                <div
                  key={slide.id}
                  className={`slide-thumbnail ${idx === activeSlideIdx ? 'slide-thumbnail--active' : ''}`}
                  onClick={() => setActiveSlideIdx(idx)}
                >
                  <div className="slide-thumbnail__number">{idx + 1}</div>
                  <div className="slide-thumbnail__preview">
                    <span className="slide-thumbnail__icon" style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="slide-thumbnail__title">{slide.title || meta.label}</span>
                  </div>
                  {slides.length > 1 && (
                    <button className="slide-thumbnail__delete" onClick={(e) => { e.stopPropagation(); handleRemoveSlide(idx); }} title="Remove slide">
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add slide */}
          {showAddSlide ? (
            <div className="slide-type-picker">
              <div className="slide-type-picker__header">
                <span>Add slide</span>
                <button className="icon-btn icon-btn--sm" onClick={() => setShowAddSlide(false)}><X size={12} /></button>
              </div>
              {(Object.keys(SLIDE_TYPE_META) as DataStorySlideType[]).map((type) => {
                const meta = SLIDE_TYPE_META[type];
                return (
                  <button key={type} className="slide-type-option" onClick={() => handleAddSlide(type)}>
                    <span style={{ color: meta.color }}>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <button className="btn-dashed btn-dashed--full" onClick={() => setShowAddSlide(true)}>
              <Plus size={14} /> Add Slide
            </button>
          )}
        </div>

        {/* Main: slide editor */}
        <div className="story-editor__main">
          {activeSlide && (
            <div className="slide-editor">
              <div className="slide-editor__type-bar">
                <span className="slide-editor__type-icon" style={{ color: SLIDE_TYPE_META[activeSlide.type].color }}>
                  {SLIDE_TYPE_META[activeSlide.type].icon}
                </span>
                <span className="slide-editor__type-name">{SLIDE_TYPE_META[activeSlide.type].label}</span>
                <span className="slide-editor__slide-num">Slide {activeSlideIdx + 1} of {slides.length}</span>
              </div>

              <div className="slide-editor__fields">
                <div className="slide-field">
                  <label className="slide-field__label">Title</label>
                  <input
                    type="text"
                    className="slide-field__input"
                    value={activeSlide.title ?? ''}
                    onChange={(e) => handleSlideUpdate('title', e.target.value)}
                    placeholder="Slide title..."
                  />
                </div>

                <div className="slide-field">
                  <label className="slide-field__label">Narrative</label>
                  <textarea
                    className="slide-field__textarea"
                    value={activeSlide.narrative}
                    onChange={(e) => handleSlideUpdate('narrative', e.target.value)}
                    placeholder="Tell the story behind the data..."
                    rows={6}
                  />
                </div>

                {(activeSlide.type === 'chart' || activeSlide.type === 'comparison') && (
                  <div className="slide-field">
                    <label className="slide-field__label">Chart / Visualization Reference</label>
                    <input
                      type="text"
                      className="slide-field__input"
                      value={activeSlide.chart_id ?? ''}
                      onChange={(e) => handleSlideUpdate('chart_id' as keyof DataStorySlide, e.target.value)}
                      placeholder="Enter chart ID or select from library..."
                    />
                  </div>
                )}

                <div className="slide-field">
                  <label className="slide-field__label">Transition Text <span className="slide-field__hint">(shown between slides)</span></label>
                  <input
                    type="text"
                    className="slide-field__input"
                    value={activeSlide.transition_text ?? ''}
                    onChange={(e) => handleSlideUpdate('transition_text', e.target.value)}
                    placeholder="What comes next..."
                  />
                </div>
              </div>

              {/* Slide preview */}
              <div className="slide-preview">
                <div className="slide-preview__label"><Eye size={14} /> Preview</div>
                <div className={`slide-preview__card slide-preview__card--${activeSlide.type}`}>
                  {activeSlide.title && <h3 className="slide-preview__title">{activeSlide.title}</h3>}
                  {activeSlide.narrative && <p className="slide-preview__narrative">{activeSlide.narrative}</p>}
                  {(activeSlide.type === 'chart' || activeSlide.type === 'comparison') && (
                    <div className="slide-preview__chart-placeholder">
                      <BarChart3 size={32} />
                      <span>Chart visualization</span>
                    </div>
                  )}
                  {activeSlide.transition_text && (
                    <div className="slide-preview__transition">{activeSlide.transition_text}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB 4: TEMPLATES
// =============================================================================

function TemplatesTab(): React.JSX.Element {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Object.keys(TEMPLATE_CATEGORY_META)];

  const filteredTemplates = mockTemplates.filter((t) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="templates-tab">
      <div className="templates-tab__header">
        <div>
          <h2 className="section-title">Report Templates</h2>
          <p className="section-subtitle">Start with a pre-built template and customize it for your needs.</p>
        </div>
      </div>

      <div className="templates-tab__filters">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search templates..." />
        <div className="template-category-chips">
          {categories.map((cat) => {
            const meta = cat !== 'all' ? TEMPLATE_CATEGORY_META[cat] : null;
            return (
              <button key={cat} className={`filter-chip ${categoryFilter === cat ? 'filter-chip--active' : ''}`} onClick={() => setCategoryFilter(cat)}>
                {meta?.icon}
                {cat === 'all' ? 'All' : meta?.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={<Layout size={40} />}
          title="No templates found"
          description="Try adjusting your search or category filter."
        />
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map((template) => {
            const catMeta = TEMPLATE_CATEGORY_META[template.category];
            return (
              <div key={template.id} className="template-card">
                <div className="template-card__thumbnail" style={{ borderLeftColor: template.brand_config.primary_color }}>
                  <div className="template-card__thumb-icon" style={{ color: template.brand_config.primary_color }}>
                    {catMeta?.icon || <FileText size={28} />}
                  </div>
                  <div className="template-card__sections-preview">
                    {template.sections.slice(0, 4).map((s) => (
                      <div key={s.id} className="template-card__section-dot" style={{ backgroundColor: SECTION_TYPE_META[s.type]?.color ?? '#94a3b8' }} title={SECTION_TYPE_META[s.type]?.label} />
                    ))}
                    {template.sections.length > 4 && <span className="template-card__more">+{template.sections.length - 4}</span>}
                  </div>
                </div>
                <div className="template-card__body">
                  <div className="template-card__header-row">
                    <h3 className="template-card__name">{template.name}</h3>
                    <Badge variant="default">{template.format}</Badge>
                  </div>
                  <p className="template-card__desc">{template.description}</p>
                  <div className="template-card__meta">
                    <Badge variant="info">{catMeta?.label ?? template.category}</Badge>
                    <span className="template-card__usage">
                      <Users size={12} /> {template.usage_count} uses
                    </span>
                    <span>{template.sections.length} sections</span>
                  </div>
                  <button className="btn-primary btn-primary--full">
                    <Plus size={14} /> Use Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TAB 5: SCHEDULED
// =============================================================================

function ScheduledTab(): React.JSX.Element {
  const [schedules, setSchedules] = useState<ReportSchedule[]>(mockSchedules);
  const [showForm, setShowForm] = useState(false);
  const [selectedIntegrationConnectionIds, setSelectedIntegrationConnectionIds] = useState<string[]>([]);
  const { data: reportDeliveryConnections = [] } = useIntegrationConnections('report_delivery');
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly' as ReportSchedule['frequency'],
    recipients: '',
    format: 'pdf' as ExportFormat,
    includeNarrative: true,
    conditionalDelivery: false,
  });

  const handleToggleEnabled = (id: string) => {
    setSchedules((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleCreateSchedule = () => {
    const emailRecipients = formData.recipients.split(',').map((r) => r.trim()).filter(Boolean);
    if (emailRecipients.length === 0 && selectedIntegrationConnectionIds.length === 0) {
      return;
    }

    const newSchedule: ReportSchedule = {
      id: generateId('sch'),
      name: formData.name || 'Untitled Schedule',
      frequency: formData.frequency,
      time: '09:00',
      timezone: 'America/New_York',
      recipients: emailRecipients,
      format: formData.format,
      include_narrative: formData.includeNarrative,
      auto_update_data: true,
      delivery_destinations: [
        ...(emailRecipients.length > 0 ? [{ type: 'email' as const, recipients: emailRecipients }] : []),
        ...selectedIntegrationConnectionIds.map((connectionId) => {
          const conn = reportDeliveryConnections.find((item) => item.id === connectionId);
          return {
            type: conn?.app_id ?? 'zapier',
            connection_id: connectionId,
            include_summary: true,
            include_attachments: true,
          };
        }),
      ],
      enabled: true,
      next_send_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    setShowForm(false);
    setSelectedIntegrationConnectionIds([]);
    setFormData({ name: '', frequency: 'weekly', recipients: '', format: 'pdf', includeNarrative: true, conditionalDelivery: false });
  };

  return (
    <div className="scheduled-tab">
      <div className="scheduled-tab__header">
        <div>
          <h2 className="section-title">Scheduled Deliveries</h2>
          <p className="section-subtitle">Automate report delivery to stakeholders on a recurring schedule.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Create Schedule
        </button>
      </div>

      {/* Create Schedule Form */}
      {showForm && (
        <div className="schedule-form">
          <div className="schedule-form__header">
            <h3>New Scheduled Delivery</h3>
            <button className="icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="schedule-form__grid">
            <div className="schedule-form__field">
              <label>Schedule Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Weekly Brand Report..." />
            </div>
            <div className="schedule-form__field">
              <label>Frequency</label>
              <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ReportSchedule['frequency'] })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="schedule-form__field schedule-form__field--wide">
              <label>Recipients <span className="field-hint">(comma-separated emails)</span></label>
              <input type="text" value={formData.recipients} onChange={(e) => setFormData({ ...formData, recipients: e.target.value })} placeholder="team@company.com, manager@company.com" />
            </div>
            <div className="schedule-form__field schedule-form__field--wide">
              <IntegrationDestinationPicker
                capability="report_delivery"
                multiSelect
                value={selectedIntegrationConnectionIds}
                onChange={setSelectedIntegrationConnectionIds}
                title="Integration destinations"
                emptyMessage="Connect report destinations in Developer Integrations first."
              />
            </div>
            <div className="schedule-form__field">
              <label>Format</label>
              <select value={formData.format} onChange={(e) => setFormData({ ...formData, format: e.target.value as ExportFormat })}>
                {FORMAT_OPTIONS.map((fmt) => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="schedule-form__field">
              <label className="schedule-form__toggle-label">
                <input type="checkbox" checked={formData.includeNarrative} onChange={(e) => setFormData({ ...formData, includeNarrative: e.target.checked })} />
                <span>Include AI narrative</span>
              </label>
            </div>
            <div className="schedule-form__field">
              <label className="schedule-form__toggle-label">
                <input type="checkbox" checked={formData.conditionalDelivery} onChange={(e) => setFormData({ ...formData, conditionalDelivery: e.target.checked })} />
                <span>Conditional delivery (only when data changes)</span>
              </label>
            </div>
          </div>
          <div className="schedule-form__actions">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleCreateSchedule}
              disabled={formData.recipients.trim().length === 0 && selectedIntegrationConnectionIds.length === 0}
            >
              <Calendar size={16} /> Create Schedule
            </button>
          </div>
        </div>
      )}

      {/* Schedule Table */}
      {schedules.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="No scheduled deliveries"
          description="Create a schedule to automatically deliver reports to your team."
          action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Create Schedule</button>}
        />
      ) : (
        <div className="schedule-table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Frequency</th>
                <th>Recipients</th>
                <th>Format</th>
                <th>Last Sent</th>
                <th>Next Send</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className={!schedule.enabled ? 'schedule-row--disabled' : ''}>
                  <td>
                    <div className="schedule-name-cell">
                      <Mail size={16} />
                      <span>{schedule.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant="default">{schedule.frequency}</Badge>
                  </td>
                  <td>
                    <div className="schedule-recipients">
                      {schedule.recipients.slice(0, 2).map((r) => (
                        <span key={r} className="schedule-recipient">{r}</span>
                      ))}
                      {schedule.recipients.length > 2 && (
                        <span className="schedule-recipient-more">+{schedule.recipients.length - 2} more</span>
                      )}
                      {(schedule.delivery_destinations ?? [])
                        .filter((dest) => dest.type !== 'email')
                        .slice(0, 2)
                        .map((dest, i) => (
                          <span key={`${dest.type}-${i}`} className="schedule-recipient">
                            {dest.type.replace('_', ' ')}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td>
                    <Badge variant="info">{schedule.format.toUpperCase()}</Badge>
                  </td>
                  <td>
                    {schedule.last_sent_at ? (
                      <span className="schedule-date">{formatRelativeDate(schedule.last_sent_at)}</span>
                    ) : (
                      <span className="schedule-date schedule-date--never">Never</span>
                    )}
                  </td>
                  <td>
                    {schedule.next_send_at ? (
                      <span className="schedule-date">{formatDate(schedule.next_send_at)}</span>
                    ) : (
                      <span className="schedule-date schedule-date--never">--</span>
                    )}
                  </td>
                  <td>
                    <button className="schedule-toggle" onClick={() => handleToggleEnabled(schedule.id)} title={schedule.enabled ? 'Disable schedule' : 'Enable schedule'}>
                      {schedule.enabled ? (
                        <ToggleRight size={24} className="schedule-toggle--on" />
                      ) : (
                        <ToggleLeft size={24} className="schedule-toggle--off" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
