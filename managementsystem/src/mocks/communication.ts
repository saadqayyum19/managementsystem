import { daysAgo, daysAhead, isoDate, TODAY } from './seed'
import type { Announcement, ChatMessage, ChatThread, MessageTemplate, NotificationItem } from './types'

/* ---------- announcements ---------- */
export const announcements: Announcement[] = [
  { id: 'ann-01', title: 'Term 2 examination timetable published', body: 'The final examination timetable for Grades 6 to 10 is now available on the examinations page. Please review the seating plan with your class teacher.', audience: 'all', authorId: 'usr-principal', publishedAt: `${daysAgo(2)} 08:30`, priority: 'high', channels: ['app', 'email'], status: 'published', pinned: true },
  { id: 'ann-02', title: 'Inter-house athletics meet — registrations open', body: 'Students may register for up to three events with their house captains before Friday.', audience: 'students', authorId: 'tch-02', publishedAt: `${daysAgo(4)} 12:10`, priority: 'normal', channels: ['app', 'sms'], status: 'published', pinned: true },
  { id: 'ann-03', title: 'Fee payment window closes on 30 September', body: 'Term 2 dues must be cleared before 30 September to avoid a late payment levy.', audience: 'parents', authorId: 'usr-superadmin', publishedAt: `${daysAgo(6)} 09:00`, priority: 'urgent', channels: ['app', 'email', 'sms'], status: 'published', pinned: false },
  { id: 'ann-04', title: 'Faculty development workshop', body: 'All teaching staff must attend the differentiated-instruction workshop in the conference hall.', audience: 'teachers', authorId: 'usr-principal', publishedAt: `${daysAgo(8)} 16:45`, priority: 'high', channels: ['app', 'email'], status: 'published', pinned: false },
  { id: 'ann-05', title: 'Library timings extended during exam week', body: 'The library remains open until 18:30 from Monday to Thursday during the examination fortnight.', audience: 'all', authorId: 'tch-04', publishedAt: `${daysAgo(11)} 10:20`, priority: 'normal', channels: ['app'], status: 'published', pinned: false },
  { id: 'ann-06', title: 'Transport route RT-03 under maintenance', body: 'Route RT-03 runs a reduced schedule for three days while the vehicle is serviced.', audience: 'parents', authorId: 'usr-superadmin', publishedAt: `${daysAgo(1)} 07:15`, priority: 'high', channels: ['app', 'sms'], status: 'published', pinned: false },
  { id: 'ann-07', title: 'Annual day auditions', body: 'Auditions for the annual day production begin next week in the amphitheatre.', audience: 'students', authorId: 'tch-03', publishedAt: `${isoDate(TODAY)} 09:05`, priority: 'low', channels: ['app'], status: 'scheduled', pinned: false },
  { id: 'ann-08', title: 'Campus safety drill (draft)', body: 'Draft notice for the scheduled campus evacuation drill — pending principal approval.', audience: 'all', authorId: 'usr-superadmin', publishedAt: `${isoDate(TODAY)} 11:40`, priority: 'normal', channels: ['app', 'email'], status: 'draft', pinned: false },
  { id: 'ann-09', title: 'Scholarship shortlist released', body: 'Shortlisted candidates for the merit and need-based scholarships should submit documents by Friday.', audience: 'parents', authorId: 'usr-principal', publishedAt: `${daysAgo(13)} 14:30`, priority: 'high', channels: ['app', 'email'], status: 'published', pinned: false },
  { id: 'ann-10', title: 'Coding marathon results', body: 'Congratulations to Grade 10A for winning the inter-house coding marathon.', audience: 'all', authorId: 'tch-05', publishedAt: `${daysAgo(15)} 17:10`, priority: 'normal', channels: ['app'], status: 'published', pinned: false },
]

