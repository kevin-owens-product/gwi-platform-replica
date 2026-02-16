import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Shield, Building2, Save, Users, BarChart2, Settings2, Loader2,
  ScrollText, Keyboard, Mail, Bell, BellOff, Palette, Globe, Clock,
  Search, Plus, FileText, BarChart3, Table2, LayoutDashboard, Trash2,
  Eye, Edit3, Download, LogIn, UserPlus, Command, Code2, Key, Webhook,
  Copy, Check, RefreshCw, AlertTriangle, Zap, Server, Plug,
  MessageSquare, Activity, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useProfile } from '@/hooks/useAuth';
import {
  useIntegrationCatalog,
  useIntegrationConnections,
  useConnectIntegration,
  useDisconnectIntegration,
  useTestIntegrationConnection,
  useIntegrationDeliveryHistory,
} from '@/hooks/useIntegrations';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';
import { authApi } from '@/api';
import { Tabs, Button, Input, Badge, DataTable } from '@/components/shared';
import type { Column } from '@/components/shared';
import UserManagement from '@/components/admin/UserManagement';
import UsageStats from '@/components/admin/UsageStats';
import ChartRenderer from '@/components/chart/ChartRenderer';
import type {
  User as UserType,
  IntegrationCategory,
  IntegrationAppId,
  IntegrationConnection,
  IntegrationActivity,
} from '@/api/types';
import { formatDate, formatRelativeDate } from '@/utils/format';
import './Settings.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileFormData {
  name: string;
  email: string;
  organization_name: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityName: string;
  details: string;
}

interface KeyboardShortcut {
  id: string;
  category: string;
  keys: string;
  description: string;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  queries: number;
  lastActive: string;
}

interface ApiKeyEntry {
  id: string;
  name: string;
  keyPrefix: string;
  scope: 'platform' | 'spark' | 'both';
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdBy: string;
}

interface ApiUsageEndpoint {
  id: string;
  endpoint: string;
  category: string;
  calls: number;
  avgLatency: number;
  errorRate: number;
}

interface WebhookEntry {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'disabled' | 'failing';
  lastTriggeredAt: string | null;
  createdAt: string;
  successRate: number;
}

interface McpTool {
  name: string;
  description: string;
  parameters: { name: string; required: boolean; description: string }[];
  exampleRequest: string;
}

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'organization', label: 'Organization', icon: <Building2 size={16} /> },
  { id: 'usage', label: 'Usage', icon: <BarChart2 size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings2 size={16} /> },
  { id: 'audit-log', label: 'Audit Log', icon: <ScrollText size={16} /> },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={16} /> },
  { id: 'developer', label: 'Developer', icon: <Code2 size={16} /> },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockAuditLog: AuditLogEntry[] = [
  { id: 'al-1', timestamp: '2026-02-08T14:32:00Z', user: 'Sarah Chen', action: 'created', entityType: 'chart', entityName: 'Q4 Social Trends', details: 'Created bar chart with 3 series' },
  { id: 'al-2', timestamp: '2026-02-08T11:15:00Z', user: 'James Park', action: 'edited', entityType: 'dashboard', entityName: 'Brand Health Overview', details: 'Added 2 new widgets' },
  { id: 'al-3', timestamp: '2026-02-07T16:45:00Z', user: 'Sarah Chen', action: 'deleted', entityType: 'audience', entityName: 'Test Audience Draft', details: 'Permanently deleted' },
  { id: 'al-4', timestamp: '2026-02-07T09:20:00Z', user: 'Alex Rivera', action: 'exported', entityType: 'report', entityName: 'Monthly Insights Jan 2026', details: 'Exported as PDF' },
  { id: 'al-5', timestamp: '2026-02-06T15:00:00Z', user: 'James Park', action: 'created', entityType: 'crosstab', entityName: 'Gen Z vs Millennials Media', details: 'Cross-tab with 4 questions' },
  { id: 'al-6', timestamp: '2026-02-06T10:30:00Z', user: 'Sarah Chen', action: 'viewed', entityType: 'chart', entityName: 'Streaming Platform Comparison', details: 'Viewed chart details' },
  { id: 'al-7', timestamp: '2026-02-05T13:10:00Z', user: 'Alex Rivera', action: 'created', entityType: 'audience', entityName: 'Fitness Enthusiasts 18-34', details: 'Created from crosstab selection' },
  { id: 'al-8', timestamp: '2026-02-05T08:45:00Z', user: 'James Park', action: 'login', entityType: 'system', entityName: 'Authentication', details: 'Logged in from Chrome/macOS' },
  { id: 'al-9', timestamp: '2026-02-04T17:20:00Z', user: 'Sarah Chen', action: 'invited', entityType: 'user', entityName: 'maria.gonzalez@example.com', details: 'Invited as analyst' },
  { id: 'al-10', timestamp: '2026-02-04T14:00:00Z', user: 'Alex Rivera', action: 'edited', entityType: 'chart', entityName: 'Social Media Usage Trends', details: 'Changed chart type to area' },
];

const mockShortcuts: KeyboardShortcut[] = [
  // Navigation
  { id: 'sc-1', category: 'Navigation', keys: 'Cmd+K', description: 'Open global search' },
  { id: 'sc-2', category: 'Navigation', keys: 'Cmd+/', description: 'Show keyboard shortcuts' },
  { id: 'sc-3', category: 'Navigation', keys: 'G then H', description: 'Go to Home' },
  { id: 'sc-4', category: 'Navigation', keys: 'G then D', description: 'Go to Dashboards' },
  { id: 'sc-5', category: 'Navigation', keys: 'G then A', description: 'Go to Audiences' },
  { id: 'sc-6', category: 'Navigation', keys: 'G then S', description: 'Go to Settings' },
  // Editing
  { id: 'sc-7', category: 'Editing', keys: 'Cmd+N', description: 'Create new item' },
  { id: 'sc-8', category: 'Editing', keys: 'Cmd+S', description: 'Save current work' },
  { id: 'sc-9', category: 'Editing', keys: 'Cmd+Z', description: 'Undo last action' },
  { id: 'sc-10', category: 'Editing', keys: 'Cmd+Shift+Z', description: 'Redo last action' },
  { id: 'sc-11', category: 'Editing', keys: 'Cmd+D', description: 'Duplicate selected item' },
  { id: 'sc-12', category: 'Editing', keys: 'Delete', description: 'Delete selected item' },
  // Chart
  { id: 'sc-13', category: 'Chart', keys: 'Cmd+E', description: 'Export chart as image' },
  { id: 'sc-14', category: 'Chart', keys: 'T', description: 'Toggle chart type picker' },
  { id: 'sc-15', category: 'Chart', keys: 'L', description: 'Toggle legend visibility' },
  { id: 'sc-16', category: 'Chart', keys: 'G', description: 'Toggle grid lines' },
  // Crosstab
  { id: 'sc-17', category: 'Crosstab', keys: 'Cmd+Enter', description: 'Run crosstab query' },
  { id: 'sc-18', category: 'Crosstab', keys: 'Cmd+Shift+E', description: 'Export crosstab data' },
  { id: 'sc-19', category: 'Crosstab', keys: 'R', description: 'Toggle row percentages' },
  { id: 'sc-20', category: 'Crosstab', keys: 'C', description: 'Toggle column percentages' },
];

