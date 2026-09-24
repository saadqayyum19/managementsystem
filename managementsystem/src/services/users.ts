import { api } from './api'
import type { AuthUser, UserRole } from '../store/authSlice'

export type UserRecord = AuthUser & { phone?: string; permissions: string[]; isActive: boolean; isEmailVerified: boolean; lastLoginAt?: string; createdAt: string }
export type UserFilters = { page: number; limit: number; search: string; role: UserRole | 'all'; isActive: 'all' | 'active' | 'inactive' }
export type UserListResponse = { success: boolean; data: UserRecord[]; meta: { page: number; limit: number; total: number; pages: number } }
export type UserInput = { firstName: string; lastName: string; email: string; phone?: string; password?: string; role: UserRole; permissions?: string[]; avatarUrl?: string | null; isActive?: boolean }

export async function getUsers(filters: UserFilters): Promise<UserListResponse> {
  const response = await api.get<UserListResponse>('/users', { params: { page: filters.page, limit: filters.limit, search: filters.search || undefined, role: filters.role === 'all' ? undefined : filters.role, isActive: filters.isActive === 'all' ? undefined : filters.isActive === 'active' } })
  return response.data
}

export async function createUser(input: UserInput) { const response = await api.post<{ data: UserRecord }>('/users', input); return response.data.data }
export async function updateUser(id: string, input: UserInput) { const response = await api.patch<{ data: UserRecord }>(`/users/${id}`, input); return response.data.data }
export async function deactivateUser(id: string) { await api.delete(`/users/${id}`) }
