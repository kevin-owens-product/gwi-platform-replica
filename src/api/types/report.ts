import type { PaginationParams } from './common'

export interface Report {
  id: string
  name: string
  type: 'PDF' | 'XLSX' | 'CSV' | 'PPTX'
  size: string
  category: 'industry' | 'research' | 'custom'
  tags: string[]
  download_url: string
  created_at: string
  updated_at: string
}

export interface ReportListParams extends PaginationParams {
  search?: string
  category?: string
}
