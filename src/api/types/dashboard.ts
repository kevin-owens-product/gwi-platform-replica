// Dashboard types for the GWI Platform API

import type { ChartConfig, ChartType } from './chart'

export interface Dashboard {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  layout: DashboardLayout
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  is_shared: boolean
  thumbnail_url?: string
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'stat' | 'text' | 'image'
  title?: string
  chart_id?: string
  chart_type?: ChartType
  chart_config?: ChartConfig
  text_content?: string
  image_url?: string
  position: WidgetPosition
}

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface DashboardLayout {
  columns: number
  row_height: number
}

export interface CreateDashboardRequest {
  name: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: DashboardLayout
  project_id?: string
  is_shared?: boolean
}

export interface UpdateDashboardRequest {
  name?: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: DashboardLayout
  is_shared?: boolean
}
