import { api } from './api'

export type AcademicResource = 'classes' | 'sections' | 'subjects' | 'departments' | 'programs' | 'semesters'
export type AcademicRecord = { _id: string; [key: string]: unknown }
export type AcademicResponse = { success: boolean; data: AcademicRecord[]; meta: { resource: AcademicResource; page: number; limit: number; total: number; pages: number } }
export type AcademicFilters = { page: number; limit: number; search: string; isActive: 'all' | 'active' | 'inactive' }

export async function getAcademic(resource: AcademicResource, filters: AcademicFilters) { const response = await api.get<AcademicResponse>(`/academics/${resource}`, { params: { ...filters, search: filters.search || undefined, isActive: filters.isActive === 'all' ? undefined : filters.isActive === 'active' } }); return response.data }
export async function createAcademic(resource: AcademicResource, payload: Record<string, unknown>) { const response = await api.post<{ data: AcademicRecord }>(`/academics/${resource}`, payload); return response.data.data }
export async function updateAcademic(resource: AcademicResource, id: string, payload: Record<string, unknown>) { const response = await api.patch<{ data: AcademicRecord }>(`/academics/${resource}/${id}`, payload); return response.data.data }
export async function deleteAcademic(resource: AcademicResource, id: string) { await api.delete(`/academics/${resource}/${id}`) }
