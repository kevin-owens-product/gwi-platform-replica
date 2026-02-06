import type { User } from '../../types'
import { daysAgo } from '../helpers'

export const mockUser: User = {
  id: 'user_sarah',
  email: 'sarah.chen@globalwebindex.com',
  name: 'Sarah Chen',
  avatar_url: undefined,
  role: 'admin',
  organization_id: 'org_gwi_demo',
  organization_name: 'GWI Demo Workspace',
  created_at: daysAgo(180),
  last_login_at: daysAgo(0),
  preferences: {
    default_wave_ids: ['wave_2024q4'],
    default_location_ids: ['loc_us', 'loc_uk'],
    theme: 'light',
    locale: 'en-US',
    timezone: 'America/New_York',
  },
}
