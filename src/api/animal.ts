import request from '@/utils/request'
import type { ApiResponse } from '@/types/pollution'

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
}

export interface AnimalCategory {
  id: number
  name: string
  description: string
}

// 导出 API 函数
export function getAnimalCategories() {
  return request.get<ApiResponse<AnimalCategory[]>>('/animals/categories')
}

export function getFeaturedAnimals() {
  return request.get<ApiResponse<Animal[]>>('/animals/featured')
}

export function getAnimalsByCategory(categoryId: number) {
  return request.get<ApiResponse<Animal[]>>(`/animals/categories/${categoryId}/animals`)
}

export function getAnimalDetail(id: number) {
  return request.get<ApiResponse<Animal>>(`/animals/${id}`)
}

// 也可以使用对象形式导出
export const animalApi = {
  getCategories: getAnimalCategories,
  getFeaturedAnimals,
  getAnimalsByCategory,
  getAnimalDetail
} 