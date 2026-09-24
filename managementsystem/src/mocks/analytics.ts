import { attendance, attendanceRateFor, averagePercentOfStudent, classNameOf, marks, percentOf, schoolClasses, studentsOfClass, subjects } from './academics'
import { feeStatusOfStudent } from './finance'
import { students, teachers } from './people'
import { studentProfiles } from './profiles'
import { last30Days, round } from './seed'

export type StudentPerformanceRow = {
  studentId: string
  name: string
  rollNo: string
  classId: string
  className: string
  average: number
  attendance: number
  grade: string
  bestSubject: string
  weakSubject: string
  feeStatus: string
  trend: Array<{ label: string; score: number }>
}

const gradeOf = (percent: number) => percent >= 90 ? 'A+' : percent >= 80 ? 'A' : percent >= 70 ? 'B' : percent >= 60 ? 'C' : percent >= 50 ? 'D' : 'E'

function subjectAveragesOf(studentId: string) {
  const mine = marks.filter((mark) => mark.studentId === studentId)
  return subjects.map((subject) => {
    const subjectMarks = mine.filter((mark) => mark.subjectId === subject.id)
    return { name: subject.name, average: subjectMarks.length === 0 ? 0 : round(subjectMarks.reduce((sum, mark) => sum + percentOf(mark), 0) / subjectMarks.length, 1) }
  }).filter((entry) => entry.average > 0)
}

/** Every metric on the analytics screens is derived from the shared raw records, so they never disagree. */
export function studentPerformanceRows(): StudentPerformanceRow[] {
  return students.map((student) => {
    const subjectScores = subjectAveragesOf(student.id)
    const sorted = [...subjectScores].sort((left, right) => right.average - left.average)
    const profile = studentProfiles.find((item) => item.studentId === student.id)
    const base = profile?.performanceTarget ?? 70
    const average = averagePercentOfStudent(student.id)
    return {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      rollNo: student.rollNo,
      classId: student.classId,
      className: classNameOf(student.classId),
      average,
      attendance: attendanceRateFor(student.id, attendance),
      grade: gradeOf(average),
      bestSubject: sorted[0]?.name ?? '—',
      weakSubject: sorted.length > 1 ? sorted[sorted.length - 1].name : '—',
      feeStatus: feeStatusOfStudent(student.id),
      trend: last30Days.filter((_, index) => index % 6 === 0).map((date, index) => ({ label: date.slice(5), score: Math.max(35, Math.min(99, Math.round(base + (index - 2) * 3))) })),
    }
  })
}
export function subjectPerformanceRows() {
  return subjects.map((subject) => {
    const subjectMarks = marks.filter((mark) => mark.subjectId === subject.id)
    return {
      subjectId: subject.id,
      subject: subject.name,
      average: subjectMarks.length === 0 ? 0 : round(subjectMarks.reduce((sum, mark) => sum + percentOf(mark), 0) / subjectMarks.length, 1),
      passRate: subjectMarks.length === 0 ? 0 : round((subjectMarks.filter((mark) => percentOf(mark) >= 50).length / subjectMarks.length) * 100, 1),
      entries: subjectMarks.length,
      topScore: subjectMarks.length === 0 ? 0 : Math.max(...subjectMarks.map(percentOf)),
    }
  })
}

export function attendanceTrendRows() {
  return last30Days.map((date) => {
    const dayRecords = attendance.filter((record) => record.date === date)
    const credited = dayRecords.filter((record) => record.status === 'present' || record.status === 'late').length
    return {
      date: date.slice(5),
      rate: dayRecords.length === 0 ? 0 : round((credited / dayRecords.length) * 100, 1),
      present: credited,
      absent: dayRecords.filter((record) => record.status === 'absent').length,
      late: dayRecords.filter((record) => record.status === 'late').length,
    }
  })
}

export function classAttendanceRows() {
  return schoolClasses.map((schoolClass) => {
    const roster = studentsOfClass(schoolClass.id)
    const rates = roster.map((student) => attendanceRateFor(student.id, attendance))
    return {
      classId: schoolClass.id,
      className: schoolClass.name,
      students: roster.length,
      average: rates.length === 0 ? 0 : round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length, 1),
      belowThreshold: rates.filter((rate) => rate < 85).length,
    }
  })
}

