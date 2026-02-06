import type { Category, Question, Study, Wave, Location, Namespace, Splitter } from '../../types'

export const mockCategories: Category[] = [
  { id: 'cat_media', name: 'Media Consumption', description: 'TV, radio, print and digital media habits', parent_id: undefined, question_count: 8, sort_order: 1 },
  { id: 'cat_social', name: 'Social Media', description: 'Social platform usage and engagement', parent_id: undefined, question_count: 6, sort_order: 2 },
  { id: 'cat_tech', name: 'Technology', description: 'Device ownership and tech adoption', parent_id: undefined, question_count: 5, sort_order: 3 },
  { id: 'cat_lifestyle', name: 'Lifestyle', description: 'Health, fitness, food, and travel', parent_id: undefined, question_count: 4, sort_order: 4 },
  { id: 'cat_attitudes', name: 'Attitudes & Values', description: 'Opinions on society, environment, and politics', parent_id: undefined, question_count: 3, sort_order: 5 },
  { id: 'cat_brand', name: 'Brand Engagement', description: 'Brand awareness, purchase, and loyalty', parent_id: undefined, question_count: 2, sort_order: 6 },
  { id: 'cat_demographics', name: 'Demographics', description: 'Age, gender, income, education', parent_id: undefined, question_count: 4, sort_order: 7 },
  { id: 'cat_ecommerce', name: 'E-Commerce', description: 'Online shopping behavior and preferences', parent_id: undefined, question_count: 3, sort_order: 8 },
]

