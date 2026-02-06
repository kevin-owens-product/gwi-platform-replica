import type { Audience } from '../../types'
import { daysAgo } from '../helpers'

export const mockAudiences: Audience[] = [
  {
    id: 'aud_gen_z_social', name: 'Gen Z Social Media Enthusiasts', description: 'Ages 16-24 who spend 3+ hours on social media daily',
    expression: { and: [{ question: { question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24'] } }, { question: { question_id: 'q_social_time', datapoint_ids: ['dp_time_3plus'] } }] },
    created_at: daysAgo(30), updated_at: daysAgo(5), user_id: 'user_sarah', is_shared: true, sample_size: 3450, population_size: 18200000,
  },
  {
    id: 'aud_tech_savvy', name: 'Tech-Savvy Millennials', description: 'Ages 25-34 who own 3+ devices and use AI tools',
    expression: { and: [{ question: { question_id: 'q_age_group', datapoint_ids: ['dp_age_25_34'] } }, { question: { question_id: 'q_device_ownership', datapoint_ids: ['dp_smartphone', 'dp_laptop', 'dp_smartwatch'] } }] },
    created_at: daysAgo(25), updated_at: daysAgo(10), user_id: 'user_sarah', is_shared: true, sample_size: 2890, population_size: 15400000,
  },
  {
    id: 'aud_eco_shoppers', name: 'Eco-Conscious Online Shoppers', description: 'Environmentally concerned consumers who shop online frequently',
    expression: { and: [{ question: { question_id: 'q_env_concern', datapoint_ids: ['dp_env_4', 'dp_env_5'] } }, { question: { question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_beauty'] } }] },
    created_at: daysAgo(20), updated_at: daysAgo(8), user_id: 'user_maria', is_shared: true, sample_size: 4120, population_size: 22800000,
  },
  {
    id: 'aud_streamers', name: 'Multi-Platform Streamers', description: 'Uses 3+ streaming services regularly',
    expression: { question: { question_id: 'q_tv_platforms', datapoint_ids: ['dp_netflix', 'dp_disney', 'dp_prime'] } },
    created_at: daysAgo(18), updated_at: daysAgo(12), user_id: 'user_sarah', is_shared: false, sample_size: 5670, population_size: 31500000,
  },
  {
    id: 'aud_fitness_active', name: 'Active Fitness Enthusiasts', description: 'Regularly participates in 2+ fitness activities',
    expression: { question: { question_id: 'q_fitness', datapoint_ids: ['dp_gym', 'dp_running', 'dp_yoga'] } },
    created_at: daysAgo(15), updated_at: daysAgo(7), user_id: 'user_alex', is_shared: true, sample_size: 3890, population_size: 20100000,
  },
  {
    id: 'aud_gamers', name: 'Cross-Platform Gamers', description: 'Games on both mobile and console/PC platforms',
    expression: { and: [{ question: { question_id: 'q_gaming', datapoint_ids: ['dp_mobile_gaming'] } }, { or: [{ question: { question_id: 'q_gaming', datapoint_ids: ['dp_pc_gaming'] } }, { question: { question_id: 'q_gaming', datapoint_ids: ['dp_console_ps', 'dp_console_xbox'] } }] }] },
    created_at: daysAgo(12), updated_at: daysAgo(4), user_id: 'user_james', is_shared: true, sample_size: 2340, population_size: 12800000,
  },
  {
    id: 'aud_high_income', name: 'High-Income Professionals', description: 'Income $100K+ working hybrid or remote',
    expression: { and: [{ question: { question_id: 'q_income', datapoint_ids: ['dp_income_high'] } }, { question: { question_id: 'q_work_setup', datapoint_ids: ['dp_work_hybrid', 'dp_work_remote'] } }] },
    created_at: daysAgo(10), updated_at: daysAgo(3), user_id: 'user_sarah', is_shared: false, sample_size: 1560, population_size: 8400000,
  },
  {
    id: 'aud_news_social', name: 'Social-First News Consumers', description: 'Gets news primarily from social media platforms',
    expression: { and: [{ question: { question_id: 'q_news_sources', datapoint_ids: ['dp_news_social'] } }, { not: { question: { question_id: 'q_news_sources', datapoint_ids: ['dp_news_tv', 'dp_news_print'] } } }] },
    created_at: daysAgo(8), updated_at: daysAgo(2), user_id: 'user_emma', is_shared: true, sample_size: 2780, population_size: 14600000,
  },
  {
    id: 'aud_brand_loyal', name: 'Brand-Loyal Consumers', description: 'Values quality and service in brand loyalty decisions',
    expression: { question: { question_id: 'q_brand_loyalty', datapoint_ids: ['dp_loyal_quality', 'dp_loyal_service'] } },
    created_at: daysAgo(6), updated_at: daysAgo(1), user_id: 'user_sophia', is_shared: true, sample_size: 4560, population_size: 25200000,
  },
  {
    id: 'aud_podcast_listeners', name: 'Regular Podcast Listeners', description: 'Listens to podcasts across multiple genres',
    expression: { question: { question_id: 'q_podcast_genres', datapoint_ids: ['dp_pod_news', 'dp_pod_tech', 'dp_pod_business'] } },
    created_at: daysAgo(4), updated_at: daysAgo(0), user_id: 'user_maria', is_shared: false, sample_size: 1980, population_size: 10500000,
  },
]
