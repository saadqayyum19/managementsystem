import { lazy, type ReactNode } from 'react'
import type { UserRole } from '../store/authSlice'

export type AppRoute = { path: string; element: ReactNode; roles: UserRole[] }

const everyone: UserRole[] = ['super_admin', 'principal', 'teacher', 'student', 'parent']

const leadership: UserRole[] = ['super_admin', 'principal']
const staff: UserRole[] = ['super_admin', 'principal', 'teacher']





const lazyPage = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(() => loader().then((module) => ({ default: module[name] as React.ComponentType })))

/* Phase 0 — throwaway component lab (mounted at / and /dev/ui until dashboards land in Phase 9) */
const Phase0ShowcasePage = lazyPage(() => import('../features/dev/Phase0ShowcasePage'), 'Phase0ShowcasePage')
/* Phase 2 — academics */
const AcademicStructurePage = lazyPage(() => import('../features/academics/AcademicStructureModule'), 'AcademicStructurePage')
const TimetableBoardPage = lazyPage(() => import('../features/academics/TimetableBoardPage'), 'TimetableBoardPage')
const AttendanceBoardPage = lazyPage(() => import('../features/academics/AttendanceBoardPage'), 'AttendanceBoardPage')
const ExaminationsModulePage = lazyPage(() => import('../features/academics/ExaminationsModulePage'), 'ExaminationsModulePage')
const AssignmentsModulePage = lazyPage(() => import('../features/academics/AssignmentsModulePage'), 'AssignmentsModulePage')
const QuizExamsPage = lazyPage(() => import('../features/academics/QuizExamsPage'), 'QuizExamsPage')
const ELibraryPage = lazyPage(() => import('../features/academics/ELibraryPage'), 'ELibraryPage')
const LiveClassesPage = lazyPage(() => import('../features/academics/LiveClassesPage'), 'LiveClassesPage')
const DoubtForumPage = lazyPage(() => import('../features/academics/DoubtForumPage'), 'DoubtForumPage')
/* Phase 3 — operations */
const TeacherManagementPage = lazyPage(() => import('../features/operations/TeacherManagementPage'), 'TeacherManagementPage')
const TeacherWorkspacePage = lazyPage(() => import('../features/operations/TeacherWorkspacePage'), 'TeacherWorkspacePage')
const LeaveManagementPage = lazyPage(() => import('../features/operations/LeaveManagementPage'), 'LeaveManagementPage')
const HolidayCalendarPage = lazyPage(() => import('../features/operations/HolidayCalendarPage'), 'HolidayCalendarPage')
const EventManagementPage = lazyPage(() => import('../features/operations/EventManagementPage'), 'EventManagementPage')
const TransportPage = lazyPage(() => import('../features/operations/TransportPage'), 'TransportPage')
const HostelPage = lazyPage(() => import('../features/operations/HostelPage'), 'HostelPage')
const LibraryOperationsPage = lazyPage(() => import('../features/operations/LibraryOperationsPage'), 'LibraryOperationsPage')
const InventoryPage = lazyPage(() => import('../features/operations/InventoryPage'), 'InventoryPage')
/* Phase 4 — finance */
const FeeManagementPage = lazyPage(() => import('../features/finance/FeeManagementPage'), 'FeeManagementPage')
const SalaryPayrollPage = lazyPage(() => import('../features/finance/SalaryPayrollPage'), 'SalaryPayrollPage')
const ExpenseTrackerPage = lazyPage(() => import('../features/finance/ExpenseTrackerPage'), 'ExpenseTrackerPage')
const ScholarshipManagementPage = lazyPage(() => import('../features/finance/ScholarshipManagementPage'), 'ScholarshipManagementPage')
/* Phase 5 — communication */
const AnnouncementManagementPage = lazyPage(() => import('../features/communication/AnnouncementManagementPage'), 'AnnouncementManagementPage')
const EmailSmsTemplatesPage = lazyPage(() => import('../features/communication/EmailSmsTemplatesPage'), 'EmailSmsTemplatesPage')
const InAppChatPage = lazyPage(() => import('../features/communication/InAppChatPage'), 'InAppChatPage')
const NotificationEnginePage = lazyPage(() => import('../features/communication/NotificationEnginePage'), 'NotificationEnginePage')

export const appRoutes: AppRoute[] = [
  { path: '/', element: <Phase0ShowcasePage />, roles: everyone },
  { path: '/dev/ui', element: <Phase0ShowcasePage />, roles: everyone },
  { path: '/operations/teachers', element: <TeacherManagementPage />, roles: leadership },
  { path: '/operations/workspace', element: <TeacherWorkspacePage />, roles: ['super_admin', 'principal', 'teacher'] },
  { path: '/operations/leave', element: <LeaveManagementPage />, roles: everyone },
  { path: '/operations/holidays', element: <HolidayCalendarPage />, roles: everyone },
  { path: '/operations/events', element: <EventManagementPage />, roles: everyone },
  { path: '/operations/transport', element: <TransportPage />, roles: everyone },
  { path: '/operations/hostel', element: <HostelPage />, roles: leadership },
  { path: '/operations/library', element: <LibraryOperationsPage />, roles: staff },
  { path: '/operations/inventory', element: <InventoryPage />, roles: leadership },
  { path: '/academics/structure', element: <AcademicStructurePage />, roles: staff },
  { path: '/academics/timetable', element: <TimetableBoardPage />, roles: everyone },
  { path: '/academics/attendance', element: <AttendanceBoardPage />, roles: everyone },
  { path: '/academics/examinations', element: <ExaminationsModulePage />, roles: everyone },
  { path: '/academics/assignments', element: <AssignmentsModulePage />, roles: everyone },
  { path: '/academics/quizzes', element: <QuizExamsPage />, roles: everyone },
  { path: '/academics/library', element: <ELibraryPage />, roles: everyone },
  { path: '/academics/live-classes', element: <LiveClassesPage />, roles: everyone },
  { path: '/academics/doubts', element: <DoubtForumPage />, roles: everyone },
  { path: '/finance/fees', element: <FeeManagementPage />, roles: everyone },
  { path: '/finance/payroll', element: <SalaryPayrollPage />, roles: staff },
  { path: '/finance/expenses', element: <ExpenseTrackerPage />, roles: leadership },
  { path: '/finance/scholarships', element: <ScholarshipManagementPage />, roles: everyone },
  { path: '/communication/announcements', element: <AnnouncementManagementPage />, roles: everyone },
  { path: '/communication/templates', element: <EmailSmsTemplatesPage />, roles: staff },
  { path: '/communication/chat', element: <InAppChatPage />, roles: everyone },
  { path: '/communication/notifications', element: <NotificationEnginePage />, roles: staff },
]
