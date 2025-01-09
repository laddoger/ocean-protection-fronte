import request from '@/utils/request'
import type { Organization, Activity, CreateOrgForm } from '@/types/volunteer'

// 移除单独的认证头设置，使用统一的请求拦截器
export const volunteerApi = {
  // 组织相关
  getOrganizations: () => 
    request.get<Organization[]>('/volunteer/organizations'),
  
  searchOrganizations: (keyword: string) => 
    request.get<Organization[]>('/volunteer/organizations/search', {
      params: { keyword }
    }),
  
  createOrganization: (data: CreateOrgForm) => 
    request.post<Organization>('/volunteer/organizations', data),
  
  deleteOrganization: (id: number) => 
    request.delete<void>(`/volunteer/organizations/${id}`),
  
  joinOrganization: (id: number) => 
    request.post<void>(`/volunteer/organizations/${id}/join`),
  
  leaveOrganization: (id: number) => 
    request.post<void>(`/volunteer/organizations/${id}/leave`),

  // 活动相关
  getOngoingActivities: () => 
    request.get<Activity[]>('/volunteer/activities/ongoing'),
  
  getFinishedActivities: () => 
    request.get<Activity[]>('/volunteer/activities/finished'),
  
  searchActivities: (keyword: string) => 
    request.get<Activity[]>('/volunteer/activities/search', {
      params: { keyword }
    }),
  
  getActivityDetail: (id: number) => 
    request.get<Activity>(`/volunteer/activities/${id}`),
  
  joinActivity: (id: number) => 
    request.post<void>(`/volunteer/activities/${id}/join`),
  
  leaveActivity: (id: number) => 
    request.post<void>(`/volunteer/activities/${id}/leave`),

  // 解散组织
  disbandOrganization: (organizationId: number) =>
    request.delete<ApiResponse<void>>(`/volunteer/organizations/${organizationId}`),
} 