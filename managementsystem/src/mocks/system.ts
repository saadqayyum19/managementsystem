import { students, teachers } from './people'
import { daysAgo, daysAhead, isoDate, randomInt, TODAY } from './seed'
import type { AuditLog, BackupRecord, FeatureToggle, IdCardRecord, Institution, PermissionActions, PermissionMatrix } from './types'

export const institution: Institution = {
  name: 'Westbridge Academy',
  code: 'WBA-2024',
  address: '14 Campus Avenue, Westbridge',
  city: 'Westbridge',
  country: 'United States',
  phone: '+1 415 555 0100',
  email: 'office@westbridge.edu',
  website: 'www.westbridge.edu',
  principalName: 'Aisha Rahman',
  established: 1998,
  academicYear: '2026 / 2027',
  timezone: 'UTC-07:00 (Pacific)',
  plan: 'Enterprise',
  logoInitials: 'WA',
  termsPerYear: 3,
  gradingScale: 'A+ to E (Westbridge scale)',
}

/* ---------- feature toggles (AI / advanced modules ship disabled) ---------- */
export const featureToggles: FeatureToggle[] = [
  { id: 'ft-01', key: 'ai_chatbot', name: 'AI Chatbot', description: 'Assistant that answers policy and syllabus questions in natural language.', module: 'Advanced / AI', enabled: false, rolloutPercent: 0, updatedBy: 'usr-superadmin', updatedAt: daysAgo(4) },
  { id: 'ft-02', key: 'face_attendance', name: 'Face Recognition Attendance', description: 'Mark attendance from classroom camera captures.', module: 'Advanced / AI', enabled: false, rolloutPercent: 0, updatedBy: 'usr-superadmin', updatedAt: daysAgo(6) },
  { id: 'ft-03', key: 'plagiarism_checker', name: 'Plagiarism Checker', description: 'Similarity scoring for assignment submissions.', module: 'Advanced / AI', enabled: false, rolloutPercent: 0, updatedBy: 'usr-superadmin', updatedAt: daysAgo(9) },
  { id: 'ft-04', key: 'recommendation_engine', name: 'Recommendation Engine', description: 'Suggests remedial and enrichment material per student.', module: 'Advanced / AI', enabled: false, rolloutPercent: 0, updatedBy: 'usr-superadmin', updatedAt: daysAgo(11) },
  { id: 'ft-05', key: 'behavior_tracking', name: 'Behavior Tracking', description: 'Records conduct incidents and positive recognition points.', module: 'Advanced / AI', enabled: false, rolloutPercent: 0, updatedBy: 'usr-superadmin', updatedAt: daysAgo(11) },
  { id: 'ft-06', key: 'online_quizzes', name: 'Quiz & Online Exams', description: 'Timed online assessments with optional proctoring.', module: 'Academics', enabled: true, rolloutPercent: 100, updatedBy: 'usr-principal', updatedAt: daysAgo(30) },
  { id: 'ft-07', key: 'live_classes', name: 'Live Classes', description: 'Virtual classroom links and recordings.', module: 'Academics', enabled: true, rolloutPercent: 100, updatedBy: 'usr-principal', updatedAt: daysAgo(28) },
  { id: 'ft-08', key: 'e_library', name: 'E-Library', description: 'Digital resource library with downloads and ratings.', module: 'Academics', enabled: true, rolloutPercent: 100, updatedBy: 'usr-principal', updatedAt: daysAgo(26) },
  { id: 'ft-09', key: 'doubt_forum', name: 'Doubt Forum', description: 'Threaded Q&A between students and faculty.', module: 'Academics', enabled: true, rolloutPercent: 100, updatedBy: 'usr-principal', updatedAt: daysAgo(24) },
  { id: 'ft-10', key: 'parent_portal', name: 'Parent Portal', description: 'Guardian access to attendance, fees and progress.', module: 'Communication', enabled: true, rolloutPercent: 100, updatedBy: 'usr-superadmin', updatedAt: daysAgo(40) },
  { id: 'ft-11', key: 'transport_live_tracking', name: 'Transport Live Tracking', description: 'Live bus location sharing with guardians.', module: 'Operations', enabled: true, rolloutPercent: 60, updatedBy: 'usr-superadmin', updatedAt: daysAgo(16) },
  { id: 'ft-12', key: 'report_builder', name: 'Custom Report Builder', description: 'Compose and export cross-module reports.', module: 'Analytics', enabled: true, rolloutPercent: 80, updatedBy: 'usr-principal', updatedAt: daysAgo(19) },
  { id: 'ft-13', key: 'sms_gateway', name: 'SMS Gateway', description: 'Outbound SMS channel for alerts and reminders.', module: 'Communication', enabled: true, rolloutPercent: 100, updatedBy: 'usr-superadmin', updatedAt: daysAgo(22) },
  { id: 'ft-14', key: 'audit_streaming', name: 'Audit Log Streaming', description: 'Stream audit events to an external SIEM sink.', module: 'System', enabled: false, rolloutPercent: 0, updatedBy: 'usr-superadmin', updatedAt: daysAgo(13) },
]
/* ---------- RBAC matrix: 5 roles × modules × CRUD ---------- */
export const permissionModules = [
  'Dashboards', 'Academic Structure', 'Timetable', 'Attendance', 'Examinations', 'Learning & Assignments',
  'Quiz & Online Exams', 'E-Library', 'Live Classes', 'Doubt Forum', 'Teacher Management', 'Teacher Workspace',
  'Leave Management', 'Holiday Calendar', 'Events', 'Transport', 'Hostel', 'Library', 'Inventory',
  'Fee Management', 'Salary & Payroll', 'Expense Tracker', 'Scholarships', 'Announcements', 'Email/SMS Templates',
  'In-App Chat', 'Notification Engine', 'Student Performance', 'Attendance Analytics', 'Teacher Effectiveness',
  'At-Risk Detection', 'Report Builder', 'AI Tools', 'Institution Setup', 'Feature Toggles', 'Roles & Permissions',
  'Audit Logs', 'Backup & Restore', 'User Profiles', 'ID Card Generator',
]