export const mockQuestions: Question[] = [
  {
    id: 'q_social_platforms', name: 'Social Media Platforms Used', description: 'Which social media platforms have you used in the past month?',
    category_id: 'cat_social', category_name: 'Social Media', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_facebook', name: 'Facebook', question_id: 'q_social_platforms', sort_order: 1 },
      { id: 'dp_instagram', name: 'Instagram', question_id: 'q_social_platforms', sort_order: 2 },
      { id: 'dp_tiktok', name: 'TikTok', question_id: 'q_social_platforms', sort_order: 3 },
      { id: 'dp_twitter', name: 'X / Twitter', question_id: 'q_social_platforms', sort_order: 4 },
      { id: 'dp_linkedin', name: 'LinkedIn', question_id: 'q_social_platforms', sort_order: 5 },
      { id: 'dp_youtube', name: 'YouTube', question_id: 'q_social_platforms', sort_order: 6 },
      { id: 'dp_snapchat', name: 'Snapchat', question_id: 'q_social_platforms', sort_order: 7 },
      { id: 'dp_pinterest', name: 'Pinterest', question_id: 'q_social_platforms', sort_order: 8 },
    ],
  },
  {
    id: 'q_social_time', name: 'Daily Social Media Time', description: 'How much time do you typically spend on social media per day?',
    category_id: 'cat_social', category_name: 'Social Media', type: 'single', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_time_none', name: 'None', question_id: 'q_social_time', sort_order: 1 },
      { id: 'dp_time_30m', name: 'Less than 30 minutes', question_id: 'q_social_time', sort_order: 2 },
      { id: 'dp_time_1h', name: '30 minutes - 1 hour', question_id: 'q_social_time', sort_order: 3 },
      { id: 'dp_time_2h', name: '1 - 2 hours', question_id: 'q_social_time', sort_order: 4 },
      { id: 'dp_time_3h', name: '2 - 3 hours', question_id: 'q_social_time', sort_order: 5 },
      { id: 'dp_time_3plus', name: '3+ hours', question_id: 'q_social_time', sort_order: 6 },
    ],
  },
  {
    id: 'q_tv_platforms', name: 'TV/Streaming Platforms', description: 'Which TV or streaming services do you use?',
    category_id: 'cat_media', category_name: 'Media Consumption', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_netflix', name: 'Netflix', question_id: 'q_tv_platforms', sort_order: 1 },
      { id: 'dp_disney', name: 'Disney+', question_id: 'q_tv_platforms', sort_order: 2 },
      { id: 'dp_prime', name: 'Amazon Prime Video', question_id: 'q_tv_platforms', sort_order: 3 },
      { id: 'dp_hbo', name: 'HBO Max', question_id: 'q_tv_platforms', sort_order: 4 },
      { id: 'dp_hulu', name: 'Hulu', question_id: 'q_tv_platforms', sort_order: 5 },
      { id: 'dp_apple_tv', name: 'Apple TV+', question_id: 'q_tv_platforms', sort_order: 6 },
    ],
  },
  {
    id: 'q_device_ownership', name: 'Device Ownership', description: 'Which of the following devices do you own?',
    category_id: 'cat_tech', category_name: 'Technology', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_smartphone', name: 'Smartphone', question_id: 'q_device_ownership', sort_order: 1 },
      { id: 'dp_laptop', name: 'Laptop', question_id: 'q_device_ownership', sort_order: 2 },
      { id: 'dp_tablet', name: 'Tablet', question_id: 'q_device_ownership', sort_order: 3 },
      { id: 'dp_smartwatch', name: 'Smartwatch', question_id: 'q_device_ownership', sort_order: 4 },
      { id: 'dp_desktop', name: 'Desktop PC', question_id: 'q_device_ownership', sort_order: 5 },
      { id: 'dp_smart_speaker', name: 'Smart Speaker', question_id: 'q_device_ownership', sort_order: 6 },
    ],
  },
  {
    id: 'q_purchase_online', name: 'Online Purchase Categories', description: 'What categories of products have you purchased online in the past 3 months?',
    category_id: 'cat_ecommerce', category_name: 'E-Commerce', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_clothing', name: 'Clothing & Accessories', question_id: 'q_purchase_online', sort_order: 1 },
      { id: 'dp_electronics', name: 'Electronics', question_id: 'q_purchase_online', sort_order: 2 },
      { id: 'dp_food_delivery', name: 'Food Delivery', question_id: 'q_purchase_online', sort_order: 3 },
      { id: 'dp_beauty', name: 'Beauty & Personal Care', question_id: 'q_purchase_online', sort_order: 4 },
      { id: 'dp_home_garden', name: 'Home & Garden', question_id: 'q_purchase_online', sort_order: 5 },
    ],
  },
  {
    id: 'q_age_group', name: 'Age Group', description: 'Which age group do you belong to?',
    category_id: 'cat_demographics', category_name: 'Demographics', type: 'single', wave_ids: ['wave_2024q4', 'wave_2024q3', 'wave_2024q2'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_age_16_24', name: '16-24', question_id: 'q_age_group', sort_order: 1 },
      { id: 'dp_age_25_34', name: '25-34', question_id: 'q_age_group', sort_order: 2 },
      { id: 'dp_age_35_44', name: '35-44', question_id: 'q_age_group', sort_order: 3 },
      { id: 'dp_age_45_54', name: '45-54', question_id: 'q_age_group', sort_order: 4 },
      { id: 'dp_age_55_64', name: '55-64', question_id: 'q_age_group', sort_order: 5 },
    ],
  },
  {
    id: 'q_income', name: 'Household Income', description: 'What is your approximate annual household income?',
    category_id: 'cat_demographics', category_name: 'Demographics', type: 'single', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_income_low', name: 'Under $25,000', question_id: 'q_income', sort_order: 1 },
      { id: 'dp_income_mid_low', name: '$25,000 - $49,999', question_id: 'q_income', sort_order: 2 },
      { id: 'dp_income_mid', name: '$50,000 - $74,999', question_id: 'q_income', sort_order: 3 },
      { id: 'dp_income_mid_high', name: '$75,000 - $99,999', question_id: 'q_income', sort_order: 4 },
      { id: 'dp_income_high', name: '$100,000+', question_id: 'q_income', sort_order: 5 },
    ],
  },
  {
    id: 'q_fitness', name: 'Fitness Activities', description: 'Which fitness activities do you regularly participate in?',
    category_id: 'cat_lifestyle', category_name: 'Lifestyle', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_gym', name: 'Gym / Weight Training', question_id: 'q_fitness', sort_order: 1 },
      { id: 'dp_running', name: 'Running / Jogging', question_id: 'q_fitness', sort_order: 2 },
      { id: 'dp_yoga', name: 'Yoga / Pilates', question_id: 'q_fitness', sort_order: 3 },
      { id: 'dp_swimming', name: 'Swimming', question_id: 'q_fitness', sort_order: 4 },
      { id: 'dp_cycling', name: 'Cycling', question_id: 'q_fitness', sort_order: 5 },
    ],
  },
  {
    id: 'q_brand_discovery', name: 'Brand Discovery Channels', description: 'How do you typically discover new brands?',
    category_id: 'cat_brand', category_name: 'Brand Engagement', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_social_ads', name: 'Social Media Ads', question_id: 'q_brand_discovery', sort_order: 1 },
      { id: 'dp_influencer', name: 'Influencer Recommendations', question_id: 'q_brand_discovery', sort_order: 2 },
      { id: 'dp_search', name: 'Search Engines', question_id: 'q_brand_discovery', sort_order: 3 },
      { id: 'dp_word_of_mouth', name: 'Word of Mouth', question_id: 'q_brand_discovery', sort_order: 4 },
      { id: 'dp_tv_ads', name: 'TV Advertisements', question_id: 'q_brand_discovery', sort_order: 5 },
    ],
  },
  {
    id: 'q_env_concern', name: 'Environmental Concern Level', description: 'How concerned are you about environmental issues?',
    category_id: 'cat_attitudes', category_name: 'Attitudes & Values', type: 'scale', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_env_1', name: 'Not at all concerned', question_id: 'q_env_concern', sort_order: 1 },
      { id: 'dp_env_2', name: 'Slightly concerned', question_id: 'q_env_concern', sort_order: 2 },
      { id: 'dp_env_3', name: 'Moderately concerned', question_id: 'q_env_concern', sort_order: 3 },
      { id: 'dp_env_4', name: 'Very concerned', question_id: 'q_env_concern', sort_order: 4 },
      { id: 'dp_env_5', name: 'Extremely concerned', question_id: 'q_env_concern', sort_order: 5 },
    ],
  },
  // Additional questions for variety
  {
    id: 'q_news_sources', name: 'News Sources', description: 'Where do you primarily get your news?',
    category_id: 'cat_media', category_name: 'Media Consumption', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_news_social', name: 'Social Media', question_id: 'q_news_sources', sort_order: 1 },
      { id: 'dp_news_tv', name: 'Television', question_id: 'q_news_sources', sort_order: 2 },
      { id: 'dp_news_online', name: 'Online News Sites', question_id: 'q_news_sources', sort_order: 3 },
      { id: 'dp_news_podcast', name: 'Podcasts', question_id: 'q_news_sources', sort_order: 4 },
      { id: 'dp_news_print', name: 'Print Newspapers', question_id: 'q_news_sources', sort_order: 5 },
    ],
  },
  {
    id: 'q_gaming', name: 'Gaming Platforms', description: 'Which gaming platforms do you use?',
    category_id: 'cat_tech', category_name: 'Technology', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_mobile_gaming', name: 'Mobile', question_id: 'q_gaming', sort_order: 1 },
      { id: 'dp_pc_gaming', name: 'PC', question_id: 'q_gaming', sort_order: 2 },
      { id: 'dp_console_ps', name: 'PlayStation', question_id: 'q_gaming', sort_order: 3 },
      { id: 'dp_console_xbox', name: 'Xbox', question_id: 'q_gaming', sort_order: 4 },
      { id: 'dp_console_switch', name: 'Nintendo Switch', question_id: 'q_gaming', sort_order: 5 },
    ],
  },
  {
    id: 'q_travel', name: 'Travel Preferences', description: 'What type of travel do you prefer?',
    category_id: 'cat_lifestyle', category_name: 'Lifestyle', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_travel_beach', name: 'Beach/Resort', question_id: 'q_travel', sort_order: 1 },
      { id: 'dp_travel_city', name: 'City Breaks', question_id: 'q_travel', sort_order: 2 },
      { id: 'dp_travel_adventure', name: 'Adventure/Outdoor', question_id: 'q_travel', sort_order: 3 },
      { id: 'dp_travel_cultural', name: 'Cultural/Historical', question_id: 'q_travel', sort_order: 4 },
    ],
  },
  {
    id: 'q_payment_methods', name: 'Preferred Payment Methods', description: 'What payment methods do you use most often?',
    category_id: 'cat_ecommerce', category_name: 'E-Commerce', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_pay_credit', name: 'Credit Card', question_id: 'q_payment_methods', sort_order: 1 },
      { id: 'dp_pay_debit', name: 'Debit Card', question_id: 'q_payment_methods', sort_order: 2 },
      { id: 'dp_pay_paypal', name: 'PayPal', question_id: 'q_payment_methods', sort_order: 3 },
      { id: 'dp_pay_apple', name: 'Apple Pay', question_id: 'q_payment_methods', sort_order: 4 },
      { id: 'dp_pay_bnpl', name: 'Buy Now Pay Later', question_id: 'q_payment_methods', sort_order: 5 },
    ],
  },
  {
    id: 'q_social_actions', name: 'Social Media Actions', description: 'What activities do you perform on social media?',
    category_id: 'cat_social', category_name: 'Social Media', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_action_like', name: 'Liking / Reacting', question_id: 'q_social_actions', sort_order: 1 },
      { id: 'dp_action_comment', name: 'Commenting', question_id: 'q_social_actions', sort_order: 2 },
      { id: 'dp_action_share', name: 'Sharing Content', question_id: 'q_social_actions', sort_order: 3 },
      { id: 'dp_action_post', name: 'Creating Posts', question_id: 'q_social_actions', sort_order: 4 },
      { id: 'dp_action_story', name: 'Posting Stories/Reels', question_id: 'q_social_actions', sort_order: 5 },
    ],
  },
  // 15 more questions to hit ~30
  {
    id: 'q_podcast_genres', name: 'Podcast Genres', description: 'Which podcast genres do you listen to?',
    category_id: 'cat_media', category_name: 'Media Consumption', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_pod_comedy', name: 'Comedy', question_id: 'q_podcast_genres', sort_order: 1 },
      { id: 'dp_pod_news', name: 'News & Politics', question_id: 'q_podcast_genres', sort_order: 2 },
      { id: 'dp_pod_true_crime', name: 'True Crime', question_id: 'q_podcast_genres', sort_order: 3 },
      { id: 'dp_pod_tech', name: 'Technology', question_id: 'q_podcast_genres', sort_order: 4 },
      { id: 'dp_pod_business', name: 'Business', question_id: 'q_podcast_genres', sort_order: 5 },
    ],
  },
  {
    id: 'q_music_streaming', name: 'Music Streaming Services', description: 'Which music streaming platforms do you use?',
    category_id: 'cat_media', category_name: 'Media Consumption', type: 'multi', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_spotify', name: 'Spotify', question_id: 'q_music_streaming', sort_order: 1 },
      { id: 'dp_apple_music', name: 'Apple Music', question_id: 'q_music_streaming', sort_order: 2 },
      { id: 'dp_youtube_music', name: 'YouTube Music', question_id: 'q_music_streaming', sort_order: 3 },
      { id: 'dp_amazon_music', name: 'Amazon Music', question_id: 'q_music_streaming', sort_order: 4 },
    ],
  },
  {
    id: 'q_diet', name: 'Dietary Preferences', description: 'Which describes your dietary preference?',
    category_id: 'cat_lifestyle', category_name: 'Lifestyle', type: 'single', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_diet_none', name: 'No specific diet', question_id: 'q_diet', sort_order: 1 },
      { id: 'dp_diet_veg', name: 'Vegetarian', question_id: 'q_diet', sort_order: 2 },
      { id: 'dp_diet_vegan', name: 'Vegan', question_id: 'q_diet', sort_order: 3 },
      { id: 'dp_diet_keto', name: 'Keto / Low-Carb', question_id: 'q_diet', sort_order: 4 },
      { id: 'dp_diet_paleo', name: 'Paleo', question_id: 'q_diet', sort_order: 5 },
    ],
  },
  {
    id: 'q_work_setup', name: 'Work Setup', description: 'What is your current work arrangement?',
    category_id: 'cat_lifestyle', category_name: 'Lifestyle', type: 'single', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_work_office', name: 'Fully in-office', question_id: 'q_work_setup', sort_order: 1 },
      { id: 'dp_work_hybrid', name: 'Hybrid', question_id: 'q_work_setup', sort_order: 2 },
      { id: 'dp_work_remote', name: 'Fully remote', question_id: 'q_work_setup', sort_order: 3 },
      { id: 'dp_work_self', name: 'Self-employed', question_id: 'q_work_setup', sort_order: 4 },
    ],
  },
  {
    id: 'q_gender', name: 'Gender', description: 'What is your gender?',
    category_id: 'cat_demographics', category_name: 'Demographics', type: 'single', wave_ids: ['wave_2024q4', 'wave_2024q3', 'wave_2024q2'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_gender_male', name: 'Male', question_id: 'q_gender', sort_order: 1 },
      { id: 'dp_gender_female', name: 'Female', question_id: 'q_gender', sort_order: 2 },
      { id: 'dp_gender_nonbinary', name: 'Non-binary', question_id: 'q_gender', sort_order: 3 },
    ],
  },
  {
    id: 'q_education', name: 'Education Level', description: 'What is your highest level of education?',
    category_id: 'cat_demographics', category_name: 'Demographics', type: 'single', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_edu_hs', name: 'High School', question_id: 'q_education', sort_order: 1 },
      { id: 'dp_edu_bachelor', name: "Bachelor's Degree", question_id: 'q_education', sort_order: 2 },
      { id: 'dp_edu_master', name: "Master's Degree", question_id: 'q_education', sort_order: 3 },
      { id: 'dp_edu_phd', name: 'PhD / Doctorate', question_id: 'q_education', sort_order: 4 },
    ],
  },
  {
    id: 'q_ad_attitudes', name: 'Attitudes Towards Advertising', description: 'How do you feel about online advertising?',
    category_id: 'cat_attitudes', category_name: 'Attitudes & Values', type: 'scale', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_ad_1', name: 'Very negative', question_id: 'q_ad_attitudes', sort_order: 1 },
      { id: 'dp_ad_2', name: 'Somewhat negative', question_id: 'q_ad_attitudes', sort_order: 2 },
      { id: 'dp_ad_3', name: 'Neutral', question_id: 'q_ad_attitudes', sort_order: 3 },
      { id: 'dp_ad_4', name: 'Somewhat positive', question_id: 'q_ad_attitudes', sort_order: 4 },
      { id: 'dp_ad_5', name: 'Very positive', question_id: 'q_ad_attitudes', sort_order: 5 },
    ],
  },
  {
    id: 'q_privacy_concern', name: 'Data Privacy Concern', description: 'How concerned are you about your personal data privacy online?',
    category_id: 'cat_attitudes', category_name: 'Attitudes & Values', type: 'scale', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_priv_1', name: 'Not concerned', question_id: 'q_privacy_concern', sort_order: 1 },
      { id: 'dp_priv_2', name: 'Slightly concerned', question_id: 'q_privacy_concern', sort_order: 2 },
      { id: 'dp_priv_3', name: 'Moderately concerned', question_id: 'q_privacy_concern', sort_order: 3 },
      { id: 'dp_priv_4', name: 'Very concerned', question_id: 'q_privacy_concern', sort_order: 4 },
      { id: 'dp_priv_5', name: 'Extremely concerned', question_id: 'q_privacy_concern', sort_order: 5 },
    ],
  },
  {
    id: 'q_brand_loyalty', name: 'Brand Loyalty Factors', description: 'What factors make you loyal to a brand?',
    category_id: 'cat_brand', category_name: 'Brand Engagement', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_loyal_quality', name: 'Product Quality', question_id: 'q_brand_loyalty', sort_order: 1 },
      { id: 'dp_loyal_price', name: 'Competitive Pricing', question_id: 'q_brand_loyalty', sort_order: 2 },
      { id: 'dp_loyal_service', name: 'Customer Service', question_id: 'q_brand_loyalty', sort_order: 3 },
      { id: 'dp_loyal_values', name: 'Shared Values', question_id: 'q_brand_loyalty', sort_order: 4 },
      { id: 'dp_loyal_convenience', name: 'Convenience', question_id: 'q_brand_loyalty', sort_order: 5 },
    ],
  },
  {
    id: 'q_smart_home', name: 'Smart Home Devices', description: 'Which smart home devices do you use?',
    category_id: 'cat_tech', category_name: 'Technology', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_smart_speaker2', name: 'Smart Speaker', question_id: 'q_smart_home', sort_order: 1 },
      { id: 'dp_smart_thermo', name: 'Smart Thermostat', question_id: 'q_smart_home', sort_order: 2 },
      { id: 'dp_smart_lights', name: 'Smart Lights', question_id: 'q_smart_home', sort_order: 3 },
      { id: 'dp_smart_cam', name: 'Security Camera', question_id: 'q_smart_home', sort_order: 4 },
      { id: 'dp_smart_lock', name: 'Smart Lock', question_id: 'q_smart_home', sort_order: 5 },
    ],
  },
  {
    id: 'q_ai_usage', name: 'AI Tool Usage', description: 'Which AI tools have you used?',
    category_id: 'cat_tech', category_name: 'Technology', type: 'multi', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_ai_chatgpt', name: 'ChatGPT', question_id: 'q_ai_usage', sort_order: 1 },
      { id: 'dp_ai_copilot', name: 'Microsoft Copilot', question_id: 'q_ai_usage', sort_order: 2 },
      { id: 'dp_ai_gemini', name: 'Google Gemini', question_id: 'q_ai_usage', sort_order: 3 },
      { id: 'dp_ai_midjourney', name: 'Midjourney', question_id: 'q_ai_usage', sort_order: 4 },
      { id: 'dp_ai_claude', name: 'Claude', question_id: 'q_ai_usage', sort_order: 5 },
    ],
  },
  {
    id: 'q_social_commerce', name: 'Social Commerce', description: 'Have you purchased products directly through social media?',
    category_id: 'cat_ecommerce', category_name: 'E-Commerce', type: 'single', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_scom_yes_reg', name: 'Yes, regularly', question_id: 'q_social_commerce', sort_order: 1 },
      { id: 'dp_scom_yes_occ', name: 'Yes, occasionally', question_id: 'q_social_commerce', sort_order: 2 },
      { id: 'dp_scom_no_int', name: 'No, but interested', question_id: 'q_social_commerce', sort_order: 3 },
      { id: 'dp_scom_no', name: 'No, not interested', question_id: 'q_social_commerce', sort_order: 4 },
    ],
  },
  {
    id: 'q_media_multitask', name: 'Media Multitasking', description: 'Do you use multiple screens while watching TV?',
    category_id: 'cat_media', category_name: 'Media Consumption', type: 'single', wave_ids: ['wave_2024q4', 'wave_2024q3'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_multi_always', name: 'Always', question_id: 'q_media_multitask', sort_order: 1 },
      { id: 'dp_multi_often', name: 'Often', question_id: 'q_media_multitask', sort_order: 2 },
      { id: 'dp_multi_sometimes', name: 'Sometimes', question_id: 'q_media_multitask', sort_order: 3 },
      { id: 'dp_multi_rarely', name: 'Rarely', question_id: 'q_media_multitask', sort_order: 4 },
      { id: 'dp_multi_never', name: 'Never', question_id: 'q_media_multitask', sort_order: 5 },
    ],
  },
  {
    id: 'q_social_influence', name: 'Social Media Purchase Influence', description: 'How much does social media influence your purchase decisions?',
    category_id: 'cat_social', category_name: 'Social Media', type: 'scale', wave_ids: ['wave_2024q4'], namespace_id: 'ns_core',
    datapoints: [
      { id: 'dp_inf_1', name: 'No influence', question_id: 'q_social_influence', sort_order: 1 },
      { id: 'dp_inf_2', name: 'Slight influence', question_id: 'q_social_influence', sort_order: 2 },
      { id: 'dp_inf_3', name: 'Moderate influence', question_id: 'q_social_influence', sort_order: 3 },
      { id: 'dp_inf_4', name: 'Strong influence', question_id: 'q_social_influence', sort_order: 4 },
      { id: 'dp_inf_5', name: 'Very strong influence', question_id: 'q_social_influence', sort_order: 5 },
    ],
  },
]

