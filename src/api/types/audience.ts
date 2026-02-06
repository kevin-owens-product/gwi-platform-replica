// Audience types for the GWI Platform API

export interface Audience {
  id: string
  name: string
  description?: string
  expression: AudienceExpression
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  is_shared: boolean
  sample_size?: number
  population_size?: number
}

export type AudienceExpression =
  | AudienceAnd
  | AudienceOr
  | AudienceNot
  | AudienceQuestion
  | AudienceDatapoint

export interface AudienceAnd {
  and: AudienceExpression[]
}

export interface AudienceOr {
  or: AudienceExpression[]
}

export interface AudienceNot {
  not: AudienceExpression
}

export interface AudienceQuestion {
  question: {
    question_id: string
    datapoint_ids: string[]
  }
}

export interface AudienceDatapoint {
  datapoint: {
    datapoint_id: string
  }
}

export interface CreateAudienceRequest {
  name: string
  description?: string
  expression: AudienceExpression
  project_id?: string
  is_shared?: boolean
}

export interface UpdateAudienceRequest {
  name?: string
  description?: string
  expression?: AudienceExpression
  is_shared?: boolean
}

export interface AudienceListParams {
  page?: number
  per_page?: number
  search?: string
  project_id?: string
  sort_by?: 'name' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
}
