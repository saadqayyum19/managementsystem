import { api } from './api'

export type Assignment = { _id: string; title: string; description?: string; classId: { name?: string; code?: string } | string; subjectId: { name?: string; code?: string } | string; dueDate: string; maxMarks: number; status: string; teacherId: { firstName?: string; lastName?: string } | string }
export async function getAssignments() { const response = await api.get<{ data: Assignment[] }>('/assignments'); return response.data.data }
export async function createAssignment(payload: Record<string, unknown>) { const response = await api.post<{ data: Assignment }>('/assignments', payload); return response.data.data }
export async function submitAssignment(id: string, payload: { content: string; status: 'submitted' }) { await api.post(`/assignments/${id}/submit`, payload) }
