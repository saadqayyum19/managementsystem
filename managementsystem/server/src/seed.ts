import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { Institution } from './models/Institution.js'
import { User, type Role } from './models/User.js'
import { Department } from './models/Department.js'
import { AcademicClass } from './models/AcademicClass.js'
import { Section } from './models/Section.js'
import { Subject } from './models/Subject.js'
import { Timetable } from './models/Timetable.js'
import { Attendance } from './models/Attendance.js'
import { Exam } from './models/Exam.js'
import { Marks } from './models/Marks.js'
import { Assignment } from './models/Assignment.js'
import { AssignmentSubmission } from './models/AssignmentSubmission.js'
import { FeeStructure } from './models/FeeStructure.js'
import { Invoice } from './models/Invoice.js'
import { FeePayment } from './models/FeePayment.js'
import { Salary } from './models/Salary.js'
import { Expense } from './models/Expense.js'
import { Scholarship } from './models/Scholarship.js'
import { LeaveRequest } from './models/LeaveRequest.js'
import { Holiday } from './models/Holiday.js'
import { Event } from './models/Event.js'
import { Announcement } from './models/Announcement.js'
import { Conversation } from './models/Conversation.js'
import { Message } from './models/Message.js'
import { Notification } from './models/Notification.js'
import { FeatureToggle } from './models/FeatureToggle.js'
import { AuditLog } from './models/AuditLog.js'

