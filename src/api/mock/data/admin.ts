import type { OrganizationUser } from '../../types'
import { daysAgo } from '../helpers'

export const mockOrgUsers: OrganizationUser[] = [
  { id: 'user_sarah', email: 'sarah.chen@globalwebindex.com', name: 'Sarah Chen', role: 'admin', status: 'active', created_at: daysAgo(180), last_login_at: daysAgo(0) },
  { id: 'user_james', email: 'james.wilson@globalwebindex.com', name: 'James Wilson', role: 'manager', status: 'active', created_at: daysAgo(150), last_login_at: daysAgo(1) },
  { id: 'user_maria', email: 'maria.garcia@globalwebindex.com', name: 'Maria Garcia', role: 'analyst', status: 'active', created_at: daysAgo(120), last_login_at: daysAgo(0) },
  { id: 'user_alex', email: 'alex.kumar@globalwebindex.com', name: 'Alex Kumar', role: 'analyst', status: 'active', created_at: daysAgo(90), last_login_at: daysAgo(2) },
  { id: 'user_emma', email: 'emma.brown@globalwebindex.com', name: 'Emma Brown', role: 'analyst', status: 'active', created_at: daysAgo(85), last_login_at: daysAgo(0) },
  { id: 'user_liam', email: 'liam.taylor@globalwebindex.com', name: 'Liam Taylor', role: 'viewer', status: 'active', created_at: daysAgo(60), last_login_at: daysAgo(5) },
  { id: 'user_sophia', email: 'sophia.lee@globalwebindex.com', name: 'Sophia Lee', role: 'analyst', status: 'active', created_at: daysAgo(45), last_login_at: daysAgo(1) },
  { id: 'user_daniel', email: 'daniel.jones@globalwebindex.com', name: 'Daniel Jones', role: 'viewer', status: 'active', created_at: daysAgo(30), last_login_at: daysAgo(7) },
  { id: 'user_olivia', email: 'olivia.white@globalwebindex.com', name: 'Olivia White', role: 'manager', status: 'active', created_at: daysAgo(25), last_login_at: daysAgo(3) },
  { id: 'user_noah', email: 'noah.martinez@globalwebindex.com', name: 'Noah Martinez', role: 'analyst', status: 'invited', created_at: daysAgo(5), last_login_at: daysAgo(5) },
  { id: 'user_ava', email: 'ava.anderson@globalwebindex.com', name: 'Ava Anderson', role: 'viewer', status: 'invited', created_at: daysAgo(3), last_login_at: daysAgo(3) },
  { id: 'user_ethan', email: 'ethan.thomas@globalwebindex.com', name: 'Ethan Thomas', role: 'analyst', status: 'disabled', created_at: daysAgo(200), last_login_at: daysAgo(60) },
]

export const mockUsageStats = {
  total_queries: 14580,
  active_users: 9,
  api_calls: 52340,
  storage_used_mb: 2340,
}
