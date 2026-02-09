import type { LucideIcon } from 'lucide-react';
import {
  Microscope, Users, BarChart3, TrendingUp, Target,
  Shield, ClipboardList, Layers, Globe, Radio,
  Heart, ShoppingCart, Sparkles, Plus,
} from 'lucide-react';

export type AgentCategory =
  | 'Research & Insights'
  | 'Audience Building'
  | 'Data Analysis'
  | 'Campaign & Media'
  | 'Industry Specialists';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  capabilities: string[];
  status?: 'popular' | 'new';
  examplePrompt: string;
  suggestedPrompts: { icon: LucideIcon; text: string }[];
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  'Research & Insights',
  'Audience Building',
  'Data Analysis',
  'Campaign & Media',
  'Industry Specialists',
];

export const agents: Agent[] = [
  {
    id: 'consumer-insights-analyst',
    name: 'Consumer Insights Analyst',
    description: 'Deep-dive into consumer behavior, trends, and market shifts across 50+ markets',
    category: 'Research & Insights',
    icon: Microscope,
    iconColor: '#7c3aed',
    iconBg: '#ede9fe',
    capabilities: ['Behavioral analysis', 'Market trends', 'Cross-market data'],
    status: 'popular',
    examplePrompt: 'What are the top consumer behavior shifts in APAC this quarter?',
    suggestedPrompts: [
      { icon: TrendingUp, text: 'What are the key consumer trends across markets for Q4 2024?' },
      { icon: Microscope, text: 'Analyze social media usage patterns among Gen Z in Europe' },
      { icon: Globe, text: 'Compare consumer confidence levels across US, UK, and Germany' },
      { icon: BarChart3, text: 'Show me the top 5 behavioral shifts in the APAC region this year' },
    ],
  },
  {
    id: 'audience-architect',
    name: 'Audience Architect',
    description: 'Build, refine, and validate audience segments with data-backed precision',
    category: 'Audience Building',
    icon: Users,
    iconColor: '#0891b2',
    iconBg: '#ecfeff',
    capabilities: ['Segment builder', 'Validation', 'Persona mapping'],
    status: 'popular',
    examplePrompt: 'Build me an audience of health-conscious millennials who use TikTok',
    suggestedPrompts: [
      { icon: Users, text: 'Build a target audience of eco-conscious Gen Z shoppers in the US' },
      { icon: Target, text: 'Validate my "Premium Tech Buyers" segment with GWI data' },
      { icon: Layers, text: 'Create a persona map for luxury brand consumers aged 25-44' },
      { icon: BarChart3, text: 'What are the defining characteristics of podcast power listeners?' },
    ],
  },
  {
    id: 'data-visualizer',
    name: 'Data Visualizer',
    description: 'Transform raw data into compelling charts, crosstabs, and dashboards',
    category: 'Data Analysis',
    icon: BarChart3,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    capabilities: ['Chart builder', 'Crosstabs', 'Dashboard creation'],
    status: 'popular',
    examplePrompt: 'Create a chart showing streaming platform usage by age group',
    suggestedPrompts: [
      { icon: BarChart3, text: 'Create a bar chart comparing social media platform usage by generation' },
      { icon: BarChart3, text: 'Build a crosstab of brand awareness across age groups for Nike vs Adidas' },
      { icon: BarChart3, text: 'Visualize the relationship between income levels and streaming habits' },
      { icon: BarChart3, text: 'Generate a dashboard showing key media consumption metrics for Q4' },
    ],
  },
  {
    id: 'trend-forecaster',
    name: 'Trend Forecaster',
    description: 'Identify emerging trends and predict consumer behavior shifts',
    category: 'Research & Insights',
    icon: TrendingUp,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    capabilities: ['Trend detection', 'Forecasting', 'Signal analysis'],
    status: 'new',
    examplePrompt: 'What emerging trends should brands watch in the next 6 months?',
    suggestedPrompts: [
      { icon: TrendingUp, text: 'What are the top 5 emerging consumer trends for 2025?' },
      { icon: TrendingUp, text: 'Predict social media platform growth trajectories for the next year' },
      { icon: Microscope, text: 'Identify early signals of changing media consumption habits in Europe' },
      { icon: Target, text: 'Which consumer behaviors are showing the strongest upward momentum?' },
    ],
  },
  {
    id: 'campaign-strategist',
    name: 'Campaign Strategist',
    description: 'Optimize media planning with data-driven channel and audience recommendations',
    category: 'Campaign & Media',
    icon: Target,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    capabilities: ['Media planning', 'Channel strategy', 'Audience targeting'],
    examplePrompt: 'Recommend the best channels to reach millennial parents in the UK',
    suggestedPrompts: [
      { icon: Target, text: 'Recommend the optimal media mix to reach Gen Z gamers in the US' },
      { icon: Radio, text: 'Which channels have the highest ad receptivity among 25-34 year olds?' },
      { icon: Users, text: 'Build a targeting strategy for health-conscious consumers across digital' },
      { icon: BarChart3, text: 'Compare ROI potential across social, video, and audio channels for my audience' },
    ],
  },
  {
    id: 'competitive-intel-agent',
    name: 'Competitive Intel Agent',
    description: 'Analyze brand positioning, share of voice, and competitive landscapes',
    category: 'Research & Insights',
    icon: Shield,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    capabilities: ['Brand tracking', 'Share of voice', 'Competitive analysis'],
    examplePrompt: 'Compare brand perception of Nike vs Adidas among 18-34 year olds',
    suggestedPrompts: [
      { icon: Shield, text: 'Analyze the competitive landscape for streaming services in Europe' },
      { icon: BarChart3, text: 'Compare brand health metrics for Coca-Cola vs Pepsi globally' },
      { icon: TrendingUp, text: 'Track share of voice trends for top 5 smartphone brands' },
      { icon: Target, text: 'Identify white space opportunities in the fitness apparel market' },
    ],
  },
  {
    id: 'survey-designer',
    name: 'Survey Designer',
    description: 'Design effective survey questions aligned with GWI taxonomy',
    category: 'Research & Insights',
    icon: ClipboardList,
    iconColor: '#9333ea',
    iconBg: '#faf5ff',
    capabilities: ['Question design', 'GWI taxonomy', 'Survey logic'],
    status: 'new',
    examplePrompt: 'Help me design survey questions about streaming service preferences',
    suggestedPrompts: [
      { icon: ClipboardList, text: 'Design survey questions to measure brand awareness for a CPG brand' },
      { icon: ClipboardList, text: 'Create a screening questionnaire for premium travel consumers' },
      { icon: Microscope, text: 'Map my custom questions to existing GWI taxonomy datapoints' },
      { icon: ClipboardList, text: 'Build a survey flow to understand purchase decision drivers' },
    ],
  },
  {
    id: 'audience-overlap-analyzer',
    name: 'Audience Overlap Analyzer',
    description: 'Detect and resolve segment overlaps, find look-alike audiences',
    category: 'Audience Building',
    icon: Layers,
    iconColor: '#0d9488',
    iconBg: '#f0fdfa',
    capabilities: ['Overlap detection', 'Look-alikes', 'Segment optimization'],
    examplePrompt: 'Check overlap between my Tech Enthusiasts and Early Adopters audiences',
    suggestedPrompts: [
      { icon: Layers, text: 'Analyze overlap between my "Fitness Fans" and "Health-Conscious" audiences' },
      { icon: Users, text: 'Find look-alike audiences similar to my top-performing customer segment' },
      { icon: BarChart3, text: 'Identify unique traits that differentiate my overlapping segments' },
      { icon: Target, text: 'Recommend how to refine my audience segments to reduce overlap' },
    ],
  },
  {
    id: 'cross-market-comparator',
    name: 'Cross-Market Comparator',
    description: 'Compare consumer data across regions, demographics, and time periods',
    category: 'Data Analysis',
    icon: Globe,
    iconColor: '#0369a1',
    iconBg: '#f0f9ff',
    capabilities: ['Regional comparison', 'Demographic splits', 'Trend analysis'],
    examplePrompt: 'Compare online shopping behavior in the UK, Germany, and France',
    suggestedPrompts: [
      { icon: Globe, text: 'Compare social media platform preferences across US, UK, Japan, and Brazil' },
      { icon: BarChart3, text: 'Show demographic differences in streaming service adoption across EU5' },
      { icon: TrendingUp, text: 'Track how fitness trends differ between APAC and North America' },
      { icon: Globe, text: 'Compare Gen Z attitudes toward sustainability across 10 key markets' },
    ],
  },
  {
    id: 'media-mix-optimizer',
    name: 'Media Mix Optimizer',
    description: 'Balance TV, digital, social, and print allocation using consumption data',
    category: 'Campaign & Media',
    icon: Radio,
    iconColor: '#b91c1c',
    iconBg: '#fef2f2',
    capabilities: ['Media allocation', 'Channel optimization', 'Budget planning'],
    examplePrompt: 'Optimize my media mix for reaching 25-44 year olds in the US',
    suggestedPrompts: [
      { icon: Radio, text: 'Recommend the ideal media split for a $5M campaign targeting parents 30-45' },
      { icon: BarChart3, text: 'Analyze media consumption patterns to optimize my Q1 media plan' },
      { icon: TrendingUp, text: 'Which media channels are gaining share among my target demographic?' },
      { icon: Target, text: 'Compare reach efficiency across TV, YouTube, Instagram, and TikTok' },
    ],
  },
  {
    id: 'healthcare-insights-specialist',
    name: 'Healthcare Insights Specialist',
    description: 'Analyze health & wellness trends, patient behaviors, and pharma audiences',
    category: 'Industry Specialists',
    icon: Heart,
    iconColor: '#e11d48',
    iconBg: '#fff1f2',
    capabilities: ['Health trends', 'Wellness data', 'Pharma audiences'],
    examplePrompt: 'What are the top wellness trends among 25-44 year olds?',
    suggestedPrompts: [
      { icon: Heart, text: 'Analyze health and wellness trends among millennials in North America' },
      { icon: TrendingUp, text: 'Track the rise of telehealth adoption across different demographics' },
      { icon: Users, text: 'Build an audience profile of supplement users who exercise 3+ times weekly' },
      { icon: BarChart3, text: 'Compare mental health awareness attitudes across age groups globally' },
    ],
  },
  {
    id: 'retail-ecommerce-analyst',
    name: 'Retail & E-Commerce Analyst',
    description: 'Track shopping behaviors, brand preferences, and purchase drivers',
    category: 'Industry Specialists',
    icon: ShoppingCart,
    iconColor: '#c2410c',
    iconBg: '#fff7ed',
    capabilities: ['Shopping behavior', 'Brand preference', 'Purchase drivers'],
    examplePrompt: 'What drives online purchase decisions for luxury goods?',
    suggestedPrompts: [
      { icon: ShoppingCart, text: 'Analyze online vs in-store shopping preferences by generation' },
      { icon: TrendingUp, text: 'What are the fastest-growing e-commerce categories this year?' },
      { icon: Target, text: 'Identify key purchase drivers for direct-to-consumer brands' },
      { icon: Users, text: 'Profile the "high-value online shopper" segment across key markets' },
    ],
  },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getAgentsByCategory(category: AgentCategory): Agent[] {
  return agents.filter((a) => a.category === category);
}

export function getFeaturedAgents(count = 4): Agent[] {
  return agents.filter((a) => a.status === 'popular').slice(0, count);
}
