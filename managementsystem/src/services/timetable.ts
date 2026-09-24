import { api } from './api'

export type TimetablePerson = { firstName?: string; lastName?: string; name?: string } | string
export type TimetableEntry = { _id: string; academicYear: string; dayOfWeek: number; startTime: string; endTime: string; subjectId: { name?: string; code?: string } | string; classId: { name?: string; code?: string } | string; sectionId?: { name?: string; code?: string } | string; teacherId: TimetablePerson; room?: string; isActive: boolean }
export type TimetableInput = { academicYear: string; dayOfWeek: number; startTime: string; endTime: string; subjectId: string; classId: string; sectionId?: string; teacherId: string; room?: string }

export async function getTimetable(params: { academicYear?: string; classId?: string; teacherId?: string }) { const response = await api.get<{ data: TimetableEntry[] }>('/timetable', { params }); return response.data.data }
export async function updateTimetable(id: string, input: Partial<TimetableInput>) { const response = await api.patch<{ data: TimetableEntry }>(`/timetable/${id}`, input); return response.data.data }
