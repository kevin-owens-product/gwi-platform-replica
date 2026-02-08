import { useState, useMemo } from 'react';
import {
  FileText, Download, ExternalLink, Loader2, Star, LayoutGrid, List,
  Plus, TrendingUp, Sparkles, RefreshCw, BookOpen, ChevronRight, X,
} from 'lucide-react';
import { SearchInput, Tabs, Pagination, EmptyState, Badge } from '@/components/shared';
import { useReports } from '@/hooks/useReports';
import { formatDate } from '@/utils/format';
import type { Report } from '@/api/types';
import './Reports.css';

/* ------------------------------------------------------------------ */
/*  Static / mock data                                                 */
/* ------------------------------------------------------------------ */

const insightCards = [
  {
    id: 'ins-1',
    badge: 'New',
    badgeVariant: 'success' as const,
    title: 'Q4 Consumer Trends released',
    description: 'Explore how consumer behavior shifted in the final quarter across 48 markets.',
    icon: Sparkles,
  },
  {
    id: 'ins-2',
    badge: 'Updated',
    badgeVariant: 'info' as const,
    title: 'Social Media Landscape 2024',
    description: 'Refreshed with December data -- platform usage, ad spend, and engagement metrics.',
    icon: RefreshCw,
  },
  {
    id: 'ins-3',
    badge: 'Trending',
    badgeVariant: 'warning' as const,
    title: 'Gen Z Purchase Behavior',
    description: 'The most-downloaded report this month. Understand the next generation of buyers.',
    icon: TrendingUp,
  },
];

const tabItems = [
  { id: 'all', label: 'All' },
  { id: 'industry', label: 'Industry' },
  { id: 'research', label: 'Research' },
  { id: 'custom', label: 'Custom' },
  { id: 'bookmarked', label: 'Bookmarked' },
];

const fallbackReports: Report[] = [
  { id: '1', name: 'Q4 2024 Consumer Trends Report', type: 'PDF', size: '2.4 MB', category: 'research', tags: ['Consumer Trends', 'Global'], download_url: '', created_at: '2025-01-15', updated_at: '2025-01-15' },
  { id: '2', name: 'Social Media Landscape 2024', type: 'PDF', size: '3.1 MB', category: 'industry', tags: ['Social Media', 'Digital'], download_url: '', created_at: '2025-01-08', updated_at: '2025-01-08' },
  { id: '3', name: 'Gen Z Purchase Behavior Analysis', type: 'PDF', size: '1.8 MB', category: 'research', tags: ['Gen Z', 'Purchase'], download_url: '', created_at: '2025-01-02', updated_at: '2025-01-02' },
  { id: '4', name: 'Global Brand Perception Study', type: 'PDF', size: '4.2 MB', category: 'industry', tags: ['Brand', 'Global'], download_url: '', created_at: '2024-12-18', updated_at: '2024-12-18' },
  { id: '5', name: 'US Digital Advertising Report', type: 'PDF', size: '2.8 MB', category: 'industry', tags: ['Advertising', 'USA'], download_url: '', created_at: '2024-12-10', updated_at: '2024-12-10' },
  { id: '6', name: 'Sustainability Consumer Index', type: 'PDF', size: '1.5 MB', category: 'research', tags: ['Sustainability', 'Attitudes'], download_url: '', created_at: '2024-11-28', updated_at: '2024-11-28' },
  { id: '7', name: 'Media Consumption Q3 Summary', type: 'PDF', size: '3.4 MB', category: 'custom', tags: ['Media', 'Quarterly'], download_url: '', created_at: '2024-11-15', updated_at: '2024-11-15' },
  { id: '8', name: 'E-commerce Growth Forecast 2025', type: 'PDF', size: '2.1 MB', category: 'industry', tags: ['E-commerce', 'Forecast'], download_url: '', created_at: '2024-11-05', updated_at: '2024-11-05' },
  { id: '9', name: 'Health & Wellness Trend Report', type: 'PDF', size: '2.9 MB', category: 'research', tags: ['Health', 'Wellness'], download_url: '', created_at: '2024-10-20', updated_at: '2024-10-20' },
  { id: '10', name: 'Custom Competitive Analysis', type: 'PDF', size: '1.2 MB', category: 'custom', tags: ['Competitive', 'Custom'], download_url: '', created_at: '2024-10-10', updated_at: '2024-10-10' },
];

