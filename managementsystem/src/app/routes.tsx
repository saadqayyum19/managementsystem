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
/* Phase 9 — role dashboards (mounted at /) */
const DashboardPage = lazyPage(() => import('../features/dashboards/DashboardPage'), 'DashboardPage')
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
/* Phase 6 — analytics */
const StudentPerformancePage = lazyPage(() => import('../features/analytics/StudentPerformancePage'), 'StudentPerformancePage')
const AttendanceAnalyticsPage = lazyPage(() => import('../features/analytics/AttendanceAnalyticsPage'), 'AttendanceAnalyticsPage')
const TeacherEffectivenessPage = lazyPage(() => import('../features/analytics/TeacherEffectivenessPage'), 'TeacherEffectivenessPage')
const AtRiskDetectionPage = lazyPage(() => import('../features/analytics/AtRiskDetectionPage'), 'AtRiskDetectionPage')
const CustomReportBuilderPage = lazyPage(() => import('../features/analytics/CustomReportBuilderPage'), 'CustomReportBuilderPage')
/* Phase 7 — advanced / AI (feature-toggled off by default) */
const AIChatbotPage = lazyPage(() => import('../features/advanced/AIChatbotPage'), 'AIChatbotPage')
const FaceAttendancePage = lazyPage(() => import('../features/advanced/FaceAttendancePage'), 'FaceAttendancePage')
const PlagiarismCheckerPage = lazyPage(() => import('../features/advanced/PlagiarismCheckerPage'), 'PlagiarismCheckerPage')
const RecommendationEnginePage = lazyPage(() => import('../features/advanced/RecommendationEnginePage'), 'RecommendationEnginePage')
const BehaviorTrackingPage = lazyPage(() => import('../features/advanced/BehaviorTrackingPage'), 'BehaviorTrackingPage')
/* Phase 8 — system (super admin) + profile */
const InstitutionSetupPage = lazyPage(() => import('../features/system/InstitutionSetupPage'), 'InstitutionSetupPage')
const FeatureTogglesPage = lazyPage(() => import('../features/system/FeatureTogglesPage'), 'FeatureTogglesPage')
const RolesPermissionsPage = lazyPage(() => import('../features/system/RolesPermissionsPage'), 'RolesPermissionsPage')
const AuditLogsPage = lazyPage(() => import('../features/system/AuditLogsPage'), 'AuditLogsPage')
const BackupAndRestorePage = lazyPage(() => import('../features/system/BackupRestorePage'), 'BackupAndRestorePage')
const IdCardGeneratorPage = lazyPage(() => import('../features/system/IdCardGeneratorPage'), 'IdCardGeneratorPage')
const MyProfilePage = lazyPage(() => import('../features/system/MyProfilePage'), 'MyProfilePage')

export const appRoutes: AppRoute[] = [
  { path: '/', element: <DashboardPage />, roles: everyone },
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
  { path: '/analytics/performance', element: <StudentPerformancePage />, roles: everyone },
  { path: '/analytics/attendance', element: <AttendanceAnalyticsPage />, roles: staff },
  { path: '/analytics/teachers', element: <TeacherEffectivenessPage />, roles: leadership },
  { path: '/analytics/at-risk', element: <AtRiskDetectionPage />, roles: staff },
  { path: '/analytics/reports', element: <CustomReportBuilderPage />, roles: staff },
  { path: '/advanced/chatbot', element: <AIChatbotPage />, roles: leadership },
  { path: '/advanced/face-attendance', element: <FaceAttendancePage />, roles: leadership },
  { path: '/advanced/plagiarism', element: <PlagiarismCheckerPage />, roles: leadership },
  { path: '/advanced/recommendations', element: <RecommendationEnginePage />, roles: leadership },
  { path: '/advanced/behavior', element: <BehaviorTrackingPage />, roles: leadership },
  { path: '/system/institution', element: <InstitutionSetupPage />, roles: ['super_admin'] },
  { path: '/system/feature-toggles', element: <FeatureTogglesPage />, roles: ['super_admin'] },
  { path: '/system/rbac', element: <RolesPermissionsPage />, roles: ['super_admin'] },
  { path: '/system/audit', element: <AuditLogsPage />, roles: ['super_admin'] },
  { path: '/system/backup', element: <BackupAndRestorePage />, roles: ['super_admin'] },
  { path: '/system/id-cards', element: <IdCardGeneratorPage />, roles: ['super_admin'] },
  { path: '/system/profiles', element: <MyProfilePage />, roles: everyone },
]