const allow: PermissionActions = { create: true, read: true, update: true, delete: true }
const edit: PermissionActions = { create: true, read: true, update: true, delete: false }
const read: PermissionActions = { create: false, read: true, update: false, delete: false }
const self: PermissionActions = { create: true, read: true, update: false, delete: false }
const deny: PermissionActions = { create: false, read: false, update: false, delete: false }

function buildRole(rule: { all?: boolean; manage?: string[]; contribute?: string[]; view?: string[]; participate?: string[] }): Record<string, PermissionActions> {
  return Object.fromEntries(permissionModules.map((module) => {
    if (rule.all) return [module, allow]
    if (rule.manage?.includes(module)) return [module, allow]
    if (rule.contribute?.includes(module)) return [module, edit]
    if (rule.participate?.includes(module)) return [module, self]
    if (rule.view?.includes(module)) return [module, read]
    return [module, deny]
  }))
}

const academicsCore = ['Attendance', 'Examinations', 'Learning & Assignments', 'Quiz & Online Exams', 'E-Library', 'Live Classes', 'Doubt Forum']

export const permissionMatrix: PermissionMatrix = {
  modules: permissionModules,
  roles: {
    super_admin: buildRole({ all: true }),
    principal: buildRole({
      manage: ['Dashboards', 'Academic Structure', 'Timetable', ...academicsCore, 'Teacher Management', 'Date & Time'],
      contribute: ['Announcements', 'Notification Engine', 'Teacher Workspace'],
      view: ['Leave Management', 'Holiday Calendar', 'Events', 'Transport', 'Hostel', 'Library', 'Inventory', 'Fee Management', 'Salary & Payroll', 'Expense Tracker', 'Scholarships', 'Student Performance', 'Attendance Analytics', 'Teacher Effectiveness', 'At-Risk Detection', 'Report Builder', 'User Profiles', 'ID Card Generator', 'Audit Logs', 'In-App Chat', 'Email/SMS Templates', 'AI Tools'],
    }),
    teacher: buildRole({
      contribute: ['Attendance', 'Examinations', 'Learning & Assignments', 'Quiz & Online Exams', 'Live Classes', 'Doubt Forum', 'In-App Chat'],
      participate: ['Teacher Workspace', 'Leave Management'],
      view: ['Dashboards', 'Academic Structure', 'Timetable', 'E-Library', 'Holiday Calendar', 'Events', 'Library', 'Student Performance', 'Attendance Analytics', 'Report Builder', 'Announcements', 'Notification Engine', 'User Profiles'],
    }),
    student: buildRole({
      participate: ['Doubt Forum', 'In-App Chat', 'Live Classes'],
      view: ['Dashboards', 'Timetable', 'Attendance', 'Examinations', 'Learning & Assignments', 'Quiz & Online Exams', 'E-Library', 'Holiday Calendar', 'Events', 'Library', 'Fee Management', 'Scholarships', 'Announcements', 'Student Performance', 'Transport'],
    }),
    parent: buildRole({
      participate: ['In-App Chat', 'Leave Management'],
      view: ['Dashboards', 'Timetable', 'Attendance', 'Examinations', 'Learning & Assignments', 'E-Library', 'Holiday Calendar', 'Events', 'Fee Management', 'Scholarships', 'Announcements', 'Transport', 'Hostel', 'Notification Engine'],
    }),
  },
}

