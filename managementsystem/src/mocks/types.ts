/* EduCore OS — domain type contract for the mock data layer.
   Every screen in the app reads through these types, so the mock dataset is
   validated (and cross-referenced) by the compiler. */

export type Role = 'super_admin' | 'principal' | 'teacher' | 'student' | 'parent'
export type Status = 'active' | 'inactive'
export type RiskLevel = 'low' | 'medium' | 'high'

export type Person = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarTone: 'blue' | 'green' | 'orange' | 'purple'
}

export type Student = Person & {
  admissionNo: string
  classId: string
  sectionId: string
  rollNo: string
  guardianIds: string[]
  gender: 'male' | 'female'
  dateOfBirth: string
  admissionDate: string
  status: Status
  address: string
  bloodGroup: string
  house: 'Aurora' | 'Blaze' | 'Cobalt' | 'Delta'
  transportRouteId: string | null
  hostelBlockId: string | null
}

export type Guardian = Person & {
  relationship: 'father' | 'mother' | 'guardian'
  occupation: string
  studentIds: string[]
}

export type Teacher = Person & {
  employeeCode: string
  designation: 'Senior Teacher' | 'Teacher' | 'Head of Department' | 'Coordinator'
  department: string
  subjectIds: string[]
  classIds: string[]
  joinedOn: string
  status: Status
  weeklyPeriods: number
  experienceYears: number
  qualification: string
  performanceScore: number
}

export type SchoolClass = {
  id: string
  name: string
  grade: number
  room: string
  capacity: number
  classTeacherId: string
  sectionIds: string[]
  subjectIds: string[]
  studentCount: number
}

export type Section = { id: string; classId: string; name: string; room: string }

export type Subject = { id: string; name: string; code: string; type: 'core' | 'elective'; weeklyPeriods: number; teacherIds: string[]; classIds: string[] }

