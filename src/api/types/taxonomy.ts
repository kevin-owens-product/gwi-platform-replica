// Taxonomy types for the GWI Platform API

export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  children?: Category[]
  question_count: number
  sort_order: number
}

export interface Question {
  id: string
  name: string
  description?: string
  category_id: string
  category_name: string
  type: QuestionType
  datapoints: Datapoint[]
  wave_ids: string[]
  namespace_id: string
  is_custom?: boolean
}

export type QuestionType = 'single' | 'multi' | 'scale' | 'grid' | 'open' | 'numeric'

export interface Datapoint {
  id: string
  name: string
  question_id: string
  sort_order: number
  is_summary?: boolean
}

export interface Wave {
  id: string
  name: string
  study_id: string
  study_name: string
  year: number
  quarter?: number
  start_date: string
  end_date: string
  location_ids: string[]
  sample_size: number
}

export interface Study {
  id: string
  name: string
  description?: string
  waves: Wave[]
}

export interface Splitter {
  id: string
  name: string
  description?: string
  type: 'demographic' | 'behavioral' | 'custom'
  datapoints: Datapoint[]
}

export interface QuestionFilterParams {
  search?: string
  category_id?: string
  namespace_id?: string
  wave_id?: string
  location_id?: string
  type?: QuestionType
  page?: number
  per_page?: number
}

export interface CategoryFilterParams {
  parent_id?: string
  namespace_id?: string
  search?: string
}