export const canDo = (role: keyof PermissionMatrix['roles'], module: string, action: keyof PermissionActions): boolean => permissionMatrix.roles[role][module]?.[action] ?? false
/* ---------- audit logs ---------- */
export const auditLogs: AuditLog[] = [
  { id: 'log-01', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Updated feature toggle', entity: 'FeatureToggle', entityId: 'ft-11', module: 'Feature Toggles', timestamp: `${daysAgo(0)} 09:12`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'info' },
  { id: 'log-02', actorId: 'tch-01', actorRole: 'teacher', action: 'Published examination marks', entity: 'Exam', entityId: 'exam-cls-05-sub-01-mid', module: 'Examinations', timestamp: `${daysAgo(0)} 08:45`, ip: '10.20.7.31', device: 'Edge 128 · Windows', severity: 'info' },
  { id: 'log-03', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Failed sign-in attempt', entity: 'User', entityId: 'usr-superadmin', module: 'User Profiles', timestamp: `${daysAgo(0)} 07:58`, ip: '203.0.113.44', device: 'Unknown device', severity: 'critical' },
  { id: 'log-04', actorId: 'tch-02', actorRole: 'teacher', action: 'Marked attendance (bulk)', entity: 'Attendance', entityId: 'cls-05', module: 'Attendance', timestamp: `${daysAgo(0)} 08:20`, ip: '10.20.7.44', device: 'Chrome 129 · Windows', severity: 'info' },
  { id: 'log-05', actorId: 'usr-principal', actorRole: 'principal', action: 'Approved leave request', entity: 'LeaveRequest', entityId: 'lv-08', module: 'Leave Management', timestamp: `${daysAgo(1)} 16:22`, ip: '10.20.3.7', device: 'Safari 18 · iPadOS', severity: 'info' },
  { id: 'log-06', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Restored backup snapshot', entity: 'Backup', entityId: 'bkp-04', module: 'Backup & Restore', timestamp: `${daysAgo(1)} 13:05`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'warning' },
  { id: 'log-07', actorId: 'tch-03', actorRole: 'teacher', action: 'Created assignment', entity: 'Assignment', entityId: 'asg-cls-04-sub-03', module: 'Learning & Assignments', timestamp: `${daysAgo(2)} 11:48`, ip: '10.20.7.52', device: 'Firefox 131 · Windows', severity: 'info' },
  { id: 'log-08', actorId: 'stu-01', actorRole: 'student', action: 'Submitted assignment', entity: 'AssignmentSubmission', entityId: 'sub-asg-cls-05-sub-01-stu-01', module: 'Learning & Assignments', timestamp: `${daysAgo(2)} 20:14`, ip: '198.51.100.23', device: 'Chrome 129 · Android', severity: 'info' },
  { id: 'log-09', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Reset user password', entity: 'User', entityId: 'tch-05', module: 'User Profiles', timestamp: `${daysAgo(3)} 10:02`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'warning' },
  { id: 'log-10', actorId: 'gdn-01', actorRole: 'parent', action: 'Viewed fee invoice', entity: 'FeeInvoice', entityId: 'inv-stu-01-2', module: 'Fee Management', timestamp: `${daysAgo(3)} 21:37`, ip: '198.51.100.88', device: 'Safari 18 · iOS', severity: 'info' },
  { id: 'log-11', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Disabled feature toggle', entity: 'FeatureToggle', entityId: 'ft-01', module: 'Feature Toggles', timestamp: `${daysAgo(4)} 15:20`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'info' },
  { id: 'log-12', actorId: 'tch-05', actorRole: 'teacher', action: 'Started live class', entity: 'LiveClass', entityId: 'live-04', module: 'Live Classes', timestamp: `${daysAgo(4)} 13:02`, ip: '10.20.7.61', device: 'Chrome 129 · Windows', severity: 'info' },
  { id: 'log-13', actorId: 'usr-principal', actorRole: 'principal', action: 'Deleted draft announcement', entity: 'Announcement', entityId: 'ann-08', module: 'Announcements', timestamp: `${daysAgo(5)} 09:44`, ip: '10.20.3.7', device: 'Safari 18 · iPadOS', severity: 'info' },
  { id: 'log-14', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Changed role permissions', entity: 'PermissionMatrix', entityId: 'role:teacher', module: 'Roles & Permissions', timestamp: `${daysAgo(6)} 12:18`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'warning' },
  { id: 'log-15', actorId: 'tch-04', actorRole: 'teacher', action: 'Issued library item', entity: 'LibraryIssue', entityId: 'iss-07', module: 'Library', timestamp: `${daysAgo(7)} 10:35`, ip: '10.20.7.72', device: 'Edge 128 · Windows', severity: 'info' },
  { id: 'log-16', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Exported audit log', entity: 'AuditLog', entityId: 'export-2026-09', module: 'Audit Logs', timestamp: `${daysAgo(8)} 17:50`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'info' },
  { id: 'log-17', actorId: 'usr-principal', actorRole: 'principal', action: 'Published exam timetable', entity: 'Exam', entityId: 'exam-cls-05-sub-01-final', module: 'Examinations', timestamp: `${daysAgo(9)} 08:10`, ip: '10.20.3.7', device: 'Chrome 129 · Windows', severity: 'info' },
  { id: 'log-18', actorId: 'tch-02', actorRole: 'teacher', action: 'Recorded behavior incident', entity: 'BehaviorIncident', entityId: 'bhi-03', module: 'AI Tools', timestamp: `${daysAgo(10)} 14:26`, ip: '10.20.7.44', device: 'Chrome 129 · Windows', severity: 'warning' },
  { id: 'log-19', actorId: 'usr-superadmin', actorRole: 'super_admin', action: 'Regenerated 42 ID cards', entity: 'IdCardRecord', entityId: 'batch-42', module: 'ID Card Generator', timestamp: `${daysAgo(11)} 11:11`, ip: '10.20.4.11', device: 'Chrome 129 · macOS', severity: 'info' },
  { id: 'log-20', actorId: 'stu-02', actorRole: 'student', action: 'Blocked API request (RBAC)', entity: 'Permission', entityId: 'System/FeatureToggles', module: 'Roles & Permissions', timestamp: `${daysAgo(12)} 22:04`, ip: '198.51.100.201', device: 'Chrome 129 · Android', severity: 'critical' },
]

/* ---------- backup & restore ---------- */
export const backupRecords: BackupRecord[] = [
  { id: 'bkp-01', label: 'Nightly automatic snapshot', createdAt: `${isoDate(TODAY)} 02:00`, sizeMb: 412.6, type: 'auto', status: 'completed', location: 's3://educore-westbridge/auto', retentionDays: 30 },
  { id: 'bkp-02', label: 'Nightly automatic snapshot', createdAt: `${daysAgo(1)} 02:00`, sizeMb: 409.2, type: 'auto', status: 'completed', location: 's3://educore-westbridge/auto', retentionDays: 30 },
  { id: 'bkp-03', label: 'Pre-upgrade manual snapshot', createdAt: `${daysAgo(1)} 12:45`, sizeMb: 418.9, type: 'manual', status: 'completed', location: 's3://educore-westbridge/manual', retentionDays: 90 },
  { id: 'bkp-04', label: 'Term 2 fee ledger export', createdAt: `${daysAgo(2)} 13:05`, sizeMb: 388.1, type: 'manual', status: 'completed', location: 's3://educore-westbridge/manual', retentionDays: 90 },
  { id: 'bkp-05', label: 'Nightly automatic snapshot', createdAt: `${daysAgo(3)} 02:00`, sizeMb: 401.4, type: 'auto', status: 'completed', location: 's3://educore-westbridge/auto', retentionDays: 30 },
  { id: 'bkp-06', label: 'Nightly automatic snapshot', createdAt: `${daysAgo(4)} 02:00`, sizeMb: 398.7, type: 'auto', status: 'failed', location: 's3://educore-westbridge/auto', retentionDays: 30 },
  { id: 'bkp-07', label: 'Compliance archive', createdAt: `${daysAgo(9)} 03:30`, sizeMb: 512.3, type: 'auto', status: 'completed', location: 'glacier://educore-compliance', retentionDays: 365 },
  { id: 'bkp-08', label: 'Live mirror sync', createdAt: `${isoDate(TODAY)} 08:00`, sizeMb: 96.2, type: 'manual', status: 'running', location: 'dr://educore-mirror', retentionDays: 7 },
]

/* ---------- ID card / certificate generator ---------- */
export const idCardRecords: IdCardRecord[] = [
  ...students.map((student, index): IdCardRecord => ({ id: `idc-${student.id}`, personId: student.id, personRole: 'student', serial: `WBA-S-${1000 + index}`, template: 'student', issuedOn: daysAgo(220 - index * 5), validTill: daysAhead(240), status: index === 7 ? 'pending' : 'issued' })),
  ...teachers.map((teacher, index): IdCardRecord => ({ id: `idc-${teacher.id}`, personId: teacher.id, personRole: 'teacher', serial: `WBA-T-${500 + index}`, template: 'staff', issuedOn: daysAgo(300 - index * 5), validTill: daysAhead(400), status: index === 4 ? 'revoked' : 'issued' })),
  { id: 'idc-usr-principal', personId: 'usr-principal', personRole: 'principal', serial: 'WBA-A-101', template: 'staff', issuedOn: daysAgo(340), validTill: daysAhead(380), status: 'issued' },
  { id: 'idc-usr-superadmin', personId: 'usr-superadmin', personRole: 'super_admin', serial: 'WBA-A-100', template: 'staff', issuedOn: daysAgo(360), validTill: daysAhead(360), status: 'issued' },
]

export const backupSchedule = { frequency: 'Daily at 02:00 UTC', retention: '30 days hot · 365 days cold', lastVerification: `${daysAgo(1)} 02:14`, nextRun: `${daysAhead(1)} 02:00`, encrypted: true, offsite: true }
export const auditSeverityCounts = { info: auditLogs.filter((log) => log.severity === 'info').length, warning: auditLogs.filter((log) => log.severity === 'warning').length, critical: auditLogs.filter((log) => log.severity === 'critical').length }
export const generatedOn = isoDate(TODAY)
export const nextRotationDays = randomInt(30, 90)