export async function seed() {
  await connectDatabase()
  console.log('Seeding EduCore OS database...')

  // 1. Institution
  const institution = await Institution.findOneAndUpdate(
    { code: 'EDUC01' },
    {
      name: 'EduCore Global Academy',
      slug: 'educore-global-academy',
      code: 'EDUC01',
      timezone: 'UTC',
      features: { attendance: true, assignments: true, finance: true, chat: true },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  const instId = institution._id

  // 2. Primary 5 Demo Users with specified credentials
  const adminHash = await bcrypt.hash('Admin@123', 10)
  const roleHash = await bcrypt.hash('Role@123', 10)

  const primaryUsers = [
    { firstName: 'EduCore', lastName: 'Admin', email: 'admin@educore.com', role: 'super_admin' as Role, passwordHash: adminHash },
    { firstName: 'Aisha', lastName: 'Rahman', email: 'principal@educore.com', role: 'principal' as Role, passwordHash: roleHash },
    { firstName: 'Marcus', lastName: 'Lee', email: 'teacher@educore.com', role: 'teacher' as Role, passwordHash: roleHash },
    { firstName: 'Olivia', lastName: 'Chen', email: 'student@educore.com', role: 'student' as Role, passwordHash: roleHash },
    { firstName: 'Daniel', lastName: 'Chen', email: 'parent@educore.com', role: 'parent' as Role, passwordHash: roleHash },
  ]

  const seededUsers: Record<string, any> = {}
  for (const u of primaryUsers) {
    const user = await User.findOneAndUpdate(
      { email: u.email },
      { ...u, institutionId: instId, isEmailVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    seededUsers[u.email] = user
  }

  // 3. Additional Teachers (Total 5 teachers)
  const additionalTeachers = [
    { firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.jenkins@educore.com', role: 'teacher' as Role },
    { firstName: 'David', lastName: 'Kumar', email: 'david.kumar@educore.com', role: 'teacher' as Role },
    { firstName: 'Elena', lastName: 'Rostova', email: 'elena.rostova@educore.com', role: 'teacher' as Role },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@educore.com', role: 'teacher' as Role },
  ]
  const teachers = [seededUsers['teacher@educore.com']]
  for (const t of additionalTeachers) {
    const doc = await User.findOneAndUpdate(
      { email: t.email },
      { ...t, institutionId: instId, passwordHash: roleHash, isEmailVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    teachers.push(doc)
  }

  // 4. Additional Students (Total 10 students)
  const additionalStudents = [
    { firstName: 'Ethan', lastName: 'Wright', email: 'ethan.wright@educore.com', role: 'student' as Role },
    { firstName: 'Sophia', lastName: 'Patel', email: 'sophia.patel@educore.com', role: 'student' as Role },
    { firstName: 'Lucas', lastName: 'Silva', email: 'lucas.silva@educore.com', role: 'student' as Role },
    { firstName: 'Emma', lastName: 'Watson', email: 'emma.watson@educore.com', role: 'student' as Role },
    { firstName: 'Noah', lastName: 'Kim', email: 'noah.kim@educore.com', role: 'student' as Role },
    { firstName: 'Mia', lastName: 'Garcia', email: 'mia.garcia@educore.com', role: 'student' as Role },
    { firstName: 'Alexander', lastName: 'Muller', email: 'alex.muller@educore.com', role: 'student' as Role },
    { firstName: 'Isabella', lastName: 'Rossi', email: 'isabella.rossi@educore.com', role: 'student' as Role },
    { firstName: 'Liam', lastName: 'O\'Connor', email: 'liam.oconnor@educore.com', role: 'student' as Role },
  ]
  const students = [seededUsers['student@educore.com']]
  for (const s of additionalStudents) {
    const doc = await User.findOneAndUpdate(
      { email: s.email },
      { ...s, institutionId: instId, passwordHash: roleHash, isEmailVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    students.push(doc)
  }

  // 5. Departments (5 Departments)
  const departmentDefs = [
    { name: 'Computer Science & IT', code: 'CS_DEPT', description: 'Computing, Algorithms, and Software Engineering' },
    { name: 'Mathematics & Statistics', code: 'MATH_DEPT', description: 'Pure & Applied Mathematics' },
    { name: 'Physical Sciences', code: 'PHYS_DEPT', description: 'Physics, Chemistry, and Laboratory Sciences' },
    { name: 'Humanities & Social Sciences', code: 'HUM_DEPT', description: 'History, Civics, and Social Studies' },
    { name: 'Languages & Literature', code: 'LANG_DEPT', description: 'English, Modern Languages, and Writing' },
  ]
  const departments: any[] = []
  for (let i = 0; i < departmentDefs.length; i++) {
    const d = departmentDefs[i]
    const doc = await Department.findOneAndUpdate(
      { institutionId: instId, code: d.code },
      { ...d, institutionId: instId, headTeacherId: teachers[i % teachers.length]._id, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    departments.push(doc)
  }

  // 6. Academic Classes (5 Classes)
  const classDefs = [
    { name: 'Grade 8A - Science & Tech', code: 'GR8A', gradeLevel: 8, academicYear: '2025-2026' },
    { name: 'Grade 8B - Arts & Humanities', code: 'GR8B', gradeLevel: 8, academicYear: '2025-2026' },
    { name: 'Grade 9A - Foundation STEM', code: 'GR9A', gradeLevel: 9, academicYear: '2025-2026' },
    { name: 'Grade 10A - Advanced Sciences', code: 'GR10A', gradeLevel: 10, academicYear: '2025-2026' },
    { name: 'Grade 10B - Commerce & Tech', code: 'GR10B', gradeLevel: 10, academicYear: '2025-2026' },
  ]
  const classes: any[] = []
  for (let i = 0; i < classDefs.length; i++) {
    const c = classDefs[i]
    const doc = await AcademicClass.findOneAndUpdate(
      { institutionId: instId, code: c.code },
      { ...c, institutionId: instId, departmentId: departments[i % departments.length]._id, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    classes.push(doc)
  }

  // 7. Sections for Classes
  const sections: any[] = []
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i]
    const secDoc = await Section.findOneAndUpdate(
      { institutionId: instId, classId: cls._id, code: 'SEC-1' },
      { institutionId: instId, classId: cls._id, name: 'Main Section', code: 'SEC-1', capacity: 35, room: `Hall ${201 + i}`, classTeacherId: teachers[i % teachers.length]._id, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    sections.push(secDoc)
  }

  // 8. Subjects (5 Subjects)
  const subjectDefs = [
    { name: 'Advanced Mathematics', code: 'MATH101', credits: 4, type: 'core' },
    { name: 'Computer Science & Coding', code: 'CS101', credits: 4, type: 'core' },
    { name: 'Physics & Lab Experiments', code: 'PHYS101', credits: 4, type: 'core' },
    { name: 'English Literature & Composition', code: 'ENG101', credits: 3, type: 'core' },
    { name: 'Chemistry & Molecular Science', code: 'CHEM101', credits: 4, type: 'core' },
  ]
  const subjects: any[] = []
  for (let i = 0; i < subjectDefs.length; i++) {
    const s = subjectDefs[i]
    const doc = await Subject.findOneAndUpdate(
      { institutionId: instId, code: s.code },
      { ...s, institutionId: instId, departmentId: departments[i % departments.length]._id, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    subjects.push(doc)
  }

  // 9. Timetable Entries
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  for (let cIdx = 0; cIdx < classes.length; cIdx++) {
    for (let dIdx = 0; dIdx < days.length; dIdx++) {
      const day = days[dIdx]
      await Timetable.findOneAndUpdate(
        { institutionId: instId, classId: classes[cIdx]._id, dayOfWeek: day, startTime: '08:30' },
        {
          institutionId: instId,
          classId: classes[cIdx]._id,
          sectionId: sections[cIdx]._id,
          subjectId: subjects[(cIdx + dIdx) % subjects.length]._id,
          teacherId: teachers[(cIdx + dIdx) % teachers.length]._id,
          dayOfWeek: day,
          startTime: '08:30',
          endTime: '09:20',
          room: `Room ${200 + cIdx}`,
          academicYear: '2025-2026',
        },
        { upsert: true, setDefaultsOnInsert: true }
      )
    }
  }

  // 10. Attendance Records for 10 students over past 14 days
  const today = new Date()
  for (let d = 0; d < 14; d++) {
    const curDate = new Date(today)
    curDate.setDate(today.getDate() - d)
    curDate.setHours(9, 0, 0, 0)

    for (let sIdx = 0; sIdx < students.length; sIdx++) {
      const student = students[sIdx]
      const status = (sIdx + d) % 9 === 0 ? 'absent' : (sIdx + d) % 7 === 0 ? 'late' : 'present'
      await Attendance.findOneAndUpdate(
        { institutionId: instId, studentId: student._id, date: curDate },
        {
          institutionId: instId,
          studentId: student._id,
          classId: classes[sIdx % classes.length]._id,
          sectionId: sections[sIdx % sections.length]._id,
          date: curDate,
          status,
          method: 'manual',
          markedBy: teachers[0]._id,
        },
        { upsert: true, setDefaultsOnInsert: true }
      )
    }
  }

  // 11. Exams & Marks
  const exam = await Exam.findOneAndUpdate(
    { institutionId: instId, name: 'Mid-Term Examinations 2025-2026' },
    {
      institutionId: instId,
      name: 'Mid-Term Examinations 2025-2026',
      examType: 'midterm',
      academicYear: '2025-2026',
      startDate: new Date('2025-10-10'),
      endDate: new Date('2025-10-20'),
      status: 'published',
      subjects: subjects.map((sub) => ({ subjectId: sub._id, maxMarks: 100, passMarks: 40 })),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  for (let sIdx = 0; sIdx < students.length; sIdx++) {
    const student = students[sIdx]
    for (let subIdx = 0; subIdx < subjects.length; subIdx++) {
      const sub = subjects[subIdx]
      const marksVal = Math.min(100, 55 + ((sIdx * 4 + subIdx * 9) % 43))
      await Marks.findOneAndUpdate(
        { institutionId: instId, examId: exam._id, studentId: student._id, subjectId: sub._id },
        {
          institutionId: instId,
          examId: exam._id,
          studentId: student._id,
          subjectId: sub._id,
          classId: classes[sIdx % classes.length]._id,
          obtainedMarks: marksVal,
          maxMarks: 100,
          grade: marksVal >= 85 ? 'A' : marksVal >= 70 ? 'B' : marksVal >= 55 ? 'C' : 'D',
          evaluatedBy: teachers[subIdx % teachers.length]._id,
        },
        { upsert: true, setDefaultsOnInsert: true }
      )
    }
  }

  // 12. Assignments & Submissions
  for (let subIdx = 0; subIdx < subjects.length; subIdx++) {
    const sub = subjects[subIdx]
    const asg = await Assignment.findOneAndUpdate(
      { institutionId: instId, title: `${sub.name} - Midterm Assignment` },
      {
        institutionId: instId,
        title: `${sub.name} - Midterm Assignment`,
        description: `Comprehensive project and practical exercises on core concepts covered in ${sub.name}.`,
        classId: classes[subIdx % classes.length]._id,
        sectionId: sections[subIdx % sections.length]._id,
        subjectId: sub._id,
        teacherId: teachers[subIdx % teachers.length]._id,
        dueDate: new Date(Date.now() + (subIdx + 3) * 86400000),
        maxMarks: 50,
        status: 'published',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // Submissions from students
    for (let sIdx = 0; sIdx < 4; sIdx++) {
      await AssignmentSubmission.findOneAndUpdate(
        { institutionId: instId, assignmentId: asg._id, studentId: students[sIdx]._id },
        {
          institutionId: instId,
          assignmentId: asg._id,
          studentId: students[sIdx]._id,
          status: 'graded',
          submittedAt: new Date(),
          obtainedMarks: 42 + sIdx,
          feedback: 'Well reasoned analysis and thorough documentation.',
          gradedBy: teachers[subIdx % teachers.length]._id,
        },
        { upsert: true, setDefaultsOnInsert: true }
      )
    }
  }

  // 13. Fee Structures, Invoices, and Payments
  const feeStructures = [
    { name: 'Annual Tuition - Grade 8', type: 'tuition', amount: 3500, frequency: 'annual' },
    { name: 'Annual Tuition - Grade 9', type: 'tuition', amount: 4000, frequency: 'annual' },
    { name: 'Annual Tuition - Grade 10', type: 'tuition', amount: 4500, frequency: 'annual' },
    { name: 'Science & Computer Lab Fee', type: 'lab', amount: 600, frequency: 'semester' },
    { name: 'School Bus & Transport Service', type: 'transport', amount: 950, frequency: 'monthly' },
  ]
  const seededFeeStructures: any[] = []
  for (const fs of feeStructures) {
    const doc = await FeeStructure.findOneAndUpdate(
      { institutionId: instId, name: fs.name },
      { ...fs, institutionId: instId, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    seededFeeStructures.push(doc)
  }

  // Invoices & Payments for students
  for (let sIdx = 0; sIdx < students.length; sIdx++) {
    const student = students[sIdx]
    const invoiceNumber = `INV-2026-${(1001 + sIdx).toString()}`
    const totalAmount = 4500
    const paidAmount = sIdx % 3 === 0 ? 4500 : sIdx % 3 === 1 ? 2250 : 0
    const status = paidAmount === totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending'

    const inv = await Invoice.findOneAndUpdate(
      { institutionId: instId, invoiceNumber },
      {
        institutionId: instId,
        studentId: student._id,
        invoiceNumber,
        items: [
          { feeStructureId: seededFeeStructures[0]._id, description: 'Academic Tuition Term 1', amount: 3900 },
          { feeStructureId: seededFeeStructures[3]._id, description: 'Lab Equipment & Tech Access', amount: 600 },
        ],
        totalAmount,
        paidAmount,
        dueDate: new Date(Date.now() + 15 * 86400000),
        status,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    if (paidAmount > 0) {
      await FeePayment.findOneAndUpdate(
        { institutionId: instId, invoiceId: inv._id },
        {
          institutionId: instId,
          invoiceId: inv._id,
          studentId: student._id,
          amount: paidAmount,
          paymentMethod: 'online',
          transactionId: `TXN-${Date.now()}-${sIdx}`,
          status: 'successful',
          receiptNumber: `RCP-2026-${(5001 + sIdx).toString()}`,
          paymentDate: new Date(),
          collectedBy: seededUsers['admin@educore.com']._id,
        },
        { upsert: true, setDefaultsOnInsert: true }
      )
    }
  }

  // 14. Salaries for Teachers
  for (let tIdx = 0; tIdx < teachers.length; tIdx++) {
    const teacher = teachers[tIdx]
    await Salary.findOneAndUpdate(
      { institutionId: instId, staffId: teacher._id, month: '2026-09' },
      {
        institutionId: instId,
        staffId: teacher._id,
        month: '2026-09',
        baseSalary: 5200 + tIdx * 300,
        allowances: 600,
        deductions: 250,
        netSalary: 5200 + tIdx * 300 + 350,
        status: 'paid',
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
      },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  // 15. Expenses
  const sampleExpenses = [
    { title: 'Computer Lab Workstation Upgrades', category: 'supplies', amount: 3200 },
    { title: 'Campus Fiber High-Speed Internet', category: 'utilities', amount: 850 },
    { title: 'Annual Athletic Equipment Restock', category: 'events', amount: 1400 },
    { title: 'Campus Facilities Deep Sanitization', category: 'maintenance', amount: 920 },
  ]
  for (const exp of sampleExpenses) {
    await Expense.findOneAndUpdate(
      { institutionId: instId, title: exp.title },
      { ...exp, institutionId: instId, recordedBy: seededUsers['admin@educore.com']._id, date: new Date() },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  // 16. Scholarships
  await Scholarship.findOneAndUpdate(
    { institutionId: instId, name: 'Presidential STEM Merit Award' },
    {
      institutionId: instId,
      name: 'Presidential STEM Merit Award',
      description: 'Full tuition deduction for highest scoring applicants in computing and mathematics',
      type: 'merit',
      discountPercentage: 50,
      academicYear: '2025-2026',
      status: 'active',
      beneficiaries: [students[0]._id, students[1]._id],
    },
    { upsert: true, setDefaultsOnInsert: true }
  )

  // 17. Operations: Leave Requests, Holidays, Events
  await LeaveRequest.findOneAndUpdate(
    { institutionId: instId, reason: 'Family medical leave' },
    {
      institutionId: instId,
      userId: teachers[1]._id,
      leaveType: 'casual',
      startDate: new Date(Date.now() + 2 * 86400000),
      endDate: new Date(Date.now() + 4 * 86400000),
      reason: 'Family medical leave',
      status: 'pending',
    },
    { upsert: true, setDefaultsOnInsert: true }
  )

  await LeaveRequest.findOneAndUpdate(
    { institutionId: instId, reason: 'Conference presentation on modern physics' },
    {
      institutionId: instId,
      userId: teachers[0]._id,
      leaveType: 'annual',
      startDate: new Date(Date.now() - 5 * 86400000),
      endDate: new Date(Date.now() - 3 * 86400000),
      reason: 'Conference presentation on modern physics',
      status: 'approved',
      reviewedBy: seededUsers['principal@educore.com']._id,
      reviewRemarks: 'Approved for professional development.',
    },
    { upsert: true, setDefaultsOnInsert: true }
  )

  const holidays = [
    { title: 'National Foundation Day', startDate: new Date('2026-10-01'), endDate: new Date('2026-10-02'), type: 'national' },
    { title: 'Winter Academic Recess', startDate: new Date('2026-12-22'), endDate: new Date('2027-01-05'), type: 'seasonal' },
    { title: 'Spring Festival Holiday', startDate: new Date('2027-03-20'), endDate: new Date('2027-03-25'), type: 'religious' },
  ]
  for (const h of holidays) {
    await Holiday.findOneAndUpdate({ institutionId: instId, title: h.title }, { ...h, institutionId: instId }, { upsert: true, setDefaultsOnInsert: true })
  }

  const events = [
    { title: 'Annual Global Science & Robotics Exhibition', category: 'academic', startDate: new Date(Date.now() + 10 * 86400000), endDate: new Date(Date.now() + 11 * 86400000), location: 'Main Auditorium & STEM Hall' },
    { title: 'Inter-School Track & Field Championship', category: 'sports', startDate: new Date(Date.now() + 20 * 86400000), endDate: new Date(Date.now() + 21 * 86400000), location: 'Campus Sports Complex' },
    { title: 'Parent-Teacher Academic Progress Review', category: 'meeting', startDate: new Date(Date.now() + 7 * 86400000), endDate: new Date(Date.now() + 7 * 86400000), location: 'Classrooms 201-205' },
  ]
  for (const ev of events) {
    await Event.findOneAndUpdate({ institutionId: instId, title: ev.title }, { ...ev, institutionId: instId, organizer: seededUsers['principal@educore.com']._id }, { upsert: true, setDefaultsOnInsert: true })
  }

  // 18. Announcements
  const announcements = [
    {
      title: 'Welcome to Academic Term 2025-2026',
      content: 'We welcome all faculty, students, and parents to the new academic session with upgraded campus facilities and digital learning portals.',
      priority: 'high',
      category: 'general',
    },
    {
      title: 'Midterm Examination Schedule Released',
      content: 'The mid-term examination timetable is now officially published. Please verify dates, exam halls, and required stationery.',
      priority: 'urgent',
      category: 'exam',
    },
    {
      title: 'Tuition Fee Payment Portal Open',
      content: 'Parents and guardians may now settle term invoices online via card or bank transfer directly in the finance tab.',
      priority: 'medium',
      category: 'fee',
    },
  ]
  for (const a of announcements) {
    await Announcement.findOneAndUpdate(
      { institutionId: instId, title: a.title },
      { ...a, institutionId: instId, authorId: seededUsers['principal@educore.com']._id, isPublished: true },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  // 19. Conversations & Messages
  const conv = await Conversation.findOneAndUpdate(
    {
      institutionId: instId,
      type: 'direct',
      participants: { $all: [seededUsers['principal@educore.com']._id, seededUsers['teacher@educore.com']._id] },
    },
    {
      institutionId: instId,
      type: 'direct',
      participants: [seededUsers['principal@educore.com']._id, seededUsers['teacher@educore.com']._id],
      lastMessage: {
        text: 'Marcus, please review the latest lab safety guidelines before Friday.',
        senderId: seededUsers['principal@educore.com']._id,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await Message.findOneAndUpdate(
    { conversationId: conv._id, text: 'Marcus, please review the latest lab safety guidelines before Friday.' },
    {
      conversationId: conv._id,
      senderId: seededUsers['principal@educore.com']._id,
      text: 'Marcus, please review the latest lab safety guidelines before Friday.',
      content: 'Marcus, please review the latest lab safety guidelines before Friday.',
    },
    { upsert: true, setDefaultsOnInsert: true }
  )

  // 20. Notifications
  await Notification.findOneAndUpdate(
    { recipientId: seededUsers['student@educore.com']._id, title: 'New Assignment Published' },
    {
      institutionId: instId,
      recipientId: seededUsers['student@educore.com']._id,
      senderId: seededUsers['teacher@educore.com']._id,
      title: 'New Assignment Published',
      message: 'Advanced Mathematics - Midterm Assignment has been assigned.',
      type: 'info',
      isRead: false,
    },
    { upsert: true, setDefaultsOnInsert: true }
  )

  // 21. Feature Toggles
  const featureToggles = [
    { featureKey: 'chat_module', name: 'Real-time Chat & Messaging', description: 'Enable direct messages and channel discussions', category: 'Communication', isEnabled: true },
    { featureKey: 'attendance_tracking', name: 'Live Attendance Module', description: 'Record daily attendance per section or class', category: 'Academics', isEnabled: true },
    { featureKey: 'online_fee_payments', name: 'Online Fee Gateway', description: 'Permit credit card and gateway fee settlements', category: 'Finance', isEnabled: true },
    { featureKey: 'exam_results_portal', name: 'Public Examination Results', description: 'Publish student report cards to student & parent dashboards', category: 'Academics', isEnabled: true },
    { featureKey: 'leave_approvals', name: 'Staff & Student Leave Flow', description: 'Workflow for applying and authorizing leave requests', category: 'Operations', isEnabled: true },
    { featureKey: 'audit_logging', name: 'Security Audit Log Streaming', description: 'Log all critical mutations to an immutable audit ledger', category: 'System', isEnabled: true },
  ]
  for (const ft of featureToggles) {
    await FeatureToggle.findOneAndUpdate({ institutionId: instId, featureKey: ft.featureKey }, { ...ft, institutionId: instId }, { upsert: true, setDefaultsOnInsert: true })
  }

  // 22. Audit Logs
  const auditLogs = [
    { action: 'USER_LOGIN', category: 'auth', status: 'success', details: { email: 'admin@educore.com' }, ipAddress: '127.0.0.1' },
    { action: 'EXAM_PUBLISHED', category: 'academic', status: 'success', details: { examName: 'Mid-Term Examinations 2025-2026' }, ipAddress: '127.0.0.1' },
    { action: 'FEE_PAYMENT_COLLECTED', category: 'finance', status: 'success', details: { amount: 4500, receiptNumber: 'RCP-2026-5001' }, ipAddress: '127.0.0.1' },
    { action: 'FEATURE_TOGGLE_UPDATED', category: 'system', status: 'success', details: { featureKey: 'chat_module', state: true }, ipAddress: '127.0.0.1' },
  ]
  for (const al of auditLogs) {
    await AuditLog.create({ ...al, institutionId: instId, userId: seededUsers['admin@educore.com']._id })
  }

  console.log('✅ Database seeded successfully with 10 students, 5 teachers, 5 classes, 5 subjects, and complete demo data!')
  console.log('Credentials:')
  console.log('  Admin:     admin@educore.com / Admin@123')
  console.log('  Principal: principal@educore.com / Role@123')
  console.log('  Teacher:   teacher@educore.com / Role@123')
  console.log('  Student:   student@educore.com / Role@123')
  console.log('  Parent:    parent@educore.com / Role@123')

  await disconnectDatabase()
}

seed().catch(async (error) => {
  console.error('Error seeding database:', error)
  await disconnectDatabase()
  process.exit(1)
})
