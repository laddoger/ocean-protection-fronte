export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface Category {
  id: number
  name: string
  description: string
  createdTime: string
  updatedTime: string
  deleted: boolean
}

export interface Animal {
  id: number
  categoryId: number
  name: string
  scientificName: string
  coverImage: string | null
  description: string
  habitat: string
  conservationStatus: string
  featured: boolean
  createdTime: string
  updatedTime: string
  deleted: boolean
} 