/* Mock preview data keyed by report id */
const mockPreviews: Record<string, { summary: string; findings: string[]; toc: string[] }> = {
  '1': {
    summary: 'This report examines shifts in consumer spending, media consumption, and brand loyalty across 48 global markets during Q4 2024. Key themes include the acceleration of value-seeking behavior and continued digital-first purchasing.',
    findings: ['62% of consumers reduced discretionary spending', 'Social commerce grew 34% YoY', 'Brand loyalty declined in 3 of 5 major categories', 'Sustainability remained a top-3 purchase driver'],
    toc: ['Executive Summary', 'Methodology', 'Global Spending Trends', 'Digital Behavior', 'Brand Loyalty Analysis', 'Sustainability Impact', 'Regional Breakdowns', 'Appendix'],
  },
  '2': {
    summary: 'A comprehensive analysis of social media platform usage, advertising effectiveness, and emerging formats across key demographics and geographies in 2024.',
    findings: ['Short-form video now accounts for 48% of social time', 'TikTok overtook Instagram in ad recall among Gen Z', 'LinkedIn engagement up 29% for B2B brands', 'Threads adoption plateaued at 12% MAU penetration'],
    toc: ['Executive Summary', 'Platform Landscape', 'Audience Demographics', 'Ad Format Performance', 'Emerging Trends', 'Recommendations'],
  },
};

const defaultPreview = {
  summary: 'This report provides in-depth analysis and actionable insights based on GWI\'s proprietary survey data spanning multiple markets and demographics.',
  findings: ['Key demographic shifts identified', 'Emerging market opportunities highlighted', 'Competitive landscape benchmarked', 'Actionable recommendations provided'],
  toc: ['Executive Summary', 'Methodology', 'Key Findings', 'Detailed Analysis', 'Recommendations', 'Appendix'],
};

