import {
  BadgeCheck, Banknote, BarChart3, BookOpen, BookMarked, Bot, Brain, Bus, CalendarDays, CalendarRange, ClipboardCheck,
  ClipboardList, CreditCard, FileSpreadsheet, FileText, Fingerprint, GraduationCap, HelpCircle, Hotel, IdCard, Landmark,
  LayoutDashboard, Library, Mail, MessageSquare, Package, Percent, PiggyBank, QrCode, Receipt, ScrollText, Settings2,
  ShieldCheck, SlidersHorizontal, Sparkles, Table2, UserCog, UserSearch, Users, Video, Watch,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../store/authSlice'

export type NavItem = { id: string; label: string; path: string; icon: LucideIcon; roles: UserRole[]; featureFlag?: string }
export type NavGroup = { id: string; label: string; icon: LucideIcon; roles: UserRole[]; items: NavItem[] }

const everyone: UserRole[] = ['super_admin', 'principal', 'teacher', 'student', 'parent']
const staff: UserRole[] = ['super_admin', 'principal', 'teacher']
const leadership: UserRole[] = ['super_admin', 'principal']

/** 8 collapsible sidebar groups — items are filtered by role and by feature flag. */
export const navGroups: NavGroup[] = [
  {
    id: 'workspace', label: 'Workspace', icon: LayoutDashboard, roles: everyone,
    items: [
      { id: 'overview', label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: everyone },
      { id: 'structure', label: 'Academic Structure', path: '/academics/structure', icon: Landmark, roles: staff },
      { id: 'workspace-tasks', label: 'My Workspace', path: '/operations/workspace', icon: ClipboardList, roles: staff },
      { id: 'profile', label: 'My Profile', path: '/system/profiles', icon: UserSearch, roles: everyone },
    ],
  },
  {
    id: 'academics', label: 'Academics', icon: GraduationCap, roles: everyone,
    items: [
      { id: 'timetable', label: 'Timetable', path: '/academics/timetable', icon: CalendarDays, roles: everyone },
      { id: 'attendance', label: 'Attendance', path: '/academics/attendance', icon: ClipboardCheck, roles: everyone },
      { id: 'examinations', label: 'Examinations', path: '/academics/examinations', icon: FileText, roles: everyone },
      { id: 'assignments', label: 'Learning & Assignments', path: '/academics/assignments', icon: BookOpen, roles: everyone },
      { id: 'quizzes', label: 'Quiz & Online Exams', path: '/academics/quizzes', icon: QrCode, roles: everyone, featureFlag: 'online_quizzes' },
      { id: 'e-library', label: 'E-Library', path: '/academics/library', icon: BookMarked, roles: everyone, featureFlag: 'e_library' },
      { id: 'live-classes', label: 'Live Classes', path: '/academics/live-classes', icon: Video, roles: everyone, featureFlag: 'live_classes' },
      { id: 'doubts', label: 'Doubt Forum', path: '/academics/doubts', icon: HelpCircle, roles: everyone, featureFlag: 'doubt_forum' },
    ],
  },
  {
    id: 'operations', label: 'Operations', icon: Users, roles: staff,
    items: [
      { id: 'teachers', label: 'Teacher Management', path: '/operations/teachers', icon: UserCog, roles: leadership },
      { id: 'leave', label: 'Leave Management', path: '/operations/leave', icon: CalendarRange, roles: everyone },
      { id: 'holidays', label: 'Holiday Calendar', path: '/operations/holidays', icon: CalendarDays, roles: everyone },
      { id: 'events', label: 'Event Management', path: '/operations/events', icon: Sparkles, roles: everyone },
      { id: 'transport', label: 'Transport', path: '/operations/transport', icon: Bus, roles: everyone },
      { id: 'hostel', label: 'Hostel', path: '/operations/hostel', icon: Hotel, roles: leadership },
      { id: 'library-ops', label: 'Library', path: '/operations/library', icon: Library, roles: staff },
      { id: 'inventory', label: 'Inventory', path: '/operations/inventory', icon: Package, roles: leadership },
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: Banknote, roles: everyone,
    items: [
      { id: 'fees', label: 'Fee Management', path: '/finance/fees', icon: CreditCard, roles: everyone },
      { id: 'payroll', label: 'Salary & Payroll', path: '/finance/payroll', icon: PiggyBank, roles: staff },
      { id: 'expenses', label: 'Expense Tracker', path: '/finance/expenses', icon: Receipt, roles: leadership },
      { id: 'scholarships', label: 'Scholarship', path: '/finance/scholarships', icon: Percent, roles: everyone },
    ],
  },
  {
    id: 'communication', label: 'Communication', icon: MessageSquare, roles: everyone,
    items: [
      { id: 'announcements', label: 'Announcements', path: '/communication/announcements', icon: ScrollText, roles: everyone },
      { id: 'templates', label: 'Email / SMS Templates', path: '/communication/templates', icon: Mail, roles: staff },
      { id: 'chat', label: 'In-App Chat', path: '/communication/chat', icon: MessageSquare, roles: everyone },
      { id: 'notifications', label: 'Notification Engine', path: '/communication/notifications', icon: BadgeCheck, roles: staff },
    ],
  },
  {
    id: 'analytics', label: 'Analytics', icon: BarChart3, roles: [...leadership, 'teacher'],
    items: [
      { id: 'performance', label: 'Student Performance', path: '/analytics/performance', icon: BarChart3, roles: everyone },
      { id: 'attendance-analytics', label: 'Attendance Analytics', path: '/analytics/attendance', icon: ClipboardCheck, roles: staff },
      { id: 'teacher-effectiveness', label: 'Teacher Effectiveness', path: '/analytics/teachers', icon: UserCog, roles: leadership },
      { id: 'at-risk', label: 'At-Risk Detection', path: '/analytics/at-risk', icon: Watch, roles: staff },
      { id: 'report-builder', label: 'Custom Report Builder', path: '/analytics/reports', icon: Table2, roles: staff, featureFlag: 'report_builder' },
    ],
  },
  {
    id: 'advanced', label: 'Advanced / AI', icon: Bot, roles: leadership,
    items: [
      { id: 'ai-chatbot', label: 'AI Chatbot', path: '/advanced/chatbot', icon: Bot, roles: leadership, featureFlag: 'ai_chatbot' },
      { id: 'face-attendance', label: 'Face Recognition', path: '/advanced/face-attendance', icon: Fingerprint, roles: leadership, featureFlag: 'face_attendance' },
      { id: 'plagiarism', label: 'Plagiarism Checker', path: '/advanced/plagiarism', icon: FileSpreadsheet, roles: leadership, featureFlag: 'plagiarism_checker' },
      { id: 'recommendations', label: 'Recommendation Engine', path: '/advanced/recommendations', icon: Brain, roles: leadership, featureFlag: 'recommendation_engine' },
      { id: 'behavior', label: 'Behavior Tracking', path: '/advanced/behavior', icon: BadgeCheck, roles: leadership, featureFlag: 'behavior_tracking' },
    ],
  },
  {
    id: 'system', label: 'System', icon: Settings2, roles: ['super_admin'],
    items: [
      { id: 'institution', label: 'Institution Setup', path: '/system/institution', icon: Landmark, roles: ['super_admin'] },
      { id: 'feature-toggles', label: 'Feature Toggles', path: '/system/feature-toggles', icon: SlidersHorizontal, roles: ['super_admin'] },
      { id: 'rbac', label: 'Roles & Permissions', path: '/system/rbac', icon: ShieldCheck, roles: ['super_admin'] },
      { id: 'audit', label: 'Audit Logs', path: '/system/audit', icon: ScrollText, roles: ['super_admin'] },
      { id: 'backup', label: 'Backup & Restore', path: '/system/backup', icon: Package, roles: ['super_admin'] },
      { id: 'id-cards', label: 'ID Card Generator', path: '/system/id-cards', icon: IdCard, roles: ['super_admin'] },
      { id: 'dev-ui', label: 'UI Component Lab', path: '/dev/ui', icon: SlidersHorizontal, roles: ['super_admin'] },
    ],
  },
]

export function visibleGroups(role: UserRole, flags: Record<string, boolean>): NavGroup[] {
  return navGroups
    .filter((group) => group.roles.includes(role))
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role) && (!item.featureFlag || Boolean(flags[item.featureFlag]))) }))
    .filter((group) => group.items.length > 0)
}
