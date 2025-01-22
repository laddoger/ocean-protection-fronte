import request from '@/utils/request'
import type { Organization, Activity, CreateOrgForm } from '@/types/volunteer'
import type { ApiResponse } from '@/types/pollution'

// 移除单独的认证头设置，使用统一的请求拦截器
export const volunteerApi = {
  // 组织相关
  getOrganizations: () => 
    request.get<ApiResponse<Organization[]>>('/volunteer/organizations'),
  
  searchOrganizations: (keyword: string) => 
    request.get<Organization[]>('/volunteer/organizations/search', {
      params: { keyword }
    }),
  
  createOrganization: (data: CreateOrgForm) => 
    request.post<Organization>('/volunteer/organizations', data),
  
  deleteOrganization: (id: number) => 
    request.delete<void>(`/volunteer/organizations/${id}`),
  
  joinOrganization: (id: number) => 
    request.post<ApiResponse<void>>(`/volunteer/organizations/${id}/join`),
  
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

  // 检查用户是否是组织成员
  checkMembership: (organizationId: number) =>
    request.get<ApiResponse<boolean>>(`/organizations/${organizationId}/membership`),
    
  // 退出组织
  quitOrganization: (organizationId: number) =>
    request.post<ApiResponse<void>>(`/volunteer/organizations/${organizationId}/leave`),

  // 加入组织
  joinOrganization: (id: number) => 
    request.post<ApiResponse<void>>(`/volunteer/organizations/${id}/join`),

  // 检查用户是否参加活动
  isParticipant: (activityId: number) =>
    request.get<ApiResponse<boolean>>(`/volunteer/activities/${activityId}/participation`)
} 