export const mockLocations: Location[] = [
  { id: 'loc_us', name: 'United States', iso_code: 'US' },
  { id: 'loc_uk', name: 'United Kingdom', iso_code: 'GB' },
  { id: 'loc_de', name: 'Germany', iso_code: 'DE' },
  { id: 'loc_fr', name: 'France', iso_code: 'FR' },
  { id: 'loc_jp', name: 'Japan', iso_code: 'JP' },
  { id: 'loc_br', name: 'Brazil', iso_code: 'BR' },
  { id: 'loc_in', name: 'India', iso_code: 'IN' },
  { id: 'loc_au', name: 'Australia', iso_code: 'AU' },
  { id: 'loc_ca', name: 'Canada', iso_code: 'CA' },
  { id: 'loc_mx', name: 'Mexico', iso_code: 'MX' },
  { id: 'loc_es', name: 'Spain', iso_code: 'ES' },
  { id: 'loc_it', name: 'Italy', iso_code: 'IT' },
  { id: 'loc_kr', name: 'South Korea', iso_code: 'KR' },
  { id: 'loc_cn', name: 'China', iso_code: 'CN' },
  { id: 'loc_id', name: 'Indonesia', iso_code: 'ID' },
  { id: 'loc_ng', name: 'Nigeria', iso_code: 'NG' },
  { id: 'loc_za', name: 'South Africa', iso_code: 'ZA' },
  { id: 'loc_se', name: 'Sweden', iso_code: 'SE' },
  { id: 'loc_pl', name: 'Poland', iso_code: 'PL' },
  { id: 'loc_ar', name: 'Argentina', iso_code: 'AR' },
]

