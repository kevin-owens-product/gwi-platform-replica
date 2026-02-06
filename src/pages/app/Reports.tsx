import { useState, useMemo } from 'react';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { SearchInput, Tabs, Pagination, EmptyState, Badge } from '@/components/shared';
import { useReports } from '@/hooks/useReports';
import { formatDate } from '@/utils/format';
import type { Report } from '@/api/types';
import './Reports.css';

const tabItems = [
  { id: 'all', label: 'All' },
  { id: 'industry', label: 'Industry' },
  { id: 'research', label: 'Research' },
  { id: 'custom', label: 'Custom' },
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

const REPORTS_PER_PAGE = 6;

export default function Reports(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: apiResponse, isLoading, isError } = useReports({
    page,
    per_page: REPORTS_PER_PAGE,
    search: searchQuery || undefined,
    category: activeTab !== 'all' ? activeTab : undefined,
  });

  const hasApiData = apiResponse?.data && apiResponse.data.length > 0;

  const reports = useMemo(() => {
    if (hasApiData) return apiResponse.data;

    // Fallback: client-side filtering on static data
    return fallbackReports.filter((report) => {
      const matchesTab = activeTab === 'all' || report.category === activeTab;
      const matchesSearch = !searchQuery || report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [hasApiData, apiResponse, activeTab, searchQuery]);

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

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="page-title">Reports</h1>
        <div className="reports-tabs">
          <Tabs tabs={tabItems} activeTab={activeTab} onChange={(tabId) => { setActiveTab(tabId); setPage(1); }} />
        </div>
      </div>

      <div className="reports-filters">
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          placeholder="Search reports by name or tag"
        />
      </div>

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
            (searchQuery || activeTab !== 'all') ? (
              <button className="reports-empty-btn" onClick={() => { setSearchQuery(''); setActiveTab('all'); setPage(1); }}>Clear filters</button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="reports-list">
            {displayReports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-icon">
                  <FileText size={24} />
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
                  <div className="report-tags">
                    {report.tags.map((tag) => (
                      <Badge key={tag} variant="info" className="report-tag">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="report-actions">
                  <button
                    className="report-download-btn"
                    onClick={() => handleDownload(report.id)}
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
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
