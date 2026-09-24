import type { FeeInvoice } from './types'

/**
 * Single source of truth for each student's behaviour. Attendance records, marks,
 * invoices and every analytics screen are generated FROM these targets, so the same
 * student ID shows a consistent attendance %, grade profile and fee status everywhere.
 */
export type StudentProfile = {
  studentId: string
  attendanceTarget: number
  performanceTarget: number
  feeBehaviour: FeeInvoice['status']
  engagement: number
  note: string
}

export const studentProfiles: StudentProfile[] = [
  { studentId: 'stu-01', attendanceTarget: 97, performanceTarget: 92, feeBehaviour: 'paid', engagement: 95, note: 'Consistent top performer, active in olympiad club.' },
  { studentId: 'stu-02', attendanceTarget: 88, performanceTarget: 74, feeBehaviour: 'partial', engagement: 72, note: 'Strong in practicals, needs revision discipline.' },
  { studentId: 'stu-03', attendanceTarget: 94, performanceTarget: 86, feeBehaviour: 'paid', engagement: 88, note: 'Reliable, contributes well in group work.' },
  { studentId: 'stu-04', attendanceTarget: 71, performanceTarget: 58, feeBehaviour: 'overdue', engagement: 54, note: 'Attendance drop flagged — guardian follow-up open.' },
  { studentId: 'stu-05', attendanceTarget: 92, performanceTarget: 81, feeBehaviour: 'paid', engagement: 84, note: 'Steady improvement across term assessments.' },
  { studentId: 'stu-06', attendanceTarget: 85, performanceTarget: 69, feeBehaviour: 'partial', engagement: 66, note: 'Distracted in afternoon periods, improving.' },
  { studentId: 'stu-07', attendanceTarget: 98, performanceTarget: 90, feeBehaviour: 'paid', engagement: 93, note: 'Class topper in language assessments.' },
  { studentId: 'stu-08', attendanceTarget: 79, performanceTarget: 63, feeBehaviour: 'overdue', engagement: 60, note: 'Transport delays affecting punctuality.' },
  { studentId: 'stu-09', attendanceTarget: 96, performanceTarget: 88, feeBehaviour: 'paid', engagement: 90, note: 'Excellent participation in doubt forum.' },
  { studentId: 'stu-10', attendanceTarget: 90, performanceTarget: 77, feeBehaviour: 'partial', engagement: 78, note: 'Sports scholarship candidate.' },
]
