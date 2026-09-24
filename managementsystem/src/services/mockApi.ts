import { fetchMock } from './mockClient'
import {
  assignments, attendance, attendanceRateFor, classNameOf, doubtThreads, exams, libraryResources, liveClasses,
  marks, quizzes, schoolClasses, sections, slotsForTeacher, studentById, studentsOfClass, subjects,
  timetable, todayName, todaySlots,
} from '../mocks/academics'
import { holidays, hostelBlocks, inventoryItems, leaveRequests, libraryIssues, schoolEvents, transportRoutes, workspaceTasks } from '../mocks/operations'
import { students, teachers } from '../mocks/people'
import { announcements, autoReplies, chatThreads, messageTemplates, notifications } from '../mocks/communication'
import { auditLogs, auditSeverityCounts, backupRecords, backupSchedule, canDo, featureToggles, idCardRecords, institution, permissionMatrix } from '../mocks/system'
import { behaviorIncidents, behaviorSummary, chatbotConversations, chatbotSummary, faceAttendanceSessions, plagiarismReports, recommendations } from '../mocks/advanced'
import { attendanceTrendRows, atRiskRows, classAttendanceRows, reportModules, schoolHeadline, studentPerformanceRows, subjectPerformanceRows, teacherEffectivenessRows } from '../mocks/analytics'
import { collectionTrend, dueAmountOf, expenseBreakdown, expenseTotals, expenses, feeInvoices, feeStatusOfStudent, feeTotals, invoiceByStudent, paidAmountOf, payrollTotals, salarySlips, scholarshipTotals, scholarships } from '../mocks/finance'
import { guardians, mockUsers, nameOf, personRefs, studentProfiles } from '../mocks'
import type { Role } from '../mocks/types'

const list = <T,>(rows: T[]) => fetchMock(rows, [] as T[])

/** Pages declare a sensible "empty" payload so the demo Empty state still renders a valid shape. */
const payload = <T,>(data: T, empty: T) => fetchMock(data, empty)