const mockUsageChartData = [
  { name: 'Mon', Queries: 245 },
  { name: 'Tue', Queries: 312 },
  { name: 'Wed', Queries: 287 },
  { name: 'Thu', Queries: 395 },
  { name: 'Fri', Queries: 420 },
  { name: 'Sat', Queries: 150 },
  { name: 'Sun', Queries: 98 },
];

const mockTopUsers: TopUser[] = [
  { id: 'tu-1', name: 'Sarah Chen', email: 'sarah.chen@example.com', queries: 1284, lastActive: '2026-02-08T14:32:00Z' },
  { id: 'tu-2', name: 'James Park', email: 'james.park@example.com', queries: 956, lastActive: '2026-02-08T11:15:00Z' },
  { id: 'tu-3', name: 'Alex Rivera', email: 'alex.rivera@example.com', queries: 743, lastActive: '2026-02-07T16:45:00Z' },
  { id: 'tu-4', name: 'Maria Gonzalez', email: 'maria.gonzalez@example.com', queries: 612, lastActive: '2026-02-06T10:30:00Z' },
  { id: 'tu-5', name: 'David Kim', email: 'david.kim@example.com', queries: 487, lastActive: '2026-02-05T08:45:00Z' },
];

const mockApiKeys: ApiKeyEntry[] = [
  { id: 'ak-1', name: 'Production Platform Key', keyPrefix: 'gwi_plat_****7f3a', scope: 'platform', status: 'active', createdAt: '2025-11-15T10:00:00Z', lastUsedAt: '2026-02-09T08:12:00Z', expiresAt: '2026-11-15T10:00:00Z', createdBy: 'Sarah Chen' },
  { id: 'ak-2', name: 'Spark MCP Integration', keyPrefix: 'gwi_sprk_****2e91', scope: 'spark', status: 'active', createdAt: '2026-01-08T14:30:00Z', lastUsedAt: '2026-02-09T07:45:00Z', expiresAt: null, createdBy: 'Sarah Chen' },
  { id: 'ak-3', name: 'BI Dashboard Connector', keyPrefix: 'gwi_plat_****c4b8', scope: 'platform', status: 'active', createdAt: '2025-09-20T09:00:00Z', lastUsedAt: '2026-02-08T23:00:00Z', expiresAt: '2026-09-20T09:00:00Z', createdBy: 'James Park' },
  { id: 'ak-4', name: 'Legacy Export Key', keyPrefix: 'gwi_plat_****1d05', scope: 'platform', status: 'revoked', createdAt: '2025-03-01T12:00:00Z', lastUsedAt: '2025-08-14T16:30:00Z', expiresAt: '2026-03-01T12:00:00Z', createdBy: 'Alex Rivera' },
  { id: 'ak-5', name: 'Testing Spark Key', keyPrefix: 'gwi_sprk_****9a22', scope: 'spark', status: 'expired', createdAt: '2025-06-01T08:00:00Z', lastUsedAt: '2025-09-30T11:00:00Z', expiresAt: '2025-12-01T08:00:00Z', createdBy: 'Sarah Chen' },
];

const mockApiUsageEndpoints: ApiUsageEndpoint[] = [
  { id: 'ep-1', endpoint: 'POST /v2/categories/filter', category: 'Categories', calls: 4280, avgLatency: 145, errorRate: 0.2 },
  { id: 'ep-2', endpoint: 'POST /v2/query/stats', category: 'Query', calls: 3150, avgLatency: 890, errorRate: 1.1 },
  { id: 'ep-3', endpoint: 'GET /v2/audiences', category: 'Audiences', calls: 2890, avgLatency: 120, errorRate: 0.1 },
  { id: 'ep-4', endpoint: 'POST /v2/saved/crosstabs', category: 'Crosstabs', calls: 1920, avgLatency: 340, errorRate: 0.5 },
  { id: 'ep-5', endpoint: 'GET /v2/locations', category: 'Locations', calls: 1560, avgLatency: 85, errorRate: 0.0 },
  { id: 'ep-6', endpoint: 'GET /v2/waves', category: 'Waves', calls: 1230, avgLatency: 92, errorRate: 0.0 },
  { id: 'ep-7', endpoint: 'POST /v1/spark-api/mcp', category: 'Spark MCP', calls: 980, avgLatency: 2100, errorRate: 0.8 },
  { id: 'ep-8', endpoint: 'GET /v2/splitters', category: 'Splitters', calls: 740, avgLatency: 110, errorRate: 0.1 },
  { id: 'ep-9', endpoint: 'GET /v2/questions', category: 'Questions', calls: 620, avgLatency: 155, errorRate: 0.3 },
  { id: 'ep-10', endpoint: 'GET /v2/taxonomy', category: 'Taxonomy', calls: 410, avgLatency: 200, errorRate: 0.2 },
];

const mockApiUsageChart = [
  { name: 'Jan', 'Platform API': 12400, 'Spark MCP': 2100 },
  { name: 'Feb', 'Platform API': 14200, 'Spark MCP': 3400 },
  { name: 'Mar', 'Platform API': 11800, 'Spark MCP': 4200 },
  { name: 'Apr', 'Platform API': 15600, 'Spark MCP': 5100 },
  { name: 'May', 'Platform API': 13900, 'Spark MCP': 6800 },
  { name: 'Jun', 'Platform API': 16200, 'Spark MCP': 7200 },
];

const mockWebhooks: WebhookEntry[] = [
  { id: 'wh-1', url: 'https://hooks.example.com/gwi/data-updated', events: ['data.updated', 'wave.published'], status: 'active', lastTriggeredAt: '2026-02-08T22:00:00Z', createdAt: '2025-10-01T09:00:00Z', successRate: 99.2 },
  { id: 'wh-2', url: 'https://api.internal.com/webhooks/gwi-export', events: ['export.complete'], status: 'active', lastTriggeredAt: '2026-02-07T15:30:00Z', createdAt: '2025-11-15T14:00:00Z', successRate: 97.8 },
  { id: 'wh-3', url: 'https://slack.example.com/services/T00/B00/abc', events: ['audience.changed', 'audience.created'], status: 'failing', lastTriggeredAt: '2026-02-05T10:00:00Z', createdAt: '2026-01-10T11:00:00Z', successRate: 45.0 },
];

const mcpTools: McpTool[] = [
  {
    name: 'chat_gwi',
    description: 'Ask natural language questions about demographics, interests, digital behaviour, and media preferences across 52+ global markets.',
    parameters: [
      { name: 'prompt', required: true, description: 'Natural language question about consumer insights' },
      { name: 'chat_id', required: false, description: 'Session ID for follow-up conversations' },
    ],
    exampleRequest: JSON.stringify({
      jsonrpc: '2.0',
      id: 'req-123',
      method: 'tools/call',
      params: {
        name: 'chat_gwi',
        arguments: {
          prompt: 'What marketing channels work best for Audi drivers in the US?',
        },
      },
    }, null, 2),
  },
  {
    name: 'explore_insight_gwi',
    description: 'Get detailed statistics for a specific insight — percentages, sample sizes, and index scores comparing audience behaviour to the general population.',
    parameters: [
      { name: 'insight_id', required: true, description: 'Valid UUID from a previous chat_gwi response' },
    ],
    exampleRequest: JSON.stringify({
      jsonrpc: '2.0',
      id: 'req-456',
      method: 'tools/call',
      params: {
        name: 'explore_insight_gwi',
        arguments: {
          insight_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        },
      },
    }, null, 2),
  },
];