export const mockWaves: Wave[] = [
  { id: 'wave_2024q4', name: 'Q4 2024', study_id: 'study_core', study_name: 'GWI Core', year: 2024, quarter: 4, start_date: '2024-10-01', end_date: '2024-12-31', location_ids: mockLocations.map((l) => l.id), sample_size: 45200 },
  { id: 'wave_2024q3', name: 'Q3 2024', study_id: 'study_core', study_name: 'GWI Core', year: 2024, quarter: 3, start_date: '2024-07-01', end_date: '2024-09-30', location_ids: mockLocations.map((l) => l.id), sample_size: 42800 },
  { id: 'wave_2024q2', name: 'Q2 2024', study_id: 'study_core', study_name: 'GWI Core', year: 2024, quarter: 2, start_date: '2024-04-01', end_date: '2024-06-30', location_ids: mockLocations.slice(0, 15).map((l) => l.id), sample_size: 38500 },
  { id: 'wave_usa_2024', name: 'USA 2024', study_id: 'study_usa', study_name: 'GWI USA', year: 2024, start_date: '2024-01-01', end_date: '2024-12-31', location_ids: ['loc_us'], sample_size: 25000 },
  { id: 'wave_kids_2024', name: 'Kids 2024', study_id: 'study_kids', study_name: 'GWI Kids', year: 2024, start_date: '2024-06-01', end_date: '2024-08-31', location_ids: ['loc_us', 'loc_uk', 'loc_de', 'loc_fr'], sample_size: 12000 },
  { id: 'wave_biz_2024q4', name: 'B2B Q4 2024', study_id: 'study_b2b', study_name: 'GWI Work', year: 2024, quarter: 4, start_date: '2024-10-01', end_date: '2024-12-31', location_ids: ['loc_us', 'loc_uk', 'loc_de', 'loc_jp'], sample_size: 15000 },
  { id: 'wave_gaming_2024', name: 'Gaming 2024', study_id: 'study_gaming', study_name: 'GWI Gaming', year: 2024, start_date: '2024-01-01', end_date: '2024-06-30', location_ids: ['loc_us', 'loc_uk', 'loc_de', 'loc_jp', 'loc_kr'], sample_size: 18000 },
  { id: 'wave_zeitgeist_dec', name: 'Zeitgeist Dec 2024', study_id: 'study_zeitgeist', study_name: 'GWI Zeitgeist', year: 2024, start_date: '2024-12-01', end_date: '2024-12-31', location_ids: mockLocations.slice(0, 10).map((l) => l.id), sample_size: 8500 },
]