export const mockApi = {
  /* ---------- academics ---------- */
  academicStructure: () => payload(
    { classes: schoolClasses, sections, subjects, teachers, students },
    { classes: [], sections: [], subjects: [], teachers: [], students: [] },
  ),
  timetableBoard: (classId?: string) => payload(
    { slots: classId ? timetable.filter((slot) => slot.classId === classId) : timetable, classes: schoolClasses, subjects, teachers, todayName, todaySlots },
    { slots: [], classes: [], subjects: [], teachers: [], todayName, todaySlots: [] },
  ),
  attendanceBoard: (date: string, classId?: string) => {
    const dayRecords = attendance.filter((record) => record.date === date)
    const roster = dayRecords
      .filter((record) => !classId || record.classId === classId)
      .map((record) => ({ record, student: studentById(record.studentId) }))
      .filter((entry): entry is { record: typeof dayRecords[number]; student: NonNullable<ReturnType<typeof studentById>> } => Boolean(entry.student))
    const credited = dayRecords.filter((record) => record.status === 'present' || record.status === 'late').length
    const summary = {
      total: dayRecords.length,
      present: dayRecords.filter((record) => record.status === 'present').length,
      absent: dayRecords.filter((record) => record.status === 'absent').length,
      late: dayRecords.filter((record) => record.status === 'late').length,
      excused: dayRecords.filter((record) => record.status === 'excused').length,
      rate: dayRecords.length === 0 ? 0 : Math.round((credited / dayRecords.length) * 100),
    }
    const defaulters = students
      .map((student) => ({ studentId: student.id, name: `${student.firstName} ${student.lastName}`, className: classNameOf(student.classId), rate: attendanceRateFor(student.id, attendance) }))
      .filter((entry) => entry.rate < 88)
      .sort((left, right) => left.rate - right.rate)
    return payload({ roster, summary, defaulters, classes: schoolClasses, trend: attendanceTrendRows() }, { roster: [], summary, defaulters: [], classes: [], trend: [] })
  },
  examinationsBoard: () => payload(
    { exams, marks, students, subjects, classes: schoolClasses, teachers },
    { exams: [], marks: [], students: [], subjects: [], classes: [], teachers: [] },
  ),
  assignmentsBoard: () => payload(
    { assignments, students, subjects, classes: schoolClasses, teachers },
    { assignments: [], students: [], subjects: [], classes: [], teachers: [] },
  ),
  quizBoard: () => payload(
    { quizzes, students, subjects, classes: schoolClasses },
    { quizzes: [], students: [], subjects: [], classes: [] },
  ),
  libraryBoard: () => payload(
    { resources: libraryResources, issues: libraryIssues, students, teachers },
    { resources: [], issues: [], students: [], teachers: [] },
  ),
  liveClassBoard: () => payload(
    { classes: liveClasses, subjects, schoolClasses, teachers, students },
    { classes: [], subjects: [], schoolClasses: [], teachers: [], students: [] },
  ),
  doubtForumBoard: () => payload(
    { threads: doubtThreads, subjects, students, teachers, personRefs },
    { threads: [], subjects: [], students: [], teachers: [], personRefs: [] },
  ),
  /* ---------- operations ---------- */
  teacherDirectory: () => payload(
    {
      teachers,
      subjects,
      schoolClasses,
      effectiveness: teacherEffectivenessRows(),
      workloads: teachers.map((teacher) => ({ teacherId: teacher.id, classes: teacher.classIds.length, periods: teacher.weeklyPeriods, students: teacher.classIds.flatMap((classId) => studentsOfClass(classId)).length })),
    },
    { teachers: [], subjects: [], schoolClasses: [], effectiveness: [], workloads: [] },
  ),
  teacherWorkspace: (teacherId: string) => payload(
    {
      slots: slotsForTeacher(teacherId),
      tasks: workspaceTasks.filter((task) => task.teacherId === teacherId),
      classes: schoolClasses,
      doubts: doubtThreads.filter((thread) => thread.teacherId === teacherId),
      assignments: assignments.filter((assignment) => assignment.teacherId === teacherId),
    },
    { slots: [], tasks: [], classes: [], doubts: [], assignments: [] },
  ),
  leaveBoard: () => payload({ requests: leaveRequests, students, teachers }, { requests: [], students: [], teachers: [] }),
  holidayBoard: () => payload({ holidays, events: schoolEvents }, { holidays: [], events: [] }),
  eventBoard: () => payload({ events: schoolEvents, personRefs }, { events: [], personRefs: [] }),
  transportBoard: () => payload({ routes: transportRoutes, students }, { routes: [], students: [] }),
  hostelBoard: () => payload({ blocks: hostelBlocks, students, teachers }, { blocks: [], students: [], teachers: [] }),
  inventoryBoard: () => payload({ items: inventoryItems }, { items: [] }),

  /* ---------- finance ---------- */
  feeBoard: () => payload(
    {
      invoices: feeInvoices,
      students,
      classes: schoolClasses,
      totals: feeTotals(),
      trend: collectionTrend,
      ledger: feeInvoices.map((invoice) => ({ invoice, studentName: nameOf(invoice.studentId), className: classNameOf(invoice.classId), billed: invoice.total, paid: paidAmountOf(invoice), due: dueAmountOf(invoice) })),
      defaulters: feeInvoices.filter((invoice) => invoice.status !== 'paid').map((invoice) => ({ invoiceId: invoice.id, invoiceNo: invoice.invoiceNo, studentId: invoice.studentId, studentName: nameOf(invoice.studentId), className: classNameOf(invoice.classId), due: dueAmountOf(invoice), dueDate: invoice.dueDate, status: invoice.status })),
    },
    { invoices: [], students: [], classes: [], totals: feeTotals(), trend: [], ledger: [], defaulters: [] },
  ),
  payrollBoard: () => payload(
    { slips: salarySlips, totals: payrollTotals(), people: personRefs.filter((person) => person.role !== 'student' && person.role !== 'parent') },
    { slips: [], totals: payrollTotals(), people: [] },
  ),
  expenseBoard: () => payload({ expenses, totals: expenseTotals(), breakdown: expenseBreakdown }, { expenses: [], totals: expenseTotals(), breakdown: [] }),
  scholarshipBoard: () => payload({ scholarships, students, totals: scholarshipTotals() }, { scholarships: [], students: [], totals: scholarshipTotals() }),

  /* ---------- communication ---------- */
  announcementBoard: () => payload({ announcements, personRefs }, { announcements: [], personRefs: [] }),
  templateBoard: () => payload({ templates: messageTemplates }, { templates: [] }),
  chatBoard: () => payload({ threads: chatThreads, people: personRefs, autoReplies }, { threads: [], people: [], autoReplies: [] }),
  notificationBoard: () => payload({ notifications, templates: messageTemplates }, { notifications: [], templates: [] }),

  /* ---------- analytics ---------- */
  performanceAnalytics: () => payload({ rows: studentPerformanceRows(), subjects: subjectPerformanceRows(), headline: schoolHeadline() }, { rows: [], subjects: [], headline: schoolHeadline() }),
  attendanceAnalytics: () => payload({ trend: attendanceTrendRows(), classes: classAttendanceRows() }, { trend: [], classes: [] }),
  teacherAnalytics: () => payload({ rows: teacherEffectivenessRows(), teachers }, { rows: [], teachers: [] }),
  atRiskBoard: () => payload({ rows: atRiskRows(), headline: schoolHeadline() }, { rows: [], headline: schoolHeadline() }),
  reportBuilder: () => payload({ modules: reportModules }, { modules: [] }),

  /* ---------- advanced / AI ---------- */
  aiChatbotBoard: () => payload({ conversations: chatbotConversations, summary: chatbotSummary() }, { conversations: [], summary: chatbotSummary() }),
  faceAttendanceBoard: () => payload({ sessions: faceAttendanceSessions, classes: schoolClasses }, { sessions: [], classes: [] }),
  plagiarismBoard: () => payload({ reports: plagiarismReports, students }, { reports: [], students: [] }),
  recommendationBoard: () => payload({ recommendations, students }, { recommendations: [], students: [] }),
  behaviorBoard: () => payload({ incidents: behaviorIncidents, summary: behaviorSummary(), students, teachers }, { incidents: [], summary: behaviorSummary(), students: [], teachers: [] }),

  /* ---------- system ---------- */
  institutionSetup: () => payload(
    { institution, stats: { students: students.length, teachers: teachers.length, classes: schoolClasses.length, subjects: subjects.length } },
    { institution, stats: { students: 0, teachers: 0, classes: 0, subjects: 0 } },
  ),
  featureToggleBoard: () => payload({ toggles: featureToggles }, { toggles: [] }),
  rbacBoard: () => payload({ matrix: permissionMatrix, modules: permissionMatrix.modules, roles: Object.keys(permissionMatrix.roles) as Role[], canDo }, { matrix: permissionMatrix, modules: [], roles: [], canDo }),
  auditLogBoard: () => payload({ logs: auditLogs, counts: auditSeverityCounts, people: personRefs }, { logs: [], counts: auditSeverityCounts, people: [] }),
  backupBoard: () => payload({ records: backupRecords, schedule: backupSchedule }, { records: [], schedule: backupSchedule }),
  userProfileBoard: () => payload({ people: personRefs, students, teachers, guardians, users: mockUsers }, { people: [], students: [], teachers: [], guardians: [], users: [] }),
  idCardBoard: () => payload({ records: idCardRecords, people: personRefs, institution }, { records: [], people: [], institution }),

  /* ---------- shared widgets ---------- */
  topbarNotifications: () => list(notifications.slice(0, 6).map((item) => ({ id: item.id, title: item.title, body: item.body, createdAt: item.createdAt, channel: item.channel }))),
  searchIndex: () => list(personRefs.map((person) => ({ id: person.id, name: person.name, role: person.role, subtitle: person.subtitle }))),

  /* ---------- dashboards (built last, they aggregate everything above) ---------- */
  dashboardStats: () => payload({
    headline: schoolHeadline(),
    fees: feeTotals(),
    payroll: payrollTotals(),
    expenses: expenseTotals(),
    attendanceTrend: attendanceTrendRows(),
    performance: studentPerformanceRows(),
    subjects: subjectPerformanceRows(),
    classes: classAttendanceRows(),
    atRisk: atRiskRows(),
    teacherEffectiveness: teacherEffectivenessRows(),
    feeTrend: collectionTrend,
    feeStatus: students.map((student) => ({ studentId: student.id, name: nameOf(student.id), status: feeStatusOfStudent(student.id) })),
    riskProfile: studentProfiles.map((profile) => ({ ...profile, name: nameOf(profile.studentId), className: classNameOf(studentById(profile.studentId)?.classId ?? 'cls-01') })),
    notices: notifications.slice(0, 4),
    recentAudit: auditLogs.slice(0, 5),
    todaySlots,
    pendingLeaves: leaveRequests.filter((request) => request.status === 'pending'),
  }, {
    headline: schoolHeadline(), fees: feeTotals(), payroll: payrollTotals(), expenses: expenseTotals(),
    attendanceTrend: [], performance: [], subjects: [], classes: [], atRisk: [], teacherEffectiveness: [],
    feeTrend: [], feeStatus: [], riskProfile: [], notices: [], recentAudit: [], todaySlots: [], pendingLeaves: [],
  }),

  studentDashboard: (studentId: string) => {
    const student = studentById(studentId) ?? students[0]
    const myMarks = marks.filter((mark) => mark.studentId === student.id)
    const subjectAverages = subjects.map((subject) => {
      const subjectMarks = myMarks.filter((mark) => mark.subjectId === subject.id)
      return { subject: subject.name, average: subjectMarks.length === 0 ? 0 : Math.round(subjectMarks.reduce((sum, mark) => sum + (mark.marksObtained / mark.maxMarks) * 100, 0) / subjectMarks.length) }
    })
    return payload({
      student,
      className: classNameOf(student.classId),
      attendance: attendance.filter((record) => record.studentId === student.id).slice(-14),
      attendanceRate: attendanceRateFor(student.id, attendance),
      marks: myMarks,
      bySubject: subjectAverages,
      assignments: assignments.filter((assignment) => assignment.classId === student.classId).map((assignment) => ({ assignment, submission: assignment.submissions.find((submission) => submission.studentId === student.id) ?? null })),
      invoices: invoiceByStudent(student.id),
      dueAmount: invoiceByStudent(student.id).reduce((sum, invoice) => sum + dueAmountOf(invoice), 0),
      slots: timetable.filter((slot) => slot.classId === student.classId && slot.day === todayName),
      liveClasses: liveClasses.filter((live) => live.classId === student.classId),
      doubts: doubtThreads.filter((thread) => thread.studentId === student.id),
      notices: announcements.slice(0, 4),
    }, {
      student, className: 'Unassigned', attendance: [], attendanceRate: 0, marks: [], bySubject: [], assignments: [], invoices: [], dueAmount: 0, slots: [], liveClasses: [], doubts: [], notices: [],
    })
  },

  parentDashboard: (guardianId: string) => {
    const guardian = guardians.find((item) => item.id === guardianId) ?? guardians[0]
    const child = studentById(guardian.studentIds[0]) ?? students[0]
    const childMarks = marks.filter((mark) => mark.studentId === child.id)
    const childInvoices = invoiceByStudent(child.id)
    return payload({
      guardian,
      child,
      className: classNameOf(child.classId),
      attendanceRate: attendanceRateFor(child.id, attendance),
      attendance: attendance.filter((record) => record.studentId === child.id).slice(-14),
      bySubject: subjects.map((subject) => {
        const subjectMarks = childMarks.filter((mark) => mark.subjectId === subject.id)
        return { subject: subject.name, average: subjectMarks.length === 0 ? 0 : Math.round(subjectMarks.reduce((sum, mark) => sum + (mark.marksObtained / mark.maxMarks) * 100, 0) / subjectMarks.length) }
      }),
      invoices: childInvoices,
      invoicesDue: childInvoices.reduce((sum, invoice) => sum + dueAmountOf(invoice), 0),
      feeStatus: feeStatusOfStudent(child.id),
      notices: announcements.filter((announcement) => announcement.audience === 'parents' || announcement.audience === 'all').slice(0, 5),
      risk: atRiskRows().find((row) => row.studentId === child.id) ?? null,
      slots: timetable.filter((slot) => slot.classId === child.classId && slot.day === todayName),
      teachers: teachers.filter((teacher) => teacher.classIds.includes(child.classId)),
    }, {
      guardian, child, className: 'Unassigned', attendanceRate: 0, attendance: [], bySubject: [], invoices: [], invoicesDue: 0, feeStatus: 'paid' as const, notices: [], risk: null, slots: [], teachers: [],
    })
  },
}