const mcpIntegrationSnippets: { platform: string; config: string }[] = [
  {
    platform: 'Claude Desktop (MCP Remote)',
    config: JSON.stringify({
      mcpServers: {
        gwi: {
          command: 'npx',
          args: [
            'mcp-remote',
            'https://api.globalwebindex.com/v1/spark-api/mcp',
            '--header',
            'Authorization: Bearer YOUR_SPARK_API_TOKEN',
          ],
        },
      },
    }, null, 2),
  },
  {
    platform: 'Custom Application (JSON-RPC)',
    config: `curl -X POST https://api.globalwebindex.com/v1/spark-api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_SPARK_API_TOKEN" \\
  -d '{
    "jsonrpc": "2.0",
    "id": "req-001",
    "method": "tools/call",
    "params": {
      "name": "chat_gwi",
      "arguments": {
        "prompt": "Top social platforms for Gen Z in the UK"
      }
    }
  }'`,
  },
];

const integrationCategoryTabs: Array<{ id: 'all' | IntegrationCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'collaboration', label: 'Collaboration' },
  { id: 'crm', label: 'CRM' },
  { id: 'bi', label: 'BI' },
  { id: 'automation', label: 'Automation' },
  { id: 'ai_assistant', label: 'AI' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const actionIconMap: Record<string, React.ReactNode> = {
  created: <Plus size={14} />,
  edited: <Edit3 size={14} />,
  deleted: <Trash2 size={14} />,
  exported: <Download size={14} />,
  viewed: <Eye size={14} />,
  login: <LogIn size={14} />,
  invited: <UserPlus size={14} />,
};

const actionBadgeVariant: Record<string, 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  created: 'success',
  edited: 'info',
  deleted: 'danger',
  exported: 'primary',
  viewed: 'default',
  login: 'default',
  invited: 'warning',
};

