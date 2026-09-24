import { api } from './api'

export type Exam = { _id: string; name: string; examType: string; academicYear: string; startDate: string; endDate: string; status: 'draft' | 'published' | 'closed'; subjects: Array<{ subjectId: string | { name?: string; code?: string }; maxMarks: number; passMarks: number }> }
export type ExamResult = { _id: string; studentId: { firstName: string; lastName: string; email: string } | string; totalMarks: number; obtainedMarks: number; percentage: number; gpa: number; grade: string; isPublished: boolean }
export async function getExams() { const response = await api.get<{ data: Exam[] }>('/exams'); return response.data.data }
export async function createExam(payload: Record<string, unknown>) { const response = await api.post<{ data: Exam }>('/exams', payload); return response.data.data }
export async function getResults(examId: string) { const response = await api.get<{ data: ExamResult[] }>(`/exams/${examId}/results`); return response.data.data }
export async function enterMarks(examId: string, entries: Array<{ studentId: string; subjectId: string; marks: number; maxMarks: number; remarks?: string }>) { await api.post(`/exams/${examId}/marks`, { entries }) }
export async function generateResults(examId: string) { const response = await api.post<{ data: { generated: number } }>(`/exams/${examId}/results/generate`); return response.data.data }
