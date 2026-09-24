import { api } from './api'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type AttendanceRecord = { _id: string; studentId: { _id: string; firstName: string; lastName: string; email: string } | string; classId: { name?: string; code?: string } | string; date: string; status: AttendanceStatus; method: string; notes?: string }
export type AttendanceReport = { summary: { totalStudents: number; averageRate: number; defaulters: number }; students: Array<{ _id: string; total: number; present: number; absent: number; late: number; attendanceRate: number }>; defaulters: Array<{ _id: string; attendanceRate: number }> }
export async function getAttendance(date: string) { const response = await api.get<{ data: AttendanceRecord[] }>('/attendance', { params: { date } }); return response.data.data }
export async function getAttendanceReport(from?: string, to?: string) { const response = await api.get<{ data: AttendanceReport }>('/attendance/report', { params: { from, to } }); return response.data.data }
export async function saveAttendance(date: string, entries: Array<{ studentId: string; classId: string; status: AttendanceStatus; method: 'manual' }>) { const response = await api.post('/attendance/bulk', { date, entries }); return response.data }