export const mockStudies: Study[] = [
  { id: 'study_core', name: 'GWI Core', description: 'Flagship quarterly survey covering 40+ markets', waves: mockWaves.filter((w) => w.study_id === 'study_core') },
  { id: 'study_usa', name: 'GWI USA', description: 'US-focused deep dive with 25,000 respondents', waves: mockWaves.filter((w) => w.study_id === 'study_usa') },
  { id: 'study_kids', name: 'GWI Kids', description: 'Survey of children and teens aged 8-15', waves: mockWaves.filter((w) => w.study_id === 'study_kids') },
  { id: 'study_b2b', name: 'GWI Work', description: 'B2B decision-makers and professionals', waves: mockWaves.filter((w) => w.study_id === 'study_b2b') },
  { id: 'study_gaming', name: 'GWI Gaming', description: 'Gaming habits and platform usage', waves: mockWaves.filter((w) => w.study_id === 'study_gaming') },
  { id: 'study_zeitgeist', name: 'GWI Zeitgeist', description: 'Monthly pulse survey on trending topics', waves: mockWaves.filter((w) => w.study_id === 'study_zeitgeist') },
]

export const mockNamespaces: Namespace[] = [
  { id: 'ns_core', name: 'Core', description: 'Standard GWI question set' },
  { id: 'ns_custom', name: 'Custom', description: 'Organization-specific custom questions' },
  { id: 'ns_derived', name: 'Derived', description: 'Computed metrics and derived variables' },
]

