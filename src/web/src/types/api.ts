export interface User {
  id: string
  email: string
  name: string
  weight_unit: 'lbs' | 'kg'
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface WeightEntry {
  id: string
  weight_value: number
  recorded_at: string
  created_at: string
}

export interface PaginatedWeightResponse {
  entries: WeightEntry[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