const REPORTS_PER_PAGE = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Reports(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const { data: apiResponse, isLoading, isError } = useReports({
    page,
    per_page: REPORTS_PER_PAGE,
    search: searchQuery || undefined,
    category: activeTab !== 'all' && activeTab !== 'bookmarked' ? activeTab : undefined,
  });

  const hasApiData = apiResponse?.data && apiResponse.data.length > 0;

  /* ---------- Bookmark helpers ---------- */

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ---------- Filtered reports ---------- */

  const reports = useMemo(() => {
    if (hasApiData && activeTab !== 'bookmarked') return apiResponse.data;

    // Fallback: client-side filtering on static data
    return fallbackReports.filter((report) => {
      if (activeTab === 'bookmarked') {
        if (!bookmarkedIds.has(report.id)) return false;
      } else {
        const matchesTab = activeTab === 'all' || report.category === activeTab;
        if (!matchesTab) return false;
      }
      const matchesSearch =
        !searchQuery ||
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [hasApiData, apiResponse, activeTab, searchQuery, bookmarkedIds]);

  const totalPages = hasApiData && activeTab !== 'bookmarked'
    ? apiResponse.meta.total_pages
    : Math.ceil(reports.length / REPORTS_PER_PAGE);

  const displayReports = hasApiData && activeTab !== 'bookmarked'
    ? reports
    : reports.slice((page - 1) * REPORTS_PER_PAGE, page * REPORTS_PER_PAGE);

  const handleDownload = (id: string): void => {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  const selectedReport = fallbackReports.find((r) => r.id === selectedReportId) ?? null;
  const preview = selectedReportId
    ? mockPreviews[selectedReportId] ?? defaultPreview
    : null;

  return (
    <div className="reports-page">
      {/* ---------- Header ---------- */}
      <div className="reports-header">
        <h1 className="page-title">Reports</h1>

        <div className="reports-header-actions">
          <button className="reports-request-btn">
            <Plus size={15} />
            <span>Request Custom Report</span>
          </button>

          <div className="reports-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Insight cards ---------- */}
      <div className="reports-insights">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="insight-card">
              <div className="insight-card-icon">
                <Icon size={18} />
              </div>
              <div className="insight-card-body">
                <div className="insight-card-top">
                  <Badge variant={card.badgeVariant}>{card.badge}</Badge>
                </div>
                <h3 className="insight-card-title">{card.title}</h3>
                <p className="insight-card-desc">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Tabs + Search ---------- */}
      <div className="reports-tabs">
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tabId) => { setActiveTab(tabId); setPage(1); setSelectedReportId(null); }}
        />
      </div>

      <div className="reports-filters">
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          placeholder="Search reports by name or tag"
        />
      </div>

      {/* ---------- Content area ---------- */}
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
          icon={activeTab === 'bookmarked' ? <Star size={40} /> : <FileText size={40} />}
          title={activeTab === 'bookmarked' ? 'No bookmarked reports' : 'No reports found'}
          description={
            activeTab === 'bookmarked'
              ? 'Star your favorite reports to quickly access them here.'
              : searchQuery
                ? 'No reports match your search criteria'
                : 'No reports available in this category'
          }
          action={
            (searchQuery || (activeTab !== 'all' && activeTab !== 'bookmarked')) ? (
              <button className="reports-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); setPage(1); }}>Clear filters</button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="reports-content-area">
            {/* Report list / grid */}
            <div className={`reports-list ${viewMode === 'list' ? 'reports-list--compact' : ''} ${selectedReportId ? 'reports-list--with-preview' : ''}`}>
              {displayReports.map((report) => (
                <div
                  key={report.id}
                  className={`report-card ${viewMode === 'list' ? 'report-card--compact' : ''} ${selectedReportId === report.id ? 'report-card--selected' : ''}`}
                  onClick={() => setSelectedReportId(selectedReportId === report.id ? null : report.id)}
                >
                  {/* Bookmark star */}
                  <button
                    className={`report-bookmark-btn ${bookmarkedIds.has(report.id) ? 'bookmarked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(report.id); }}
                    title={bookmarkedIds.has(report.id) ? 'Remove bookmark' : 'Bookmark report'}
                  >
                    <Star size={16} />
                  </button>

                  <div className="report-icon">
                    <FileText size={viewMode === 'list' ? 18 : 24} />
                  </div>
                  <div className="report-info">
                    <h3 className="report-name">{report.name}</h3>
                    <div className="report-meta-row">
                      <Badge variant="default">{report.type}</Badge>
                      <span className="report-meta-dot">&middot;</span>
                      <span className="report-meta-item">{report.size}</span>
                      <span className="report-meta-dot">&middot;</span>
                      <span className="report-meta-item">{formatDate(report.created_at)}</span>
                    </div>
                    {viewMode !== 'list' && (
                      <div className="report-tags">
                        {report.tags.map((tag) => (
                          <Badge key={tag} variant="info" className="report-tag">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="report-actions">
                    <button
                      className="report-download-btn"
                      onClick={(e) => { e.stopPropagation(); handleDownload(report.id); }}
                      disabled={downloadingId === report.id}
                    >
                      <Download size={16} />
                      <span>{downloadingId === report.id ? 'Downloading...' : 'Download'}</span>
                    </button>
                    <button className="icon-btn" title="Open" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview panel */}
            {selectedReport && preview && (
              <div className="report-preview-panel">
                <div className="report-preview-header">
                  <BookOpen size={18} className="report-preview-header-icon" />
                  <h2 className="report-preview-title">Report Preview</h2>
                  <button className="report-preview-close" onClick={() => setSelectedReportId(null)} title="Close preview">
                    <X size={16} />
                  </button>
                </div>

                <div className="report-preview-body">
                  <h3 className="report-preview-name">{selectedReport.name}</h3>

                  <div className="report-preview-meta">
                    <Badge variant="default">{selectedReport.type}</Badge>
                    <span>{selectedReport.size}</span>
                    <span>{formatDate(selectedReport.created_at)}</span>
                  </div>

                  <div className="report-preview-section">
                    <h4 className="report-preview-section-title">Executive Summary</h4>
                    <p className="report-preview-text">{preview.summary}</p>
                  </div>

                  <div className="report-preview-section">
                    <h4 className="report-preview-section-title">Key Findings</h4>
                    <ul className="report-preview-findings">
                      {preview.findings.map((f, i) => (
                        <li key={i}>
                          <ChevronRight size={14} className="finding-bullet" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="report-preview-section">
                    <h4 className="report-preview-section-title">Table of Contents</h4>
                    <ol className="report-preview-toc">
                      {preview.toc.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="report-preview-actions">
                    <button
                      className="report-download-btn"
                      onClick={() => handleDownload(selectedReport.id)}
                      disabled={downloadingId === selectedReport.id}
                    >
                      <Download size={16} />
                      <span>{downloadingId === selectedReport.id ? 'Downloading...' : 'Download Report'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
