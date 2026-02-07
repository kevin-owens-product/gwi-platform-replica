import type { Crosstab } from '../../types'
import { daysAgo } from '../helpers'

export const mockCrosstabs: Crosstab[] = [
  {
    id: 'xt_social_by_age', name: 'Social Media Usage by Age Group', description: 'Platform usage cross-tabulated with age demographics',
    created_at: daysAgo(20), updated_at: daysAgo(3), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'heatmap' },
    },
  },
  {
    id: 'xt_streaming_income', name: 'Streaming Services by Income', description: 'Streaming platform preference by household income',
    created_at: daysAgo(15), updated_at: daysAgo(5), user_id: 'user_maria', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_tv_platforms', datapoint_ids: ['dp_netflix', 'dp_disney', 'dp_prime', 'dp_hbo', 'dp_hulu', 'dp_apple_tv'] }],
      columns: [{ type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'above_average', threshold: 110 },
    },
  },
  {
    id: 'xt_purchase_gender', name: 'Online Purchases by Gender', description: 'E-commerce purchase categories split by gender',
    created_at: daysAgo(12), updated_at: daysAgo(4), user_id: 'user_sarah', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_purchase_online', datapoint_ids: ['dp_clothing', 'dp_electronics', 'dp_food_delivery', 'dp_beauty', 'dp_home_garden'] }],
      columns: [{ type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female', 'dp_gender_nonbinary'] }],
      metrics: ['audience_percentage', 'audience_size', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      highlight: { type: 'significance' },
    },
  },
  {
    id: 'xt_fitness_age', name: 'Fitness Activities by Age', description: 'Physical activity participation across age groups',
    created_at: daysAgo(10), updated_at: daysAgo(2), user_id: 'user_alex', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_fitness', datapoint_ids: ['dp_gym', 'dp_running', 'dp_yoga', 'dp_swimming', 'dp_cycling'] }],
      columns: [{ type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'heatmap' },
    },
  },
  {
    id: 'xt_brand_by_audience', name: 'Brand Discovery by Audience', description: 'How different audience segments discover brands',
    created_at: daysAgo(7), updated_at: daysAgo(1), user_id: 'user_sophia', is_shared: true,
    config: {
      rows: [{ type: 'question', question_id: 'q_brand_discovery', datapoint_ids: ['dp_social_ads', 'dp_influencer', 'dp_search', 'dp_word_of_mouth', 'dp_tv_ads'] }],
      columns: [{ type: 'audience', audience_id: 'aud_gen_z_social' }, { type: 'audience', audience_id: 'aud_tech_savvy' }, { type: 'audience', audience_id: 'aud_eco_shoppers' }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'above_average', threshold: 120 },
    },
  },
  {
    id: 'xt_news_education', name: 'News Sources by Education', description: 'News consumption patterns by education level',
    created_at: daysAgo(5), updated_at: daysAgo(0), user_id: 'user_emma', is_shared: false,
    config: {
      rows: [{ type: 'question', question_id: 'q_news_sources', datapoint_ids: ['dp_news_social', 'dp_news_tv', 'dp_news_online', 'dp_news_podcast', 'dp_news_print'] }],
      columns: [{ type: 'question', question_id: 'q_education', datapoint_ids: ['dp_edu_hs', 'dp_edu_bachelor', 'dp_edu_master', 'dp_edu_phd'] }],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us', 'loc_uk'],
      highlight: { type: 'heatmap' },
    },
  },

  // --- Large-scale crosstabs ---

  {
    id: 'xt_media_deep_dive', name: 'Media Consumption Deep Dive', description: 'Multi-question media consumption cross-tabulated with demographics',
    created_at: daysAgo(25), updated_at: daysAgo(1), user_id: 'user_sarah', is_shared: true,
    config: {
      rows: [
        { type: 'question', question_id: 'q_social_platforms', datapoint_ids: ['dp_facebook', 'dp_instagram', 'dp_tiktok', 'dp_twitter', 'dp_linkedin', 'dp_youtube', 'dp_snapchat', 'dp_pinterest', 'dp_reddit', 'dp_whatsapp', 'dp_telegram', 'dp_discord'] },
        { type: 'question', question_id: 'q_streaming_services', datapoint_ids: ['dp_netflix', 'dp_disney', 'dp_prime', 'dp_hbo', 'dp_hulu', 'dp_apple_tv', 'dp_peacock', 'dp_paramount', 'dp_crunchyroll', 'dp_tubi'] },
        { type: 'question', question_id: 'q_music_platforms', datapoint_ids: ['dp_spotify', 'dp_apple_music', 'dp_youtube_music', 'dp_amazon_music', 'dp_tidal', 'dp_soundcloud', 'dp_deezer', 'dp_pandora'] },
        { type: 'question', question_id: 'q_podcast_platforms', datapoint_ids: ['dp_spotify_pods', 'dp_apple_pods', 'dp_google_pods', 'dp_overcast', 'dp_pocket_casts', 'dp_stitcher'] },
        { type: 'question', question_id: 'q_news_sources', datapoint_ids: ['dp_news_social', 'dp_news_tv', 'dp_news_online', 'dp_news_podcast', 'dp_news_print', 'dp_news_radio', 'dp_news_aggregator', 'dp_news_newsletter'] },
        { type: 'question', question_id: 'q_gaming_platforms', datapoint_ids: ['dp_pc_gaming', 'dp_ps5', 'dp_xbox', 'dp_nintendo', 'dp_mobile_gaming', 'dp_cloud_gaming', 'dp_vr_gaming', 'dp_handheld_gaming'] },
      ],
      columns: [
        { type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] },
        { type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female', 'dp_gender_nonbinary'] },
        { type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] },
        { type: 'question', question_id: 'q_region', datapoint_ids: ['dp_region_northeast', 'dp_region_southeast', 'dp_region_midwest', 'dp_region_southwest', 'dp_region_west'] },
        { type: 'question', question_id: 'q_education', datapoint_ids: ['dp_edu_hs', 'dp_edu_bachelor', 'dp_edu_master', 'dp_edu_phd'] },
        { type: 'question', question_id: 'q_employment', datapoint_ids: ['dp_emp_full_time', 'dp_emp_part_time', 'dp_emp_self', 'dp_emp_student', 'dp_emp_retired'] },
        { type: 'question', question_id: 'q_marital_status', datapoint_ids: ['dp_marital_single', 'dp_marital_married', 'dp_marital_divorced', 'dp_marital_widowed'] },
        { type: 'question', question_id: 'q_children', datapoint_ids: ['dp_children_none', 'dp_children_1', 'dp_children_2', 'dp_children_3plus'] },
      ],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'heatmap' },
    },
  },
  {
    id: 'xt_brand_health_tech', name: 'Brand Health Tracker - Tech Brands', description: 'Awareness, consideration and usage metrics for major tech brands',
    created_at: daysAgo(18), updated_at: daysAgo(2), user_id: 'user_maria', is_shared: true,
    config: {
      rows: [
        { type: 'question', question_id: 'q_tech_brands_awareness', datapoint_ids: [
          'dp_brand_apple', 'dp_brand_samsung', 'dp_brand_google', 'dp_brand_microsoft', 'dp_brand_amazon',
          'dp_brand_meta', 'dp_brand_sony', 'dp_brand_lg', 'dp_brand_hp', 'dp_brand_dell',
          'dp_brand_lenovo', 'dp_brand_asus', 'dp_brand_nvidia',
        ] },
        { type: 'question', question_id: 'q_tech_brands_consideration', datapoint_ids: [
          'dp_consider_apple', 'dp_consider_samsung', 'dp_consider_google', 'dp_consider_microsoft', 'dp_consider_amazon',
          'dp_consider_meta', 'dp_consider_sony', 'dp_consider_lg', 'dp_consider_hp', 'dp_consider_dell',
          'dp_consider_lenovo', 'dp_consider_asus', 'dp_consider_nvidia',
        ] },
      ],
      columns: [
        { type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] },
        { type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female', 'dp_gender_nonbinary'] },
        { type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] },
        { type: 'question', question_id: 'q_education', datapoint_ids: ['dp_edu_hs', 'dp_edu_bachelor', 'dp_edu_master', 'dp_edu_phd'] },
      ],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'above_average', threshold: 110 },
    },
  },
  {
    id: 'xt_global_attitudes', name: 'Global Consumer Attitudes', description: 'Attitude statements tracked across 12 countries',
    created_at: daysAgo(30), updated_at: daysAgo(3), user_id: 'user_alex', is_shared: true,
    config: {
      rows: [
        { type: 'question', question_id: 'q_attitudes_environment', datapoint_ids: [
          'dp_att_climate_priority', 'dp_att_recycle_regularly', 'dp_att_buy_sustainable', 'dp_att_reduce_plastic',
          'dp_att_carbon_footprint', 'dp_att_eco_brands', 'dp_att_ev_interest', 'dp_att_renewable_energy',
          'dp_att_plant_based', 'dp_att_fast_fashion_avoid',
        ] },
        { type: 'question', question_id: 'q_attitudes_technology', datapoint_ids: [
          'dp_att_ai_positive', 'dp_att_privacy_concerned', 'dp_att_early_adopter', 'dp_att_smart_home',
          'dp_att_crypto_interest', 'dp_att_metaverse_interest', 'dp_att_screen_time_worry', 'dp_att_digital_detox',
          'dp_att_wearable_tech', 'dp_att_autonomous_vehicles',
        ] },
        { type: 'question', question_id: 'q_attitudes_health', datapoint_ids: [
          'dp_att_mental_health_priority', 'dp_att_fitness_important', 'dp_att_organic_food', 'dp_att_meditation',
          'dp_att_sleep_quality', 'dp_att_work_life_balance', 'dp_att_preventive_care', 'dp_att_supplements',
          'dp_att_gym_member', 'dp_att_health_apps',
        ] },
        { type: 'question', question_id: 'q_attitudes_finance', datapoint_ids: [
          'dp_att_saving_priority', 'dp_att_invest_stocks', 'dp_att_budget_conscious', 'dp_att_buy_now_pay_later',
          'dp_att_financial_anxiety', 'dp_att_homeownership_goal', 'dp_att_side_hustle', 'dp_att_subscription_fatigue',
          'dp_att_luxury_worth', 'dp_att_brand_loyalty',
        ] },
        { type: 'question', question_id: 'q_attitudes_social', datapoint_ids: [
          'dp_att_diversity_important', 'dp_att_community_active', 'dp_att_volunteer', 'dp_att_political_engaged',
          'dp_att_trust_institutions', 'dp_att_social_media_positive', 'dp_att_cancel_culture_concern', 'dp_att_local_business_support',
          'dp_att_remote_work_prefer', 'dp_att_city_life_prefer',
        ] },
      ],
      columns: [
        { type: 'question', question_id: 'q_country', datapoint_ids: [
          'dp_country_us', 'dp_country_uk', 'dp_country_de', 'dp_country_fr', 'dp_country_jp',
          'dp_country_br', 'dp_country_in', 'dp_country_au', 'dp_country_ca', 'dp_country_mx',
          'dp_country_kr', 'dp_country_it',
        ] },
      ],
      metrics: ['audience_percentage', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_global'],
      highlight: { type: 'heatmap' },
    },
  },
  {
    id: 'xt_purchase_journey', name: 'Purchase Journey by Demographics', description: 'Product categories and purchase channels across demographic segments',
    created_at: daysAgo(14), updated_at: daysAgo(1), user_id: 'user_sophia', is_shared: true,
    config: {
      rows: [
        { type: 'question', question_id: 'q_purchase_categories', datapoint_ids: [
          'dp_pcat_clothing', 'dp_pcat_electronics', 'dp_pcat_groceries', 'dp_pcat_beauty', 'dp_pcat_home',
          'dp_pcat_sports', 'dp_pcat_books', 'dp_pcat_toys', 'dp_pcat_automotive', 'dp_pcat_jewelry',
          'dp_pcat_pet', 'dp_pcat_office', 'dp_pcat_garden', 'dp_pcat_health', 'dp_pcat_travel',
        ] },
        { type: 'question', question_id: 'q_purchase_channels', datapoint_ids: [
          'dp_chan_amazon', 'dp_chan_brand_website', 'dp_chan_social_commerce', 'dp_chan_marketplace', 'dp_chan_in_store',
          'dp_chan_mobile_app', 'dp_chan_subscription', 'dp_chan_second_hand', 'dp_chan_live_shopping', 'dp_chan_voice_assistant',
        ] },
        { type: 'question', question_id: 'q_purchase_drivers', datapoint_ids: [
          'dp_drv_price', 'dp_drv_quality', 'dp_drv_brand', 'dp_drv_reviews', 'dp_drv_convenience',
          'dp_drv_sustainability', 'dp_drv_recommendation', 'dp_drv_loyalty_program', 'dp_drv_free_shipping', 'dp_drv_returns_policy',
        ] },
        { type: 'question', question_id: 'q_purchase_frequency', datapoint_ids: [
          'dp_freq_daily', 'dp_freq_weekly', 'dp_freq_biweekly', 'dp_freq_monthly', 'dp_freq_quarterly',
        ] },
      ],
      columns: [
        { type: 'question', question_id: 'q_age_group', datapoint_ids: ['dp_age_16_24', 'dp_age_25_34', 'dp_age_35_44', 'dp_age_45_54', 'dp_age_55_64'] },
        { type: 'question', question_id: 'q_gender', datapoint_ids: ['dp_gender_male', 'dp_gender_female', 'dp_gender_nonbinary'] },
        { type: 'question', question_id: 'q_income', datapoint_ids: ['dp_income_low', 'dp_income_mid_low', 'dp_income_mid', 'dp_income_mid_high', 'dp_income_high'] },
        { type: 'question', question_id: 'q_region', datapoint_ids: ['dp_region_northeast', 'dp_region_southeast', 'dp_region_midwest', 'dp_region_southwest', 'dp_region_west'] },
      ],
      metrics: ['audience_percentage', 'audience_size', 'audience_index'], wave_ids: [{ study_id: 'study_core', wave_id: 'wave_2024q4' }], location_ids: ['loc_us'],
      highlight: { type: 'significance' },
    },
  },
]