export function teacherEffectivenessRows() {
  return teachers.map((teacher) => {
    const roster = teacher.classIds.flatMap((classId) => studentsOfClass(classId))
    const averagePerformance = roster.length === 0 ? 0 : round(roster.reduce((sum, student) => sum + averagePercentOfStudent(student.id), 0) / roster.length, 1)
    const averageAttendance = roster.length === 0 ? 0 : round(roster.reduce((sum, student) => sum + attendanceRateFor(student.id, attendance), 0) / roster.length, 1)
    return {
      teacherId: teacher.id,
      name: `${teacher.firstName} ${teacher.lastName}`,
      department: teacher.department,
      classes: teacher.classIds.length,
      students: roster.length,
      weeklyPeriods: teacher.weeklyPeriods,
      averagePerformance,
      averageAttendance,
      workloadScore: Math.min(100, Math.round((teacher.weeklyPeriods / 30) * 100)),
      effectiveness: round(averagePerformance * 0.6 + teacher.performanceScore * 0.4, 1),
    }
  })
}

export function atRiskRows() {
  return studentPerformanceRows().map((row) => {
    const engagement = studentProfiles.find((item) => item.studentId === row.studentId)?.engagement ?? 70
    const reasons: string[] = []
    if (row.attendance < 85) reasons.push(`Attendance at ${row.attendance}%`)
    if (row.average < 65) reasons.push(`Average score ${row.average}%`)
    if (row.feeStatus === 'overdue') reasons.push('Fee invoice overdue')
    if (engagement < 65) reasons.push('Low platform engagement')
    const riskScore = Math.max(0, Math.min(100, Math.round((100 - row.attendance) * 1.4 + (100 - row.average) * 1.1 + (engagement < 65 ? 12 : 0))))
    return {
      studentId: row.studentId,
      name: row.name,
      className: row.className,
      attendance: row.attendance,
      average: row.average,
      feeStatus: row.feeStatus,
      riskScore,
      riskLevel: riskScore >= 45 ? 'high' : riskScore >= 22 ? 'medium' : 'low',
      reasons: reasons.length > 0 ? reasons : ['No risk signals detected'],
      note: studentProfiles.find((item) => item.studentId === row.studentId)?.note ?? '',
    }
  }).sort((left, right) => right.riskScore - left.riskScore)
}

export function schoolHeadline() {
  const rows = studentPerformanceRows()
  const credited = attendance.filter((record) => record.status === 'present' || record.status === 'late').length
  return {
    students: students.length,
    teachers: teachers.length,
    classes: schoolClasses.length,
    attendanceRate: attendance.length === 0 ? 0 : round((credited / attendance.length) * 100, 1),
    averagePerformance: rows.length === 0 ? 0 : round(rows.reduce((sum, row) => sum + row.average, 0) / rows.length, 1),
    highRisk: atRiskRows().filter((row) => row.riskLevel === 'high').length,
    topPerformers: [...rows].sort((left, right) => right.average - left.average).slice(0, 3),
  }
}

export const reportModules = [
  { id: 'students', label: 'Students & guardians', columns: ['Name', 'Class', 'Attendance %', 'Average %', 'Fee status', 'Risk level'] },
  { id: 'attendance', label: 'Attendance records', columns: ['Date', 'Student', 'Class', 'Status', 'Method', 'Marked by'] },
  { id: 'marks', label: 'Examination marks', columns: ['Exam', 'Subject', 'Student', 'Marks', 'Grade', 'Remarks'] },
  { id: 'fees', label: 'Fee ledger', columns: ['Invoice', 'Term', 'Student', 'Billed', 'Paid', 'Due'] },
  { id: 'staff', label: 'Staff & payroll', columns: ['Employee', 'Department', 'Periods', 'Net pay', 'Status'] },
  { id: 'library', label: 'Library circulation', columns: ['Item', 'Member', 'Issued', 'Due', 'Fine', 'Status'] },
  { id: 'transport', label: 'Transport routes', columns: ['Route', 'Vehicle', 'Driver', 'Capacity', 'Assigned', 'Status'] },
  { id: 'audit', label: 'Audit trail', columns: ['Timestamp', 'Actor', 'Action', 'Module', 'Severity', 'IP'] },
]