export const mockSplitters: Splitter[] = [
  {
    id: 'sp_gender', name: 'Gender', description: 'Split by gender', type: 'demographic',
    datapoints: [
      { id: 'dp_gender_male', name: 'Male', question_id: 'q_gender', sort_order: 1 },
      { id: 'dp_gender_female', name: 'Female', question_id: 'q_gender', sort_order: 2 },
    ],
  },
  {
    id: 'sp_age', name: 'Age Group', description: 'Split by age group', type: 'demographic',
    datapoints: [
      { id: 'dp_age_16_24', name: '16-24', question_id: 'q_age_group', sort_order: 1 },
      { id: 'dp_age_25_34', name: '25-34', question_id: 'q_age_group', sort_order: 2 },
      { id: 'dp_age_35_44', name: '35-44', question_id: 'q_age_group', sort_order: 3 },
      { id: 'dp_age_45_54', name: '45-54', question_id: 'q_age_group', sort_order: 4 },
      { id: 'dp_age_55_64', name: '55-64', question_id: 'q_age_group', sort_order: 5 },
    ],
  },
  {
    id: 'sp_income', name: 'Income Level', description: 'Split by household income', type: 'demographic',
    datapoints: [
      { id: 'dp_income_low', name: 'Under $25,000', question_id: 'q_income', sort_order: 1 },
      { id: 'dp_income_mid', name: '$50,000 - $74,999', question_id: 'q_income', sort_order: 2 },
      { id: 'dp_income_high', name: '$100,000+', question_id: 'q_income', sort_order: 3 },
    ],
  },
  {
    id: 'sp_social_heavy', name: 'Heavy Social Users', description: 'Users spending 3+ hours on social media', type: 'behavioral',
    datapoints: [
      { id: 'dp_time_3plus', name: '3+ hours', question_id: 'q_social_time', sort_order: 1 },
    ],
  },
  {
    id: 'sp_tech_early', name: 'Tech Early Adopters', description: 'Users of 3+ device types', type: 'behavioral',
    datapoints: [
      { id: 'dp_smartphone', name: 'Smartphone', question_id: 'q_device_ownership', sort_order: 1 },
      { id: 'dp_smartwatch', name: 'Smartwatch', question_id: 'q_device_ownership', sort_order: 2 },
      { id: 'dp_smart_speaker', name: 'Smart Speaker', question_id: 'q_device_ownership', sort_order: 3 },
    ],
  },
  {
    id: 'sp_eco_conscious', name: 'Eco-Conscious', description: 'Users very or extremely concerned about environment', type: 'custom',
    datapoints: [
      { id: 'dp_env_4', name: 'Very concerned', question_id: 'q_env_concern', sort_order: 1 },
      { id: 'dp_env_5', name: 'Extremely concerned', question_id: 'q_env_concern', sort_order: 2 },
    ],
  },
]
