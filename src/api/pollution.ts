import request from '@/utils/request'

export interface PollutionPercentage {
    category: string
    percentage: number
  }
  
  export interface PollutionInfo {
    id: number
    name: string
    category: string
    percentage: number
    harmDescription: string
    protectionMeasures: string
    createdTime: string
    updatedTime: string
    deleted: boolean
  }

  export const pollutionApi = {
  // 获取污染物占比
  getPercentages: () => 
    request.get<PollutionInfo[]>('/pollution/percentages'),

  // 获取所有污染物信息
  getPollutionList: () => 
    request.get<PollutionInfo[]>('/pollution/list'),

  // 搜索污染物
  searchPollution: (name: string) => 
    request.get<PollutionInfo>(`/pollution/search`, { 
      params: { name }
    })
} 