/* ---------- email / SMS templates ---------- */
export const messageTemplates: MessageTemplate[] = [
  { id: 'tpl-01', name: 'Fee reminder — Term 2', channel: 'email', category: 'Finance', subject: 'Reminder: Term 2 fee payment for {{student_name}}', body: `Dear {{guardian_name}},\n\nOur records show an outstanding balance of {{amount}} for {{student_name}} ({{class_name}}). Please complete the payment before {{due_date}}.\n\nRegards,\nWestbridge Academy Accounts`, updatedAt: daysAgo(12), usageCount: 214 },
  { id: 'tpl-02', name: 'Absence alert', channel: 'sms', category: 'Attendance', subject: 'Attendance alert', body: '{{student_name}} was marked absent on {{date}}. Reply to this message if this is an error.', updatedAt: daysAgo(20), usageCount: 486 },
  { id: 'tpl-03', name: 'Exam schedule release', channel: 'email', category: 'Examinations', subject: '{{term}} examination schedule', body: `Dear parents,\n\nThe examination schedule for {{class_name}} is attached. Please ensure {{student_name}} carries the admit card to every paper.`, updatedAt: daysAgo(6), usageCount: 132 },
  { id: 'tpl-04', name: 'Fee receipt confirmation', channel: 'sms', category: 'Finance', subject: 'Payment received', body: 'Payment of {{amount}} received for {{student_name}}. Receipt {{reference}} is available in the parent portal.', updatedAt: daysAgo(3), usageCount: 351 },
  { id: 'tpl-05', name: 'Event invitation', channel: 'email', category: 'Events', subject: 'Invitation: {{event_name}}', body: `Dear {{guardian_name}},\n\nYou are invited to {{event_name}} on {{event_date}} at {{venue}}. Please confirm your attendance.`, updatedAt: daysAgo(9), usageCount: 97 },
  { id: 'tpl-06', name: 'Leave approval notice', channel: 'sms', category: 'Operations', subject: 'Leave update', body: 'Your leave request from {{from_date}} to {{to_date}} has been {{status}}.', updatedAt: daysAgo(16), usageCount: 143 },
  { id: 'tpl-07', name: 'Teacher meeting request', channel: 'email', category: 'Academics', subject: 'Meeting request regarding {{student_name}}', body: `Dear {{guardian_name}},\n\nWe would like to discuss the recent progress of {{student_name}}. Are you available on {{meeting_date}} at {{meeting_time}}?`, updatedAt: daysAgo(25), usageCount: 64 },
  { id: 'tpl-08', name: 'Library overdue notice', channel: 'sms', category: 'Library', subject: 'Library overdue', body: 'The item borrowed on {{issue_date}} is overdue. A fine of {{fine}} has been added to your account.', updatedAt: daysAgo(30), usageCount: 58 },
]
/* ---------- in-app chat (mock real-time) ---------- */
function messagesOf(threadId: string, seed: Array<{ sender: string; body: string; minutesAgo: number; read?: boolean }>): ChatMessage[] {
  return seed.map((entry, index) => ({
    id: `msg-${threadId}-${index + 1}`,
    threadId,
    senderId: entry.sender,
    body: entry.body,
    sentAt: `${daysAgo(0)} ${String(Math.max(0, 14 - Math.floor(entry.minutesAgo / 60))).padStart(2, '0')}:${String(entry.minutesAgo % 60).padStart(2, '0')}`,
    read: entry.read ?? index < seed.length - 1,
    attachmentName: index === 1 && threadId === 'thr-01' ? 'term-2-syllabus.pdf' : null,
  }))
}