const entityIconMap: Record<string, React.ReactNode> = {
  chart: <BarChart3 size={14} />,
  dashboard: <LayoutDashboard size={14} />,
  audience: <Users size={14} />,
  report: <FileText size={14} />,
  crosstab: <Table2 size={14} />,
  system: <Settings2 size={14} />,
  user: <User size={14} />,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Developer Settings Sub-component
// ---------------------------------------------------------------------------

function DeveloperSettings(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const resolveDevSubTab = (value: string | null): 'api-keys' | 'api-usage' | 'mcp' | 'integrations' | 'webhooks' => {
    if (value === 'api-keys' || value === 'api-usage' || value === 'mcp' || value === 'integrations' || value === 'webhooks') {
      return value;
    }
    return 'api-keys';
  };
  const [devSubTab, setDevSubTab] = useState<'api-keys' | 'api-usage' | 'mcp' | 'integrations' | 'webhooks'>(
    () => resolveDevSubTab(searchParams.get('dev_sub_tab'))
  );
  const requestedDevSubTab = searchParams.get('dev_sub_tab');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'platform' | 'spark' | 'both'>('platform');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedMcpTool, setExpandedMcpTool] = useState<string | null>(null);
  const [activeSnippet, setActiveSnippet] = useState(0);
  const [mcpTestStatus, setMcpTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [integrationCategory, setIntegrationCategory] = useState<'all' | IntegrationCategory>('all');
  const [selectedIntegrationAppId, setSelectedIntegrationAppId] = useState<IntegrationAppId | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationScopeType, setIntegrationScopeType] = useState<'workspace' | 'project'>('workspace');
  const { rateLimit } = useAuthStore();
  const currentUser = useAuthStore((s) => s.user);
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId);

  const { data: integrationCatalog = [] } = useIntegrationCatalog();
  const { data: integrationConnections = [] } = useIntegrationConnections();
  const { data: integrationActivity = [] } = useIntegrationDeliveryHistory();
  const connectIntegration = useConnectIntegration();
  const disconnectIntegration = useDisconnectIntegration();
  const testIntegration = useTestIntegrationConnection();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!requestedDevSubTab) return;
    setDevSubTab(resolveDevSubTab(requestedDevSubTab));
  }, [requestedDevSubTab]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    // Simulate key creation
    const prefix = newKeyScope === 'spark' ? 'gwi_sprk_' : 'gwi_plat_';
    const fullKey = `${prefix}${Array.from({ length: 32 }, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('')}`;
    setCreatedKey(fullKey);
    toast.success('API key created successfully');
  };

  const handleCloseCreateModal = () => {
    setShowCreateKeyModal(false);
    setNewKeyName('');
    setNewKeyScope('platform');
    setCreatedKey(null);
  };

  const handleTestMcp = () => {
    setMcpTestStatus('testing');
    setTimeout(() => {
      setMcpTestStatus('success');
      toast.success('MCP endpoint is reachable');
      setTimeout(() => setMcpTestStatus('idle'), 3000);
    }, 1500);
  };

  const getConnectionForApp = (appId: IntegrationAppId): IntegrationConnection | undefined =>
    integrationConnections.find((conn) => conn.app_id === appId);

  const openIntegrationModal = (appId: IntegrationAppId) => {
    setSelectedIntegrationAppId(appId);
    setShowIntegrationModal(true);
    const existing = getConnectionForApp(appId);
    setIntegrationScopeType(existing?.scope_type ?? 'workspace');
  };

  const closeIntegrationModal = () => {
    setShowIntegrationModal(false);
    setSelectedIntegrationAppId(null);
    setIntegrationScopeType('workspace');
  };

  const selectedIntegrationApp = selectedIntegrationAppId
    ? integrationCatalog.find((item) => item.app_id === selectedIntegrationAppId)
    : null;
  const selectedIntegrationConnection = selectedIntegrationAppId
    ? getConnectionForApp(selectedIntegrationAppId)
    : undefined;

  const filteredCatalog = integrationCatalog.filter(
    (item) => integrationCategory === 'all' || item.category === integrationCategory
  );

  const aiCatalog = integrationCatalog.filter((item) => item.category === 'ai_assistant');

  const handleConnectIntegration = () => {
    if (!selectedIntegrationAppId || !currentUser?.name) return;
    if (integrationScopeType === 'project' && !activeProjectId) {
      toast.error('Select an active project first for project-scoped connection');
      return;
    }
    connectIntegration.mutate(
      {
        app_id: selectedIntegrationAppId,
        scope_type: integrationScopeType,
        workspace_id: currentUser.organization_id ?? 'org_gwi_demo',
        project_id: integrationScopeType === 'project' ? activeProjectId ?? undefined : undefined,
        connected_by: currentUser.name,
      },
      {
        onSuccess: () => closeIntegrationModal(),
      }
    );
  };

  const handleDisconnectIntegration = () => {
    if (!selectedIntegrationConnection || !currentUser?.name) return;
    disconnectIntegration.mutate(
      {
        connection_id: selectedIntegrationConnection.id,
        actor: currentUser.name,
      },
      {
        onSuccess: () => closeIntegrationModal(),
      }
    );
  };

  const handleTestIntegration = () => {
    if (!selectedIntegrationConnection) return;
    testIntegration.mutate(selectedIntegrationConnection.id);
  };

  const apiKeyColumns: Column<ApiKeyEntry>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (entry) => (
        <div className="dev-key-name-cell">
          <Key size={14} />
          <span>{entry.name}</span>
        </div>
      ),
    },
    {
      key: 'keyPrefix',
      header: 'Key',
      render: (entry) => (
        <code className="dev-key-code">{entry.keyPrefix}</code>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      render: (entry) => (
        <Badge variant={entry.scope === 'spark' ? 'info' : entry.scope === 'both' ? 'warning' : 'primary'}>
          {entry.scope === 'platform' ? 'Platform API' : entry.scope === 'spark' ? 'Spark API' : 'Both'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry) => (
        <Badge variant={entry.status === 'active' ? 'success' : entry.status === 'revoked' ? 'danger' : 'default'}>
          {entry.status}
        </Badge>
      ),
    },
    {
      key: 'lastUsedAt',
      header: 'Last Used',
      render: (entry) => (
        <span className="dev-key-date">
          {entry.lastUsedAt ? formatRelativeDate(entry.lastUsedAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (entry) => (
        <span className="dev-key-date">{formatDate(entry.createdAt)}</span>
      ),
    },
  ];

  const endpointColumns: Column<ApiUsageEndpoint>[] = [
    {
      key: 'endpoint',
      header: 'Endpoint',
      sortable: true,
      render: (entry) => <code className="dev-endpoint-code">{entry.endpoint}</code>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (entry) => <Badge variant="default">{entry.category}</Badge>,
    },
    {
      key: 'calls',
      header: 'Calls (30d)',
      sortable: true,
      render: (entry) => <strong>{entry.calls.toLocaleString()}</strong>,
    },
    {
      key: 'avgLatency',
      header: 'Avg Latency',
      sortable: true,
      render: (entry) => (
        <span className={entry.avgLatency > 1000 ? 'dev-latency-warn' : ''}>
          {entry.avgLatency}ms
        </span>
      ),
    },
    {
      key: 'errorRate',
      header: 'Error Rate',
      sortable: true,
      render: (entry) => (
        <span className={entry.errorRate > 1 ? 'dev-error-rate-warn' : 'dev-error-rate-ok'}>
          {entry.errorRate}%
        </span>
      ),
    },
  ];

  const webhookColumns: Column<WebhookEntry>[] = [
    {
      key: 'url',
      header: 'Endpoint URL',
      render: (entry) => (
        <code className="dev-webhook-url">{entry.url}</code>
      ),
    },
    {
      key: 'events',
      header: 'Events',
      render: (entry) => (
        <div className="dev-webhook-events">
          {entry.events.map((e) => (
            <Badge key={e} variant="default">{e}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry) => (
        <Badge variant={entry.status === 'active' ? 'success' : entry.status === 'failing' ? 'danger' : 'default'}>
          {entry.status === 'failing' && <AlertTriangle size={12} />}
          {entry.status}
        </Badge>
      ),
    },
    {
      key: 'successRate',
      header: 'Success Rate',
      sortable: true,
      render: (entry) => (
        <span className={entry.successRate < 90 ? 'dev-error-rate-warn' : 'dev-error-rate-ok'}>
          {entry.successRate}%
        </span>
      ),
    },
    {
      key: 'lastTriggeredAt',
      header: 'Last Triggered',
      render: (entry) => (
        <span className="dev-key-date">
          {entry.lastTriggeredAt ? formatRelativeDate(entry.lastTriggeredAt) : 'Never'}
        </span>
      ),
    },
  ];

  const integrationActivityColumns: Column<IntegrationActivity>[] = [
    {
      key: 'type',
      header: 'Action',
      render: (entry) => (
        <Badge variant="default">{entry.type.replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      key: 'app_id',
      header: 'Integration',
      render: (entry) => {
        const app = integrationCatalog.find((item) => item.app_id === entry.app_id);
        return <span>{app?.name ?? entry.app_id}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry) => (
        <Badge variant={entry.status === 'success' ? 'success' : entry.status === 'failed' ? 'danger' : 'warning'}>
          {entry.status}
        </Badge>
      ),
    },
    {
      key: 'retries',
      header: 'Retries',
      render: (entry) => <span>{entry.retries}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
    },
    {
      key: 'created_at',
      header: 'When',
      render: (entry) => <span className="dev-key-date">{formatRelativeDate(entry.created_at)}</span>,
    },
  ];

  // Totals for the usage overview
  const totalCalls = mockApiUsageEndpoints.reduce((sum, ep) => sum + ep.calls, 0);
  const monthlyQuota = 50000;
  const quotaPercent = Math.round((totalCalls / monthlyQuota) * 100);

  return (
    <>
      {/* Sub-navigation for developer sections */}
      <div className="dev-sub-tabs">
        {([
          { id: 'api-keys' as const, label: 'API Keys', icon: <Key size={15} /> },
          { id: 'api-usage' as const, label: 'API Usage', icon: <Activity size={15} /> },
          { id: 'mcp' as const, label: 'MCP Configuration', icon: <Server size={15} /> },
          { id: 'integrations' as const, label: 'Integrations', icon: <Plug size={15} /> },
          { id: 'webhooks' as const, label: 'Webhooks', icon: <Webhook size={15} /> },
        ]).map((t) => (
          <button
            key={t.id}
            className={`dev-sub-tab ${devSubTab === t.id ? 'active' : ''}`}
            onClick={() => setDevSubTab(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- API Keys Section ---- */}
      {devSubTab === 'api-keys' && (
        <div className="settings-section">
          <div className="dev-section-header">
            <div>
              <h2>API Keys</h2>
              <p className="section-description">
                Manage API keys for authenticating with GWI's Platform API and Spark MCP endpoint.
                Keys are scoped to specific APIs and can be revoked at any time.
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateKeyModal(true)}
            >
              Create API Key
            </Button>
          </div>

          <div className="dev-api-info-banner">
            <Server size={16} />
            <div>
              <strong>Base URL:</strong>{' '}
              <code>https://api.globalwebindex.com</code>
              <span className="dev-separator">|</span>
              <strong>Auth:</strong> Bearer token in <code>Authorization</code> header
            </div>
          </div>

          <DataTable
            columns={apiKeyColumns}
            data={mockApiKeys}
            keyField="id"
            emptyMessage="No API keys created yet"
          />

          {/* Create Key Modal */}
          {showCreateKeyModal && (
            <div className="dev-modal-overlay" onClick={handleCloseCreateModal}>
              <div className="dev-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{createdKey ? 'API Key Created' : 'Create New API Key'}</h3>

                {!createdKey ? (
                  <>
                    <div className="dev-modal-field">
                      <Input
                        label="Key Name"
                        placeholder="e.g. Production Platform Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        fullWidth
                      />
                    </div>

                    <div className="dev-modal-field">
                      <label className="input-field__label">API Scope</label>
                      <div className="settings-toggle-group settings-toggle-group--3">
                        {(['platform', 'spark', 'both'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`settings-toggle-btn ${newKeyScope === s ? 'active' : ''}`}
                            onClick={() => setNewKeyScope(s)}
                          >
                            {s === 'platform' ? 'Platform' : s === 'spark' ? 'Spark' : 'Both'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="dev-modal-actions">
                      <Button variant="secondary" onClick={handleCloseCreateModal}>Cancel</Button>
                      <Button variant="primary" icon={<Key size={16} />} onClick={handleCreateKey}>
                        Create Key
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dev-created-key-warning">
                      <AlertTriangle size={16} />
                      <span>Copy this key now. You will not be able to see it again.</span>
                    </div>

                    <div className="dev-created-key-display">
                      <code>{createdKey}</code>
                      <button
                        className="dev-copy-btn"
                        onClick={() => handleCopy(createdKey, 'new-key')}
                      >
                        {copiedId === 'new-key' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="dev-modal-actions">
                      <Button variant="primary" onClick={handleCloseCreateModal}>
                        Done
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- API Usage Section ---- */}
      {devSubTab === 'api-usage' && (
        <div className="settings-section">
          <h2>API Usage</h2>
          <p className="section-description">
            Monitor your organisation's API consumption across Platform API and Spark MCP endpoints.
          </p>

          {/* Usage overview cards */}
          <div className="dev-usage-cards">
            <div className="dev-usage-card">
              <div className="dev-usage-card-header">
                <Zap size={18} />
                <span>Total Calls (30d)</span>
              </div>
              <div className="dev-usage-card-value">{totalCalls.toLocaleString()}</div>
              <div className="dev-usage-card-sub">of {monthlyQuota.toLocaleString()} monthly quota</div>
              <div className="dev-usage-bar">
                <div
                  className={`dev-usage-bar-fill ${quotaPercent > 90 ? 'danger' : quotaPercent > 70 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                />
              </div>
              <div className="dev-usage-card-percent">{quotaPercent}% used</div>
            </div>

            <div className="dev-usage-card">
              <div className="dev-usage-card-header">
                <Activity size={18} />
                <span>Rate Limit</span>
              </div>
              <div className="dev-usage-card-value">
                {rateLimit ? `${rateLimit.remaining} / ${rateLimit.limit}` : '1,000 / 1,000'}
              </div>
              <div className="dev-usage-card-sub">requests remaining in current window</div>
              {rateLimit?.reset && (
                <div className="dev-usage-card-sub">
                  Resets: {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
                </div>
              )}
            </div>

            <div className="dev-usage-card">
              <div className="dev-usage-card-header">
                <Server size={18} />
                <span>Active Keys</span>
              </div>
              <div className="dev-usage-card-value">
                {mockApiKeys.filter((k) => k.status === 'active').length}
              </div>
              <div className="dev-usage-card-sub">
                {mockApiKeys.filter((k) => k.status === 'revoked').length} revoked, {mockApiKeys.filter((k) => k.status === 'expired').length} expired
              </div>
            </div>
          </div>

          {/* Usage chart */}
          <div className="settings-usage-chart">
            <h3 className="settings-subsection-title">API Calls Over Time</h3>
            <ChartRenderer
              type="area"
              data={mockApiUsageChart}
              series={['Platform API', 'Spark MCP']}
              height={280}
              showLegend
              showGrid
            />
          </div>

          {/* Endpoint breakdown */}
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 className="settings-subsection-title">Endpoint Breakdown (Last 30 Days)</h3>
            <DataTable
              columns={endpointColumns}
              data={mockApiUsageEndpoints}
              keyField="id"
              emptyMessage="No API usage data"
            />
          </div>
        </div>
      )}

      {/* ---- MCP Configuration Section ---- */}
      {devSubTab === 'mcp' && (
        <div className="settings-section">
          <h2>MCP Configuration</h2>
          <p className="section-description">
            Configure the GWI Spark MCP (Model Context Protocol) server to integrate consumer insights
            into AI assistants like Claude, ChatGPT, Copilot Studio, and custom applications.
          </p>

          {/* MCP Endpoint Info */}
          <div className="dev-mcp-endpoint-card">
            <div className="dev-mcp-endpoint-header">
              <Server size={18} />
              <h3>MCP Server Endpoint</h3>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="dev-mcp-endpoint-url">
              <code>https://api.globalwebindex.com/v1/spark-api/mcp</code>
              <button
                className="dev-copy-btn"
                onClick={() => handleCopy('https://api.globalwebindex.com/v1/spark-api/mcp', 'mcp-url')}
              >
                {copiedId === 'mcp-url' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="dev-mcp-endpoint-meta">
              <span><strong>Protocol:</strong> JSON-RPC 2.0</span>
              <span><strong>Auth:</strong> Bearer Token (Spark API key)</span>
              <span><strong>Method:</strong> POST</span>
            </div>
            <div className="dev-mcp-test">
              <Button
                variant="secondary"
                icon={mcpTestStatus === 'testing' ? <Loader2 size={16} className="settings-spinner" /> : <RefreshCw size={16} />}
                onClick={handleTestMcp}
                disabled={mcpTestStatus === 'testing'}
              >
                {mcpTestStatus === 'testing' ? 'Testing...' : mcpTestStatus === 'success' ? 'Connected' : 'Test Connection'}
              </Button>
              {mcpTestStatus === 'success' && (
                <span className="dev-mcp-test-success">
                  <Check size={14} /> Endpoint reachable
                </span>
              )}
            </div>
          </div>

          {/* Available Tools */}
          <div className="dev-mcp-tools">
            <h3 className="settings-subsection-title">Available MCP Tools</h3>
            <p className="dev-mcp-tools-desc">
              The GWI Spark MCP server exposes two tools for querying consumer audience data.
            </p>

            {mcpTools.map((tool) => (
              <div key={tool.name} className="dev-mcp-tool-card">
                <button
                  className="dev-mcp-tool-header"
                  onClick={() => setExpandedMcpTool(expandedMcpTool === tool.name ? null : tool.name)}
                >
                  <div className="dev-mcp-tool-title">
                    <MessageSquare size={16} />
                    <code className="dev-mcp-tool-name">{tool.name}</code>
                  </div>
                  {expandedMcpTool === tool.name ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <p className="dev-mcp-tool-desc">{tool.description}</p>

                {expandedMcpTool === tool.name && (
                  <div className="dev-mcp-tool-details">
                    <div className="dev-mcp-tool-params">
                      <h4>Parameters</h4>
                      <table className="dev-mcp-params-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Required</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tool.parameters.map((p) => (
                            <tr key={p.name}>
                              <td><code>{p.name}</code></td>
                              <td>
                                <Badge variant={p.required ? 'danger' : 'default'}>
                                  {p.required ? 'required' : 'optional'}
                                </Badge>
                              </td>
                              <td>{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="dev-mcp-tool-example">
                      <div className="dev-mcp-tool-example-header">
                        <h4>Example Request</h4>
                        <button
                          className="dev-copy-btn"
                          onClick={() => handleCopy(tool.exampleRequest, `example-${tool.name}`)}
                        >
                          {copiedId === `example-${tool.name}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <pre className="dev-code-block">{tool.exampleRequest}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Integration Snippets */}
          <div className="dev-mcp-integrations">
            <h3 className="settings-subsection-title">Integration Guides</h3>
            <p className="dev-mcp-tools-desc">
              Quick-start configuration snippets for connecting GWI Spark MCP to various AI platforms.
            </p>

            <div className="dev-mcp-integration-tabs">
              {mcpIntegrationSnippets.map((snippet, idx) => (
                <button
                  key={snippet.platform}
                  className={`dev-sub-tab ${activeSnippet === idx ? 'active' : ''}`}
                  onClick={() => setActiveSnippet(idx)}
                >
                  {snippet.platform}
                </button>
              ))}
            </div>

            <div className="dev-mcp-snippet-container">
              <div className="dev-mcp-snippet-header">
                <span>{mcpIntegrationSnippets[activeSnippet].platform}</span>
                <button
                  className="dev-copy-btn"
                  onClick={() => handleCopy(mcpIntegrationSnippets[activeSnippet].config, `snippet-${activeSnippet}`)}
                >
                  {copiedId === `snippet-${activeSnippet}` ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <pre className="dev-code-block">{mcpIntegrationSnippets[activeSnippet].config}</pre>
            </div>

            {/* AI Assistant Connections */}
            <div className="dev-mcp-platforms">
              <h4>AI Assistant Connections</h4>
              <div className="dev-mcp-platform-grid">
                {aiCatalog.map((platform) => {
                  const conn = getConnectionForApp(platform.app_id);
                  return (
                    <div key={platform.app_id} className="dev-mcp-platform-item">
                      <strong>{platform.name}</strong>
                      <span>{conn?.status === 'connected' ? 'Connected via Marketplace' : 'Not connected'}</span>
                      <div className="dev-mcp-platform-actions">
                        {platform.setup_guide_url && (
                          <button
                            className="dev-inline-link"
                            onClick={() => window.open(platform.setup_guide_url, '_blank', 'noopener,noreferrer')}
                          >
                            Open setup guide
                          </button>
                        )}
                        <button
                          className="dev-inline-link"
                          onClick={() => {
                            setDevSubTab('integrations');
                            openIntegrationModal(platform.app_id);
                          }}
                        >
                          Manage in Marketplace
                        </button>
                      </div>
                    </div>
                  );
                })}
                {aiCatalog.length === 0 && (
                  <div className="dev-mcp-platform-item">
                    <strong>No AI assistant integrations configured</strong>
                    <span>Open Marketplace to add assistant connectors.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Integrations Section ---- */}
      {devSubTab === 'integrations' && (
        <div className="settings-section">
          <div className="dev-section-header">
            <div>
              <h2>Integration Marketplace</h2>
              <p className="section-description">
                Connect workspace tools and route Spark outputs, audience syncs, and scheduled reports.
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div className="dev-api-info-banner">
              <AlertTriangle size={16} />
              <div>
                You have view-only access. Only admins can connect or disconnect integrations.
              </div>
            </div>
          )}

          <div className="dev-integration-filter-tabs">
            {integrationCategoryTabs.map((tab) => (
              <button
                key={tab.id}
                className={`dev-sub-tab ${integrationCategory === tab.id ? 'active' : ''}`}
                onClick={() => setIntegrationCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="dev-integration-grid">
            {filteredCatalog.map((item) => {
              const connection = getConnectionForApp(item.app_id);
              const status = connection?.status ?? 'not_connected';
              return (
                <div key={item.app_id} className="dev-integration-card">
                  <div className="dev-integration-card-header">
                    <div className="dev-integration-card-title">
                      <span className="dev-integration-logo">{item.logo_text}</span>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Badge variant={status === 'connected' ? 'success' : status === 'error' ? 'danger' : 'default'}>
                      {status === 'not_connected' ? 'Not connected' : status}
                    </Badge>
                  </div>
                  <p className="dev-integration-desc">{item.description}</p>
                  <div className="dev-integration-capabilities">
                    {item.capabilities.slice(0, 4).map((cap) => (
                      <Badge key={cap} variant="default">{cap.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                  <div className="dev-integration-actions">
                    <Button
                      variant="secondary"
                      onClick={() => openIntegrationModal(item.app_id)}
                    >
                      {connection ? 'Manage Connection' : 'Connect'}
                    </Button>
                    {item.setup_guide_url && (
                      <button
                        className="dev-inline-link"
                        onClick={() => window.open(item.setup_guide_url, '_blank', 'noopener,noreferrer')}
                      >
                        Setup Guide
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 className="settings-subsection-title">Integration Activity</h3>
            <DataTable
              columns={integrationActivityColumns}
              data={integrationActivity}
              keyField="id"
              emptyMessage="No integration activity yet"
            />
          </div>

          {showIntegrationModal && selectedIntegrationApp && (
            <div className="dev-modal-overlay" onClick={closeIntegrationModal}>
              <div className="dev-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{selectedIntegrationApp.name}</h3>
                <p className="section-description" style={{ marginTop: 0 }}>{selectedIntegrationApp.description}</p>

                <div className="dev-modal-field">
                  <label className="input-field__label">Connection Scope</label>
                  <div className="settings-toggle-group settings-toggle-group--3">
                    {(['workspace', 'project'] as const).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        className={`settings-toggle-btn ${integrationScopeType === scope ? 'active' : ''}`}
                        onClick={() => setIntegrationScopeType(scope)}
                        disabled={!isAdmin}
                      >
                        {scope === 'workspace' ? 'Workspace' : 'Project'}
                      </button>
                    ))}
                  </div>
                  {integrationScopeType === 'project' && !activeProjectId && (
                    <p className="settings-help-text">No active project selected. Pick one from the sidebar project switcher.</p>
                  )}
                </div>

                <div className="dev-modal-field">
                  <label className="input-field__label">Connection Status</label>
                  <div className="dev-integration-status-row">
                    <Badge variant={selectedIntegrationConnection?.status === 'connected' ? 'success' : selectedIntegrationConnection?.status === 'error' ? 'danger' : 'default'}>
                      {selectedIntegrationConnection?.status ?? 'not connected'}
                    </Badge>
                    {selectedIntegrationConnection?.last_tested_at && (
                      <span className="dev-key-date">Last tested {formatRelativeDate(selectedIntegrationConnection.last_tested_at)}</span>
                    )}
                  </div>
                  {selectedIntegrationConnection?.last_error && (
                    <div className="dev-created-key-warning">
                      <AlertTriangle size={16} />
                      <span>{selectedIntegrationConnection.last_error}</span>
                    </div>
                  )}
                </div>

                <div className="dev-modal-actions">
                  <Button variant="secondary" onClick={closeIntegrationModal}>
                    Close
                  </Button>
                  {selectedIntegrationConnection && (
                    <Button
                      variant="secondary"
                      icon={<RefreshCw size={16} />}
                      onClick={handleTestIntegration}
                      disabled={testIntegration.isPending}
                    >
                      {testIntegration.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                  )}
                  {selectedIntegrationConnection ? (
                    <Button
                      variant="danger"
                      onClick={handleDisconnectIntegration}
                      disabled={!isAdmin || disconnectIntegration.isPending}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      icon={<Plug size={16} />}
                      onClick={handleConnectIntegration}
                      disabled={!isAdmin || connectIntegration.isPending || (integrationScopeType === 'project' && !activeProjectId)}
                    >
                      {connectIntegration.isPending ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Webhooks Section ---- */}
      {devSubTab === 'webhooks' && (
        <div className="settings-section">
          <div className="dev-section-header">
            <div>
              <h2>Webhooks</h2>
              <p className="section-description">
                Configure webhook endpoints to receive real-time notifications when events occur in your GWI workspace.
              </p>
            </div>
            <Button variant="primary" icon={<Plus size={16} />}>
              Add Webhook
            </Button>
          </div>

          <div className="dev-webhook-events-info">
            <h3 className="settings-subsection-title">Available Events</h3>
            <div className="dev-webhook-event-list">
              {[
                { event: 'data.updated', description: 'New survey data wave is published' },
                { event: 'wave.published', description: 'A research wave becomes available' },
                { event: 'export.complete', description: 'A data export finishes processing' },
                { event: 'audience.created', description: 'A new audience segment is created' },
                { event: 'audience.changed', description: 'An audience definition is modified' },
                { event: 'crosstab.complete', description: 'A crosstab query finishes running' },
              ].map((ev) => (
                <div key={ev.event} className="dev-webhook-event-item">
                  <code>{ev.event}</code>
                  <span>{ev.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 className="settings-subsection-title">Configured Webhooks</h3>
            <DataTable
              columns={webhookColumns}
              data={mockWebhooks}
              keyField="id"
              emptyMessage="No webhooks configured yet"
            />
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Settings(): React.JSX.Element {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const initialTab = tab && settingsTabs.some((t) => t.id === tab) ? tab : 'profile';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { user: storeUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Merge profile API data with store data; prefer API, fall back to store, then defaults
  const currentUser: Partial<UserType> = profile ?? storeUser ?? {};

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    organization_name: '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    locale: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultWave: 'Q4 2025',
    defaultLocation: 'Global',
    chartPalette: 'default' as 'default' | 'colorblind' | 'high-contrast' | 'monochrome',
    keyboardShortcuts: true,
    notifyEmail: true,
    notifyInApp: true,
  });

  // Audit log filters
  const [auditActionFilter, setAuditActionFilter] = useState<string>('');
  const [auditEntityFilter, setAuditEntityFilter] = useState<string>('');

  // Sync form data when profile loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        organization_name: currentUser.organization_name || '',
      });
      if (currentUser.preferences) {
        setPreferences((prev) => ({
          ...prev,
          theme: currentUser.preferences?.theme || prev.theme,
          locale: currentUser.preferences?.locale || prev.locale,
          timezone: currentUser.preferences?.timezone || prev.timezone,
        }));
      }
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.organization_name]);

  // Sync active tab when URL param changes
  useEffect(() => {
    if (tab && settingsTabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/app/account-settings/${tabId}`, { replace: true });
  };

  // Profile update mutation
  const updateProfile = useMutation({
    mutationFn: (data: Partial<UserType>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      useAuthStore.getState().setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  // Preferences update mutation
  const updatePreferences = useMutation({
    mutationFn: (data: Partial<UserType>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      useAuthStore.getState().setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: formData.name,
      email: formData.email,
    });
  };

  const handleSavePreferences = () => {
    updatePreferences.mutate({
      preferences: {
        theme: preferences.theme === 'system' ? 'light' : preferences.theme,
        locale: preferences.locale,
        timezone: preferences.timezone,
      },
    });
  };

  // Filtered audit log
  const filteredAuditLog = mockAuditLog.filter((entry) => {
    if (auditActionFilter && entry.action !== auditActionFilter) return false;
    if (auditEntityFilter && entry.entityType !== auditEntityFilter) return false;
    return true;
  });

  // Grouped shortcuts
  const shortcutCategories = Array.from(new Set(mockShortcuts.map((s) => s.category)));

  // Audit log columns
  const auditColumns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      width: '160px',
      render: (entry) => (
        <span className="settings-audit-time" title={entry.timestamp}>
          <Clock size={13} />
          {formatRelativeDate(entry.timestamp)}
        </span>
      ),
    },
    { key: 'user', header: 'User', sortable: true },
    {
      key: 'action',
      header: 'Action',
      render: (entry) => (
        <Badge variant={actionBadgeVariant[entry.action] || 'default'}>
          <span className="settings-audit-action-inner">
            {actionIconMap[entry.action]}
            {entry.action}
          </span>
        </Badge>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      render: (entry) => (
        <span className="settings-audit-entity">
          {entityIconMap[entry.entityType]}
          {entry.entityType}
        </span>
      ),
    },
    { key: 'entityName', header: 'Entity Name', sortable: true },
    {
      key: 'details',
      header: 'Details',
      render: (entry) => (
        <span className="settings-audit-details">{entry.details}</span>
      ),
    },
  ];

  // Top users columns
  const topUserColumns: Column<TopUser>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    {
      key: 'queries',
      header: 'Queries',
      sortable: true,
      render: (u) => <strong>{u.queries.toLocaleString()}</strong>,
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (u) => formatRelativeDate(u.lastActive),
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Account Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          <Tabs
            tabs={settingsTabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            orientation="vertical"
          />
        </nav>

        <div className="settings-content">

          {/* ================================================================
              Profile Tab
              ================================================================ */}
          {activeTab === 'profile' && (
            <>
              <div className="settings-section">
                <h2>Profile Details</h2>
                <p className="section-description">Your personal information and account details</p>

                {profileLoading && (
                  <div className="settings-loading">
                    <Loader2 size={24} className="settings-spinner" />
                    <span>Loading profile...</span>
                  </div>
                )}

                {profileError && (
                  <div className="settings-error">
                    Failed to load profile. Showing cached data.
                  </div>
                )}

                {/* Profile card with avatar */}
                <div className="settings-profile-card">
                  <div className="settings-profile-avatar">
                    <span className="settings-profile-initials">
                      {getInitials(currentUser?.name || 'U')}
                    </span>
                  </div>
                  <div className="settings-profile-info">
                    <h3 className="settings-profile-name">{currentUser?.name || 'Unknown User'}</h3>
                    <p className="settings-profile-email">{currentUser?.email || '--'}</p>
                    <div className="settings-profile-badges">
                      <Badge variant="primary">{currentUser?.role || 'analyst'}</Badge>
                      <span className="settings-profile-org">
                        <Building2 size={14} />
                        {currentUser?.organization_name || 'Organisation'}
                      </span>
                    </div>
                    <p className="settings-profile-lastlogin">
                      <Clock size={13} />
                      Last login: {currentUser?.last_login_at ? formatDate(currentUser.last_login_at) : 'Today'}
                    </p>
                  </div>
                </div>

                <form className="settings-form" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  <div className="form-row">
                    <Input
                      label="Full name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      fullWidth
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                  />

                  <Input
                    label="Organisation"
                    type="text"
                    value={formData.organization_name}
                    disabled
                    hint="Contact your admin to change the organisation name"
                    fullWidth
                  />

                  <Input
                    label="Role"
                    type="text"
                    value={currentUser?.role || 'analyst'}
                    disabled
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Save size={16} />}
                    loading={updateProfile.isPending}
                  >
                    Save changes
                  </Button>
                </form>
              </div>

              {/* Security Section */}
              <div className="settings-section">
                <h2>Security</h2>
                <p className="section-description">Manage your password and security settings</p>

                <div className="security-option">
                  <div className="security-info">
                    <h3>Password</h3>
                    <p>Last changed 3 months ago</p>
                  </div>
                  <Button variant="secondary" icon={<Shield size={16} />}>
                    Change password
                  </Button>
                </div>

                <div className="security-option">
                  <div className="security-info">
                    <h3>Two-factor authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="secondary">Enable</Button>
                </div>
              </div>
            </>
          )}

          {/* ================================================================
              Organization Tab
              ================================================================ */}
          {activeTab === 'organization' && (
            <div className="settings-section">
              <UserManagement />
            </div>
          )}

          {/* ================================================================
              Usage Tab
              ================================================================ */}
          {activeTab === 'usage' && (
            <div className="settings-section">
              <h2>Usage Statistics</h2>
              <p className="section-description">Monitor your organisation's platform usage</p>
              <UsageStats />

              {/* Usage over time chart */}
              <div className="settings-usage-chart">
                <h3 className="settings-subsection-title">Queries Over Time (This Week)</h3>
                <ChartRenderer
                  type="area"
                  data={mockUsageChartData}
                  series={['Queries']}
                  height={280}
                  showLegend={false}
                  showGrid
                />
              </div>

              {/* Top users table */}
              <div className="settings-usage-topusers">
                <h3 className="settings-subsection-title">Top Users</h3>
                <DataTable
                  columns={topUserColumns}
                  data={mockTopUsers}
                  keyField="id"
                  emptyMessage="No usage data available"
                />
              </div>
            </div>
          )}

          {/* ================================================================
              Preferences Tab
              ================================================================ */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Preferences</h2>
              <p className="section-description">Customise your platform experience</p>

              <form className="settings-form settings-form--wide" onSubmit={(e) => { e.preventDefault(); handleSavePreferences(); }}>
                {/* Theme selector */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Palette size={15} />
                    Theme
                  </label>
                  <div className="settings-toggle-group settings-toggle-group--3">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`settings-toggle-btn ${preferences.theme === t ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, theme: t })}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default wave */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Globe size={15} />
                    Default Wave
                  </label>
                  <select
                    className="settings-select"
                    value={preferences.defaultWave}
                    onChange={(e) => setPreferences({ ...preferences, defaultWave: e.target.value })}
                  >
                    <option value="Q4 2025">Q4 2025</option>
                    <option value="Q3 2025">Q3 2025</option>
                    <option value="Q2 2025">Q2 2025</option>
                    <option value="Q1 2025">Q1 2025</option>
                  </select>
                </div>

                {/* Default location */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Globe size={15} />
                    Default Location
                  </label>
                  <select
                    className="settings-select"
                    value={preferences.defaultLocation}
                    onChange={(e) => setPreferences({ ...preferences, defaultLocation: e.target.value })}
                  >
                    <option value="Global">Global</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                {/* Chart color palette */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Palette size={15} />
                    Chart Color Palette
                  </label>
                  <div className="settings-palette-options">
                    {([
                      { value: 'default', label: 'Default', colors: ['#E31C79', '#0ea5e9', '#22c55e', '#f59e0b'] },
                      { value: 'colorblind', label: 'Colorblind Safe', colors: ['#0072B2', '#E69F00', '#009E73', '#CC79A7'] },
                      { value: 'high-contrast', label: 'High Contrast', colors: ['#000000', '#E31C79', '#0000FF', '#FF0000'] },
                      { value: 'monochrome', label: 'Monochrome', colors: ['#1f2937', '#4b5563', '#9ca3af', '#d1d5db'] },
                    ] as const).map((palette) => (
                      <button
                        key={palette.value}
                        type="button"
                        className={`settings-palette-btn ${preferences.chartPalette === palette.value ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, chartPalette: palette.value })}
                      >
                        <div className="settings-palette-swatches">
                          {palette.colors.map((c, i) => (
                            <span key={i} className="settings-palette-swatch" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="settings-palette-label">{palette.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard shortcuts toggle */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Keyboard size={15} />
                    Keyboard Shortcuts
                  </label>
                  <div className="settings-toggle-row">
                    <button
                      type="button"
                      className={`settings-switch ${preferences.keyboardShortcuts ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, keyboardShortcuts: !preferences.keyboardShortcuts })}
                      role="switch"
                      aria-checked={preferences.keyboardShortcuts}
                    >
                      <span className="settings-switch-thumb" />
                    </button>
                    <span className="settings-toggle-label">
                      {preferences.keyboardShortcuts ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="form-group">
                  <label className="input-field__label">
                    <Bell size={15} />
                    Notifications
                  </label>
                  <div className="settings-notification-options">
                    <div className="settings-toggle-row">
                      <button
                        type="button"
                        className={`settings-switch ${preferences.notifyEmail ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, notifyEmail: !preferences.notifyEmail })}
                        role="switch"
                        aria-checked={preferences.notifyEmail}
                      >
                        <span className="settings-switch-thumb" />
                      </button>
                      <span className="settings-toggle-label">
                        <Mail size={14} />
                        Email notifications
                      </span>
                    </div>
                    <div className="settings-toggle-row">
                      <button
                        type="button"
                        className={`settings-switch ${preferences.notifyInApp ? 'active' : ''}`}
                        onClick={() => setPreferences({ ...preferences, notifyInApp: !preferences.notifyInApp })}
                        role="switch"
                        aria-checked={preferences.notifyInApp}
                      >
                        <span className="settings-switch-thumb" />
                      </button>
                      <span className="settings-toggle-label">
                        <Bell size={14} />
                        In-app notifications
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save size={16} />}
                  loading={updatePreferences.isPending}
                >
                  Save preferences
                </Button>
              </form>
            </div>
          )}

          {/* ================================================================
              Audit Log Tab
              ================================================================ */}
          {activeTab === 'audit-log' && (
            <div className="settings-section">
              <h2>Audit Log</h2>
              <p className="section-description">Track all actions performed across your organisation</p>

              <div className="settings-audit-filters">
                <select
                  className="settings-select"
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                >
                  <option value="">All actions</option>
                  <option value="created">Created</option>
                  <option value="edited">Edited</option>
                  <option value="deleted">Deleted</option>
                  <option value="exported">Exported</option>
                  <option value="viewed">Viewed</option>
                  <option value="login">Login</option>
                  <option value="invited">Invited</option>
                </select>
                <select
                  className="settings-select"
                  value={auditEntityFilter}
                  onChange={(e) => setAuditEntityFilter(e.target.value)}
                >
                  <option value="">All entity types</option>
                  <option value="chart">Chart</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="audience">Audience</option>
                  <option value="crosstab">Crosstab</option>
                  <option value="report">Report</option>
                  <option value="system">System</option>
                  <option value="user">User</option>
                </select>
              </div>

              <DataTable
                columns={auditColumns}
                data={filteredAuditLog}
                keyField="id"
                emptyMessage="No audit log entries match your filters"
              />
            </div>
          )}

          {/* ================================================================
              Keyboard Shortcuts Tab
              ================================================================ */}
          {activeTab === 'shortcuts' && (
            <div className="settings-section">
              <h2>Keyboard Shortcuts</h2>
              <p className="section-description">Quick reference for all available keyboard shortcuts</p>

              <div className="settings-shortcuts-list">
                {shortcutCategories.map((category) => (
                  <div key={category} className="settings-shortcuts-group">
                    <h3 className="settings-shortcuts-category">{category}</h3>
                    <div className="settings-shortcuts-items">
                      {mockShortcuts
                        .filter((s) => s.category === category)
                        .map((shortcut) => (
                          <div key={shortcut.id} className="settings-shortcut-row">
                            <span className="settings-shortcut-desc">{shortcut.description}</span>
                            <kbd className="settings-shortcut-keys">
                              {shortcut.keys.split('+').map((k, i, arr) => (
                                <span key={i}>
                                  <span className="settings-kbd">{k.trim()}</span>
                                  {i < arr.length - 1 && <span className="settings-kbd-plus">+</span>}
                                </span>
                              ))}
                            </kbd>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              Developer Tab
              ================================================================ */}
          {activeTab === 'developer' && (
            <DeveloperSettings />
          )}
        </div>
      </div>
    </div>
  );
}
