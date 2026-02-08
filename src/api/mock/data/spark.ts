import type { SparkConversation, SparkInsight } from '../../types'
import { daysAgo } from '../helpers'

export const mockConversations: SparkConversation[] = [
  {
    id: 'conv_social_trends', title: 'Social media trends in Q4 2024',
    created_at: daysAgo(2), updated_at: daysAgo(0),
    context: { wave_ids: ['wave_2024q4'], location_ids: ['loc_us', 'loc_uk'] },
    pinned: true,
    tags: ['social_media', 'trends'],
    summary: 'Discussed social media platform usage trends across US and UK markets in Q4 2024, focusing on TikTok growth and cross-market comparisons.',
    messages: [
      { id: 'msg_1a', role: 'user', content: 'What are the top social media trends in Q4 2024?', created_at: daysAgo(2) },
      {
        id: 'msg_1b', role: 'assistant', content: 'Based on Q4 2024 data, here are the key social media trends:\n\n1. **TikTok growth continues** - Now reaching 48% of 16-24 year olds, up 5pp from Q3\n2. **LinkedIn resurgence** - Professional platform usage grew 12% YoY among 25-44 age group\n3. **Social commerce adoption** - 34% of users have purchased directly through social platforms\n4. **Short-form video dominance** - 67% of social media time is spent on video content\n5. **Multi-platform usage** - Average user now active on 4.2 platforms (up from 3.8 in 2023)',
        created_at: daysAgo(2),
        citations: [
          { text: 'TikTok reaching 48% of 16-24s', source: 'GWI Core Q4 2024', dataset_id: 'ds_core', wave_id: 'wave_2024q4', sample_size: 12400, confidence_level: 'high' },
          { text: 'LinkedIn growth among 25-44s', source: 'GWI Core Q4 2024', dataset_id: 'ds_core', wave_id: 'wave_2024q4', sample_size: 18200, confidence_level: 'high' },
        ],
        suggested_actions: [
          { type: 'create_chart', label: 'Chart: Platform Usage by Age', payload: { question_id: 'q_social_platforms' } },
          { type: 'create_audience', label: 'Build: TikTok Heavy Users', payload: { datapoint_ids: ['dp_tiktok'] } },
        ],
        follow_up_questions: [
          'How does this compare between US and UK markets?',
          'Which age group shows the fastest growth on TikTok?',
          'What is the overlap between TikTok and Instagram users?',
        ],
        narrative_summary: 'Social media usage reached new highs in Q4 2024, driven primarily by short-form video and social commerce. TikTok continues its rapid ascent among younger demographics, while LinkedIn shows surprising strength in the professional segment.',
        confidence_level: 'high',
      },
      { id: 'msg_1c', role: 'user', content: 'How does this compare between US and UK markets?', created_at: daysAgo(1) },
      {
        id: 'msg_1d', role: 'assistant', content: 'Here\'s how US and UK social media trends compare in Q4 2024:\n\n| Platform | US | UK | Difference |\n|----------|---:|---:|-----------:|\n| Facebook | 62% | 58% | +4pp |\n| Instagram | 51% | 47% | +4pp |\n| TikTok | 38% | 42% | -4pp |\n| X/Twitter | 28% | 32% | -4pp |\n| LinkedIn | 31% | 28% | +3pp |\n\nKey differences:\n- **TikTok is stronger in the UK** particularly among 16-24s (52% vs 48%)\n- **Facebook still leads in both markets** but declining faster in UK\n- **YouTube is nearly universal** in both markets (88% US, 85% UK)',
        created_at: daysAgo(1),
        citations: [{ text: 'Cross-market comparison data', source: 'GWI Core Q4 2024', dataset_id: 'ds_core', sample_size: 45200, confidence_level: 'high' }],
        suggested_actions: [
          { type: 'show_data', label: 'View: Full Cross-Market Table', payload: { locations: ['loc_us', 'loc_uk'] } },
        ],
        visualization: {
          chart_type: 'grouped_bar',
          data: [
            { platform: 'Facebook', US: 62, UK: 58 },
            { platform: 'Instagram', US: 51, UK: 47 },
            { platform: 'TikTok', US: 38, UK: 42 },
            { platform: 'X/Twitter', US: 28, UK: 32 },
            { platform: 'LinkedIn', US: 31, UK: 28 },
          ],
          series: ['US', 'UK'],
          title: 'Social Media Penetration: US vs UK',
          x_axis_label: 'Platform',
          y_axis_label: 'Penetration %',
        },
        follow_up_questions: [
          'What drives TikTok\'s stronger performance in the UK?',
          'How does Germany compare to US and UK?',
        ],
      },
    ],
  },
  {
    id: 'conv_gen_z', title: 'Gen Z consumer behavior analysis',
    created_at: daysAgo(5), updated_at: daysAgo(3),
    context: { audience_id: 'aud_gen_z_social' },
    tags: ['gen_z', 'consumer_behavior'],
    messages: [
      { id: 'msg_2a', role: 'user', content: 'Tell me about Gen Z consumer behavior', created_at: daysAgo(5) },
      {
        id: 'msg_2b', role: 'assistant', content: 'Gen Z (16-24) consumer behavior shows several distinctive patterns:\n\n**Shopping Habits:**\n- 72% prefer online shopping over in-store\n- Social commerce adoption at 41% (vs 22% for all ages)\n- Buy Now Pay Later usage: 28% (highest of any age group)\n\n**Brand Relationships:**\n- 58% discover brands through social media\n- 45% influenced by creator/influencer recommendations\n- Brand values alignment matters to 63%\n\n**Media & Content:**\n- 3.2 hours average daily social media time\n- Short-form video is primary content format (78%)\n- 52% use ad blockers regularly',
        created_at: daysAgo(5),
        citations: [{ text: 'Gen Z consumer data', source: 'GWI Core Q4 2024', dataset_id: 'ds_core', sample_size: 8900, confidence_level: 'high' }],
        suggested_actions: [
          { type: 'create_audience', label: 'Build: Gen Z Audience', payload: { question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24'] } },
          { type: 'navigate', label: 'View: Age Demographics', payload: { path: '/app/questions' } },
        ],
        follow_up_questions: [
          'How does Gen Z compare to Millennials in brand loyalty?',
          'What are the top social commerce platforms for Gen Z?',
          'Create an audience for Gen Z heavy social media users',
        ],
        narrative_summary: 'Gen Z consumers are digital-native shoppers who prioritize social media discovery, values alignment, and convenience. Their adoption of social commerce and BNPL significantly outpaces older demographics.',
      },
      { id: 'msg_2c', role: 'user', content: 'Create an audience for Gen Z heavy social media users', created_at: daysAgo(4) },
      {
        id: 'msg_2d', role: 'assistant', content: 'I\'ve prepared an audience definition for Gen Z heavy social media users:\n\n**Audience: Gen Z Social Media Enthusiasts**\n- Age: 16-24\n- Social media time: 3+ hours daily\n\nEstimated reach:\n- Sample size: ~3,450 respondents\n- Population estimate: ~18.2M (US)\n\nWould you like me to create this audience, or would you like to refine the criteria further?',
        created_at: daysAgo(4),
        suggested_actions: [
          { type: 'create_audience', label: 'Create This Audience', payload: { name: 'Gen Z Social Enthusiasts', expression: { and: [{ question: { question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24'] } }, { question: { question_id: 'q_social_time', datapoint_ids: ['dp_time_3plus'] } }] } } },
        ],
      },
      { id: 'msg_2e', role: 'user', content: 'Yes, create it', created_at: daysAgo(3) },
      {
        id: 'msg_2f', role: 'assistant', content: 'Done! I\'ve created the audience **"Gen Z Social Media Enthusiasts"** with the following criteria:\n- Age 16-24 AND Social media 3+ hours/day\n\nYou can find it in your [Audiences](/app/audiences) list. The audience ID is `aud_gen_z_social`.',
        created_at: daysAgo(3),
        suggested_actions: [
          { type: 'navigate', label: 'View Audience', payload: { path: '/app/audiences/aud_gen_z_social' } },
          { type: 'create_chart', label: 'Chart This Audience', payload: { audience_id: 'aud_gen_z_social' } },
        ],
      },
    ],
  },
  {
    id: 'conv_streaming', title: 'Streaming platform competitive analysis',
    created_at: daysAgo(7), updated_at: daysAgo(7),
    context: { question_ids: ['q_tv_platforms'] },
    messages: [
      { id: 'msg_3a', role: 'user', content: 'Compare streaming platform usage across markets', created_at: daysAgo(7) },
      {
        id: 'msg_3b', role: 'assistant', content: 'Here\'s a competitive overview of streaming platforms across key markets:\n\n**Global Leaders (Q4 2024):**\n1. **Netflix** - 58% penetration globally, strongest in US (67%) and UK (62%)\n2. **YouTube Premium** - Growing at 23% YoY, dominant in emerging markets\n3. **Disney+** - 34% globally, particularly strong with families (48% of households with kids)\n4. **Amazon Prime** - 31% globally, strong tie-in with e-commerce\n\n**Regional Variations:**\n- Japan: Local platforms compete strongly (AbemaTV at 28%)\n- India: JioCinema leads with 45% penetration\n- Brazil: Globoplay competes at 22%\n\n**Key Trend:** Multi-platform subscriptions averaging 2.8 services per household, but cost sensitivity driving churn - 24% cancelled at least one service in past 6 months.',
        created_at: daysAgo(7),
        citations: [
          { text: 'Streaming penetration data', source: 'GWI Core Q4 2024', dataset_id: 'ds_core', sample_size: 45200, confidence_level: 'high' },
          { text: 'Subscription churn data', source: 'GWI Zeitgeist Dec 2024', sample_size: 12000, confidence_level: 'medium' },
        ],
        suggested_actions: [
          { type: 'create_chart', label: 'Chart: Streaming Market Share', payload: { question_id: 'q_tv_platforms' } },
        ],
        data_table: {
          columns: [
            { key: 'platform', label: 'Platform', format: 'text' },
            { key: 'global', label: 'Global %', format: 'percent' },
            { key: 'us', label: 'US %', format: 'percent' },
            { key: 'uk', label: 'UK %', format: 'percent' },
            { key: 'yoy_change', label: 'YoY Change', format: 'percent' },
          ],
          rows: [
            { platform: 'Netflix', global: 58, us: 67, uk: 62, yoy_change: 2.1 },
            { platform: 'YouTube Premium', global: 28, us: 24, uk: 22, yoy_change: 5.3 },
            { platform: 'Disney+', global: 34, us: 41, uk: 38, yoy_change: -1.2 },
            { platform: 'Amazon Prime', global: 31, us: 45, uk: 42, yoy_change: 1.8 },
          ],
          highlight_column: 'yoy_change',
          sort_by: 'global',
        },
        follow_up_questions: [
          'Which demographics are most likely to cancel streaming subscriptions?',
          'How does ad-supported tier adoption compare across platforms?',
        ],
      },
    ],
  },
  {
    id: 'conv_ai_research', title: 'AI adoption research findings',
    created_at: daysAgo(10), updated_at: daysAgo(8),
    context: { question_ids: ['q_ai_usage'], location_ids: ['loc_us'] },
    tags: ['ai', 'technology'],
    summary: 'Explored AI tool adoption rates across demographics, income correlations, and privacy concerns.',
    messages: [
      { id: 'msg_4a', role: 'user', content: 'What does the data show about AI tool adoption?', created_at: daysAgo(10) },
      {
        id: 'msg_4b', role: 'assistant', content: 'AI tool adoption has accelerated significantly in 2024:\n\n**Overall Adoption:**\n- 42% of internet users have tried at least one AI tool\n- 18% use AI tools weekly or more\n- ChatGPT leads with 28% awareness-to-usage\n\n**By Demographics:**\n- Ages 16-24: 56% have used AI tools\n- Ages 25-34: 48% have used AI tools\n- Ages 35-44: 35% have used AI tools\n- Ages 45+: 21% have used AI tools\n\n**Use Cases:**\n1. Content writing/editing (34%)\n2. Research and learning (31%)\n3. Image generation (22%)\n4. Coding assistance (15%)\n5. Professional tasks (14%)',
        created_at: daysAgo(10),
        citations: [{ text: 'AI adoption survey results', source: 'GWI Core Q4 2024', dataset_id: 'ds_core', sample_size: 45200, confidence_level: 'high' }],
        suggested_actions: [
          { type: 'create_chart', label: 'Chart: AI Tool Usage', payload: { question_id: 'q_ai_usage' } },
          { type: 'show_data', label: 'View: AI Data by Age', payload: {} },
        ],
        follow_up_questions: [
          'How does this vary by income level?',
          'What about privacy concerns related to AI?',
          'Which AI tools are most popular among professionals?',
        ],
        narrative_summary: 'AI tool adoption has reached mainstream levels in 2024, with 42% trial rate. Adoption skews heavily toward younger, higher-income demographics, with content creation and research being the primary use cases.',
        confidence_level: 'high',
      },
      { id: 'msg_4c', role: 'user', content: 'How does this vary by income level?', created_at: daysAgo(9) },
      {
        id: 'msg_4d', role: 'assistant', content: 'AI adoption shows a clear correlation with income:\n\n| Income Level | AI Usage | Weekly+ Usage |\n|-------------|----------|---------------|\n| Under $25K | 28% | 8% |\n| $25K-$50K | 36% | 13% |\n| $50K-$75K | 44% | 19% |\n| $75K-$100K | 52% | 24% |\n| $100K+ | 61% | 32% |\n\nHigher income groups not only adopt AI tools more but also use them more frequently and for professional purposes. The $100K+ group is 2.2x more likely to use AI for work tasks compared to the under $25K group.',
        created_at: daysAgo(9),
        citations: [{ text: 'AI usage by income bracket', source: 'GWI Core Q4 2024', confidence_level: 'high' }],
      },
      { id: 'msg_4e', role: 'user', content: 'What about privacy concerns related to AI?', created_at: daysAgo(8) },
      {
        id: 'msg_4f', role: 'assistant', content: 'Privacy concerns around AI are significant and growing:\n\n**Overall Sentiment:**\n- 67% express some level of concern about AI and data privacy\n- 38% are "very" or "extremely" concerned\n- Only 12% have "no concern" about AI privacy\n\n**Key Concerns:**\n1. Data being used to train AI models (52%)\n2. AI-generated misinformation (48%)\n3. Job displacement (43%)\n4. Personal data exposure (41%)\n5. Bias in AI decisions (35%)\n\n**Paradox:** Despite concerns, 73% of AI users say the benefits outweigh the risks. Those who use AI tools daily are actually *less* concerned about privacy (32% very concerned) compared to non-users (45% very concerned).',
        created_at: daysAgo(8),
        citations: [
          { text: 'AI privacy sentiment data', source: 'GWI Core Q4 2024', confidence_level: 'high' },
          { text: 'AI attitudes survey', source: 'GWI Zeitgeist Dec 2024', confidence_level: 'medium' },
        ],
        follow_up_questions: [
          'How do privacy concerns vary by country?',
          'What regulations do consumers want for AI?',
        ],
      },
    ],
  },
  {
    id: 'conv_fitness', title: 'Health and fitness trends',
    created_at: daysAgo(14), updated_at: daysAgo(14),
    messages: [
      { id: 'msg_5a', role: 'user', content: 'Show me the latest fitness and wellness trends', created_at: daysAgo(14) },
      {
        id: 'msg_5b', role: 'assistant', content: 'Here are the key fitness and wellness trends from Q4 2024:\n\n**Activity Participation:**\n- Gym/Weight Training: 32% (+3pp YoY)\n- Running/Jogging: 28% (stable)\n- Yoga/Pilates: 22% (+4pp YoY)\n- Swimming: 18% (-1pp YoY)\n- Cycling: 16% (+2pp YoY)\n\n**Digital Fitness:**\n- 41% use fitness tracking apps\n- 27% follow online workout programs\n- 19% use smart fitness equipment\n- Wearable fitness tracker ownership: 34%\n\n**Wellness Focus:**\n- Mental health awareness: 64% actively manage mental wellbeing\n- Sleep optimization: 38% use sleep tracking\n- Nutrition tracking: 29% use food logging apps',
        created_at: daysAgo(14),
        citations: [{ text: 'Fitness participation data', source: 'GWI Core Q4 2024', sample_size: 45200 }],
        suggested_actions: [
          { type: 'create_chart', label: 'Chart: Fitness Activities', payload: { question_id: 'q_fitness' } },
          { type: 'create_audience', label: 'Build: Fitness Enthusiasts', payload: {} },
        ],
        narrative_summary: 'Fitness participation continues to rise, led by gym/weight training and yoga. Digital fitness tools are becoming mainstream, with over 40% using tracking apps. Mental health management is now a top wellness priority.',
      },
      { id: 'msg_5c', role: 'user', content: 'What about the gender split for fitness activities?', created_at: daysAgo(14) },
      {
        id: 'msg_5d', role: 'assistant', content: 'The gender split for fitness activities shows interesting patterns:\n\n| Activity | Male | Female | Index (M vs F) |\n|----------|------|--------|----------------|\n| Gym/Weights | 38% | 26% | 146 |\n| Running | 30% | 26% | 115 |\n| Yoga/Pilates | 12% | 32% | 38 |\n| Swimming | 17% | 19% | 89 |\n| Cycling | 20% | 12% | 167 |\n\n**Key Insights:**\n- Yoga/Pilates shows the largest gender gap, with females 2.7x more likely\n- Cycling and gym training skew male\n- Running and swimming are the most gender-balanced activities\n- Among 16-24s, gender gaps are narrowing across all categories',
        created_at: daysAgo(14),
        citations: [{ text: 'Fitness by gender breakdown', source: 'GWI Core Q4 2024' }],
        follow_up_questions: [
          'How does fitness activity correlate with income?',
          'What are the fastest-growing fitness activities among women?',
        ],
      },
    ],
  },
]

// Proactive insights for the Spark insights panel
export const mockSparkInsights: SparkInsight[] = [
  {
    id: 'insight_tiktok_surge',
    type: 'trend',
    title: 'TikTok Usage Surges Among 25-34s',
    description: 'TikTok penetration among 25-34 year olds increased 8pp quarter-over-quarter, the fastest growth rate for any platform-demographic combination in Q4 2024.',
    severity: 'notable',
    metric_name: 'audience_percentage',
    current_value: 35,
    previous_value: 27,
    change_pct: 29.6,
    related_entity: { type: 'audience', id: 'aud_tech_savvy', name: 'Tech-Savvy Millennials' },
    suggested_action: { type: 'create_chart', label: 'View TikTok Growth Trend', payload: { question_id: 'q_social_platforms', datapoint_ids: ['dp_tiktok'] } },
    created_at: daysAgo(1),
  },
  {
    id: 'insight_streaming_churn',
    type: 'alert',
    title: 'Streaming Churn Rate Rising',
    description: 'The percentage of users who cancelled at least one streaming service in the past 6 months has risen from 19% to 24%, driven primarily by cost-conscious consumers in the $25K-$50K income bracket.',
    severity: 'important',
    metric_name: 'churn_rate',
    current_value: 24,
    previous_value: 19,
    change_pct: 26.3,
    related_entity: { type: 'dashboard', id: 'dash_media_mix', name: 'Media Consumption Mix' },
    created_at: daysAgo(2),
  },
  {
    id: 'insight_ai_adoption',
    type: 'opportunity',
    title: 'AI Tool Adoption Creates New Audience Segment',
    description: 'A distinct audience segment of "AI-first professionals" (uses AI tools daily for work, 100K+ income, 25-44) now represents 8.2M consumers in the US. This segment over-indexes on premium subscriptions (186 index) and early adoption behaviors.',
    severity: 'notable',
    related_entity: { type: 'audience', id: 'aud_tech_savvy', name: 'Tech-Savvy Millennials' },
    suggested_action: { type: 'create_audience', label: 'Build AI-First Professionals Audience', payload: {} },
    created_at: daysAgo(3),
  },
  {
    id: 'insight_eco_anomaly',
    type: 'anomaly',
    title: 'Unexpected Drop in Eco-Purchase Intent',
    description: 'Willingness to pay more for sustainable products dropped 5pp among 35-44 year olds this quarter, despite rising environmental concern. This may indicate a growing intention-action gap driven by cost-of-living pressures.',
    severity: 'important',
    metric_name: 'sustainable_purchase_intent',
    current_value: 31,
    previous_value: 36,
    change_pct: -13.9,
    related_entity: { type: 'audience', id: 'aud_eco_shoppers', name: 'Eco-Conscious Online Shoppers' },
    created_at: daysAgo(4),
  },
  {
    id: 'insight_podcast_growth',
    type: 'recommendation',
    title: 'Consider Podcast Advertising for Gen Z',
    description: 'Podcast listening among 16-24s grew 12% YoY, with news and true crime genres showing the highest engagement. This audience shows strong ad receptivity (42% recall podcast ads vs 28% for display ads).',
    severity: 'info',
    related_entity: { type: 'audience', id: 'aud_gen_z_social', name: 'Gen Z Social Media Enthusiasts' },
    suggested_action: { type: 'create_chart', label: 'View Podcast Trends', payload: { question_id: 'q_podcast_genres' } },
    created_at: daysAgo(5),
  },
]