export const chatThreads: ChatThread[] = [
  { id: 'thr-01', name: 'Aisha Rahman', type: 'direct', participantIds: ['usr-principal', 'tch-01'], lastMessageAt: `${daysAgo(0)} 13:12`, unreadCount: 2, messages: messagesOf('thr-01', [{ sender: 'tch-01', body: 'Good morning — the Grade 10A revision plan is ready for review.', minutesAgo: 180 }, { sender: 'usr-principal', body: 'Thanks, please attach the syllabus mapping.', minutesAgo: 150 }, { sender: 'tch-01', body: 'Sharing it now. I have flagged the two topics needing extra periods.', minutesAgo: 12 }]) },
  { id: 'thr-02', name: 'Grade 10A — Class group', type: 'group', participantIds: ['tch-01', 'tch-02', 'tch-05', 'stu-01', 'stu-02'], lastMessageAt: `${daysAgo(0)} 12:40`, unreadCount: 0, messages: messagesOf('thr-02', [{ sender: 'tch-02', body: 'Reminder: bring your lab notebooks tomorrow.', minutesAgo: 240 }, { sender: 'stu-01', body: 'Noted sir. Will the practical be graded?', minutesAgo: 200 }, { sender: 'tch-02', body: 'Yes, it carries 10 marks.', minutesAgo: 80 }]) },
  { id: 'thr-03', name: 'Daniel Chen (parent)', type: 'direct', participantIds: ['tch-01', 'gdn-01'], lastMessageAt: `${daysAgo(0)} 11:05`, unreadCount: 1, messages: messagesOf('thr-03', [{ sender: 'gdn-01', body: `Hello, could we discuss the progress of Olivia on the project timeline?`, minutesAgo: 300 }, { sender: 'tch-01', body: 'Happy to — I am free after 15:30 today.', minutesAgo: 95 }]) },
  { id: 'thr-04', name: 'Examination committee', type: 'group', participantIds: ['usr-principal', 'tch-01', 'tch-02', 'tch-03'], lastMessageAt: `${daysAgo(1)} 16:20`, unreadCount: 0, messages: messagesOf('thr-04', [{ sender: 'usr-principal', body: 'Invigilation roster needs one more teacher for Thursday.', minutesAgo: 900 }, { sender: 'tch-03', body: 'I can cover the second session.', minutesAgo: 860 }]) },
  { id: 'thr-05', name: 'Operations desk', type: 'direct', participantIds: ['usr-superadmin', 'tch-04'], lastMessageAt: `${daysAgo(1)} 09:10`, unreadCount: 0, messages: messagesOf('thr-05', [{ sender: 'usr-superadmin', body: 'Route RT-03 servicing is scheduled for tomorrow.', minutesAgo: 1020 }, { sender: 'tch-04', body: 'Understood — I have informed the affected parents.', minutesAgo: 980 }]) },
]

export const autoReplies = ['Noted, thank you.', 'I will check and revert shortly.', 'Agreed — let us finalise that today.', 'Could you share the file as well?', 'That works for me.']

/* ---------- notification engine ---------- */
export const notifications: NotificationItem[] = [
  { id: 'ntf-01', title: 'Fee reminder sent to 32 guardians', body: 'Term 2 reminders dispatched through email and app channels.', audience: 'parents', channel: 'email', createdAt: `${daysAgo(0)} 08:05`, status: 'sent', recipients: 32, opened: 21, templateId: 'tpl-01' },
  { id: 'ntf-02', title: 'Absence alerts for Grade 8B', body: 'Three students were marked absent today.', audience: 'parents', channel: 'sms', createdAt: `${daysAgo(0)} 09:40`, status: 'sent', recipients: 3, opened: 3, templateId: 'tpl-02' },
  { id: 'ntf-03', title: 'Exam schedule broadcast', body: 'Final examination timetable published to all grades.', audience: 'all', channel: 'in_app', createdAt: `${daysAgo(2)} 08:35`, status: 'sent', recipients: 412, opened: 356, templateId: 'tpl-03' },
  { id: 'ntf-04', title: 'Scholarship shortlist announcement', body: 'Shortlist notification to applicant guardians.', audience: 'parents', channel: 'email', createdAt: `${daysAgo(13)} 15:00`, status: 'sent', recipients: 9, opened: 7, templateId: 'tpl-05' },
  { id: 'ntf-05', title: 'Cultural evening invitation', body: 'Invitation scheduled for the autumn cultural evening.', audience: 'parents', channel: 'email', createdAt: `${daysAhead(3)} 07:00`, status: 'scheduled', recipients: 320, opened: 0, templateId: 'tpl-05' },
  { id: 'ntf-06', title: 'Payroll processed notice', body: 'September payroll notification to staff.', audience: 'staff', channel: 'in_app', createdAt: `${daysAgo(25)} 11:45`, status: 'sent', recipients: 24, opened: 19, templateId: null },
  { id: 'ntf-07', title: 'Transport maintenance alert', body: 'Route RT-03 reduced schedule alert.', audience: 'parents', channel: 'sms', createdAt: `${daysAgo(1)} 07:20`, status: 'sent', recipients: 14, opened: 11, templateId: null },
  { id: 'ntf-08', title: 'Face attendance sync failure', body: 'Camera 02 session could not be uploaded — retry queued.', audience: 'staff', channel: 'push', createdAt: `${daysAgo(0)} 10:15`, status: 'failed', recipients: 1, opened: 0, templateId: null },
  { id: 'ntf-09', title: 'Library overdue digest', body: 'Weekly overdue digest for library members.', audience: 'students', channel: 'in_app', createdAt: `${daysAgo(4)} 17:30`, status: 'queued', recipients: 68, opened: 0, templateId: 'tpl-08' },
]