export type TimetableSlot = { id: string; classId: string; subjectId: string; teacherId: string; day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'; period: number; startTime: string; endTime: string; room: string }

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type AttendanceRecord = { id: string; studentId: string; classId: string; date: string; status: AttendanceStatus; method: 'manual' | 'face' | 'qr'; markedBy: string }

export type ExamType = 'unit' | 'midterm' | 'final' | 'quiz'
export type Exam = {
  id: string
  name: string
  type: ExamType
  classId: string
  subjectId: string
  date: string
  maxMarks: number
  passMarks: number
  invigilatorId: string
  status: 'scheduled' | 'ongoing' | 'completed'
}

export type Mark = { id: string; examId: string; studentId: string; subjectId: string; classId: string; marksObtained: number; maxMarks: number; grade: string; remarks: string }

export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded'
export type AssignmentSubmission = { id: string; assignmentId: string; studentId: string; submittedAt: string | null; status: SubmissionStatus; marks: number | null; feedback: string | null }
export type Assignment = {
  id: string
  title: string
  description: string
  subjectId: string
  classId: string
  teacherId: string
  createdAt: string
  dueDate: string
  maxMarks: number
  status: 'draft' | 'published' | 'closed'
  attachmentName: string | null
  submissions: AssignmentSubmission[]
}

export type QuizAttempt = { studentId: string; score: number | null; status: 'not_started' | 'in_progress' | 'completed'; violations: number }
export type Quiz = {
  id: string
  title: string
  subjectId: string
  classId: string
  teacherId: string
  scheduledAt: string
  durationMinutes: number
  mode: 'mcq' | 'descriptive'
  totalMarks: number
  aiProctored: boolean
  attempts: QuizAttempt[]
}

export type LibraryResource = { id: string; title: string; author: string; category: string; type: 'ebook' | 'journal' | 'video' | 'paper'; subjectId: string | null; addedOn: string; downloads: number; rating: number; sizeMb: number }

export type LiveClass = {
  id: string
  title: string
  subjectId: string
  classId: string
  teacherId: string
  startsAt: string
  durationMinutes: number
  platform: 'educore-meet' | 'zoom' | 'youtube'
  status: 'scheduled' | 'live' | 'completed'
  attendeeIds: string[]
  recordingUrl: string | null
}

export type DoubtReply = { id: string; authorId: string; authorRole: Role; body: string; createdAt: string; upvotes: number }
export type DoubtThread = { id: string; title: string; body: string; subjectId: string; studentId: string; teacherId: string | null; status: 'open' | 'answered' | 'closed'; createdAt: string; replies: DoubtReply[] }
/* ---------- operations ---------- */
export type LeaveRequest = {
  id: string
  applicantId: string
  applicantRole: 'teacher' | 'student'
  type: 'sick' | 'casual' | 'annual' | 'maternity'
  from: string
  to: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approverId: string | null
  appliedOn: string
}

export type Holiday = { id: string; name: string; date: string; type: 'national' | 'festival' | 'institutional' | 'vacation'; description: string }

export type SchoolEvent = {
  id: string
  title: string
  category: 'sports' | 'cultural' | 'academic' | 'meeting'
  startsAt: string
  endsAt: string
  venue: string
  organizerId: string
  expectedParticipants: number
  status: 'upcoming' | 'ongoing' | 'completed'
  budget: number
}

export type TransportRoute = {
  id: string
  name: string
  code: string
  driverName: string
  driverPhone: string
  vehicleNo: string
  capacity: number
  assignedStudentIds: string[]
  stops: string[]
  morningDeparture: string
  eveningDeparture: string
  status: 'active' | 'maintenance'
}

export type HostelRoom = { id: string; number: string; floor: number; capacity: number; occupantIds: string[] }
export type HostelBlock = { id: string; name: string; wardenId: string; type: 'boys' | 'girls'; rooms: HostelRoom[] }

export type LibraryIssue = { id: string; resourceId: string; memberId: string; memberRole: Role; issuedOn: string; dueOn: string; returnedOn: string | null; fine: number; status: 'issued' | 'returned' | 'overdue' }

export type InventoryItem = {
  id: string
  name: string
  category: 'lab' | 'sports' | 'furniture' | 'it' | 'stationery'
  quantity: number
  unit: string
  location: string
  vendor: string
  purchasedOn: string
  unitCost: number
  condition: 'new' | 'good' | 'repair' | 'retired'
  reorderLevel: number
}

export type WorkspaceTask = { id: string; teacherId: string; title: string; module: string; dueDate: string; priority: 'low' | 'normal' | 'high'; done: boolean }

/* ---------- finance ---------- */
export type FeeItem = { label: string; amount: number }
export type FeePayment = { id: string; amount: number; paidOn: string; method: 'card' | 'cash' | 'upi' | 'bank'; reference: string }
export type FeeInvoice = {
  id: string
  invoiceNo: string
  studentId: string
  classId: string
  term: 'Term 1' | 'Term 2' | 'Term 3'
  items: FeeItem[]
  total: number
  dueDate: string
  issuedOn: string
  status: 'paid' | 'partial' | 'overdue' | 'waived'
  payments: FeePayment[]
  discountPercent: number
}

export type SalarySlip = {
  id: string
  staffId: string
  month: string
  basic: number
  allowances: number
  deductions: number
  netPay: number
  status: 'processed' | 'pending' | 'on_hold'
  processedOn: string | null
  bankAccount: string
}

export type Expense = {
  id: string
  category: 'maintenance' | 'utilities' | 'supplies' | 'events' | 'transport' | 'it'
  description: string
  amount: number
  spentOn: string
  vendor: string
  approvedBy: string | null
  status: 'approved' | 'pending' | 'rejected'
}

export type ScholarshipApplication = { studentId: string; status: 'applied' | 'shortlisted' | 'awarded' | 'rejected'; score: number }
export type Scholarship = {
  id: string
  name: string
  type: 'merit' | 'need' | 'sports' | 'arts'
  coveragePercent: number
  amount: number
  criteria: string
  status: 'active' | 'closed'
  applications: ScholarshipApplication[]
}
/* ---------- communication ---------- */
export type Announcement = {
  id: string
  title: string
  body: string
  audience: 'all' | 'students' | 'teachers' | 'parents' | 'staff'
  authorId: string
  publishedAt: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channels: Array<'app' | 'email' | 'sms'>
  status: 'draft' | 'scheduled' | 'published'
  pinned: boolean
}

export type MessageTemplate = { id: string; name: string; channel: 'email' | 'sms'; category: string; subject: string; body: string; updatedAt: string; usageCount: number }

export type ChatMessage = { id: string; threadId: string; senderId: string; body: string; sentAt: string; read: boolean; attachmentName: string | null }
export type ChatThread = { id: string; name: string; type: 'direct' | 'group'; participantIds: string[]; lastMessageAt: string; unreadCount: number; messages: ChatMessage[] }

export type NotificationItem = {
  id: string
  title: string
  body: string
  audience: string
  channel: 'in_app' | 'email' | 'sms' | 'push'
  createdAt: string
  status: 'sent' | 'scheduled' | 'failed' | 'queued'
  recipients: number
  opened: number
  templateId: string | null
}

/* ---------- system ---------- */
export type AuditLog = {
  id: string
  actorId: string
  actorRole: Role
  action: string
  entity: string
  entityId: string
  module: string
  timestamp: string
  ip: string
  device: string
  severity: 'info' | 'warning' | 'critical'
}

export type FeatureToggle = { id: string; key: string; name: string; description: string; module: string; enabled: boolean; rolloutPercent: number; updatedBy: string; updatedAt: string }

export type PermissionActions = { create: boolean; read: boolean; update: boolean; delete: boolean }
export type PermissionMatrix = { modules: string[]; roles: Record<Role, Record<string, PermissionActions>> }

export type BackupRecord = { id: string; label: string; createdAt: string; sizeMb: number; type: 'auto' | 'manual'; status: 'completed' | 'running' | 'failed'; location: string; retentionDays: number }

export type IdCardRecord = { id: string; personId: string; personRole: Role; serial: string; template: 'student' | 'staff' | 'visitor'; issuedOn: string; validTill: string; status: 'issued' | 'pending' | 'revoked' }

export type Institution = {
  name: string
  code: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  principalName: string
  established: number
  academicYear: string
  timezone: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  logoInitials: string
  termsPerYear: number
  gradingScale: string
}

/* ---------- advanced / AI (feature-toggled off by default) ---------- */
export type ChatbotConversation = { id: string; userId: string; userRole: Role; topic: string; startedAt: string; turns: number; resolved: boolean; satisfaction: number; lastPrompt: string }

export type FaceAttendanceSession = { id: string; label: string; classId: string; camera: string; capturedAt: string; recognized: number; unknown: number; accuracy: number; durationSeconds: number; status: 'completed' | 'review' }

export type PlagiarismReport = { id: string; submissionTitle: string; studentId: string; assignmentId: string; submittedAt: string; similarityPercent: number; matchedSource: string; status: 'clear' | 'flagged' | 'reviewing' }

export type Recommendation = { id: string; studentId: string; type: 'resource' | 'remedial' | 'enrichment' | 'career'; title: string; rationale: string; confidence: number; generatedAt: string; accepted: boolean }

export type BehaviorIncident = { id: string; studentId: string; recordedBy: string; category: 'positive' | 'disruption' | 'punctuality' | 'bullying' | 'merit'; points: number; notes: string; occurredAt: string; followUp: 'none' | 'counselling' | 'parent_call' | 'detention' }
