import { students, teachers } from './people'
import { studentProfiles } from './profiles'
import { daysAgo, daysAhead, isoDate, last30Days, randomInt, rng, round, TODAY } from './seed'
import type {
  Assignment, AssignmentSubmission, AttendanceRecord, AttendanceStatus, DoubtThread, Exam, LibraryResource,
  LiveClass, Mark, Quiz, QuizAttempt, SchoolClass, Section, Subject, SubmissionStatus, TimetableSlot,
} from './types'

/* ---------- classes, sections, subjects ---------- */
export const schoolClasses: SchoolClass[] = [
  { id: 'cls-01', name: 'Grade 6A', grade: 6, room: 'R-101', capacity: 32, classTeacherId: 'tch-05', sectionIds: ['sec-01'], subjectIds: ['sub-03', 'sub-04', 'sub-05'], studentCount: 0 },
  { id: 'cls-02', name: 'Grade 7A', grade: 7, room: 'R-102', capacity: 32, classTeacherId: 'tch-03', sectionIds: ['sec-02'], subjectIds: ['sub-01', 'sub-03', 'sub-05'], studentCount: 0 },
  { id: 'cls-03', name: 'Grade 8B', grade: 8, room: 'R-103', capacity: 30, classTeacherId: 'tch-04', sectionIds: ['sec-03'], subjectIds: ['sub-01', 'sub-02', 'sub-04'], studentCount: 0 },
  { id: 'cls-04', name: 'Grade 9A', grade: 9, room: 'R-201', capacity: 30, classTeacherId: 'tch-01', sectionIds: ['sec-04'], subjectIds: ['sub-01', 'sub-02', 'sub-03'], studentCount: 0 },
  { id: 'cls-05', name: 'Grade 10A', grade: 10, room: 'R-202', capacity: 28, classTeacherId: 'tch-02', sectionIds: ['sec-05'], subjectIds: ['sub-01', 'sub-02', 'sub-03', 'sub-04', 'sub-05'], studentCount: 0 },
]

export const sections: Section[] = [
  { id: 'sec-01', classId: 'cls-01', name: 'A', room: 'R-101' },
  { id: 'sec-02', classId: 'cls-02', name: 'A', room: 'R-102' },
  { id: 'sec-03', classId: 'cls-03', name: 'B', room: 'R-103' },
  { id: 'sec-04', classId: 'cls-04', name: 'A', room: 'R-201' },
  { id: 'sec-05', classId: 'cls-05', name: 'A', room: 'R-202' },
]

export const subjects: Subject[] = [
  { id: 'sub-01', name: 'Mathematics', code: 'MTH', type: 'core', weeklyPeriods: 6, teacherIds: ['tch-01'], classIds: ['cls-02', 'cls-03', 'cls-04', 'cls-05'] },
  { id: 'sub-02', name: 'Science', code: 'SCI', type: 'core', weeklyPeriods: 5, teacherIds: ['tch-02'], classIds: ['cls-03', 'cls-04', 'cls-05'] },
  { id: 'sub-03', name: 'English', code: 'ENG', type: 'core', weeklyPeriods: 5, teacherIds: ['tch-03'], classIds: ['cls-01', 'cls-02', 'cls-04', 'cls-05'] },
  { id: 'sub-04', name: 'Social Studies', code: 'SST', type: 'core', weeklyPeriods: 4, teacherIds: ['tch-04'], classIds: ['cls-01', 'cls-03', 'cls-05'] },
  { id: 'sub-05', name: 'Computer Science', code: 'CSC', type: 'elective', weeklyPeriods: 4, teacherIds: ['tch-05'], classIds: ['cls-01', 'cls-02', 'cls-05'] },
]

export function classOf(studentId: string): SchoolClass | undefined {
  const student = students.find((item) => item.id === studentId)
  return student ? schoolClasses.find((item) => item.id === student.classId) : undefined
}

/* ---------- timetable (5 classes x 5 days x 6 periods) ---------- */
const periodTimes: Array<{ start: string; end: string }> = [
  { start: '08:30', end: '09:20' }, { start: '09:25', end: '10:15' }, { start: '10:35', end: '11:25' },
  { start: '11:30', end: '12:20' }, { start: '12:45', end: '13:35' }, { start: '13:40', end: '14:30' },
]
const weekdays: Array<TimetableSlot['day']> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export const timetable: TimetableSlot[] = schoolClasses.flatMap((schoolClass) => weekdays.flatMap((day, dayIndex) => periodTimes.map((time, periodIndex) => {
  const subjectId = schoolClass.subjectIds[(dayIndex + periodIndex) % schoolClass.subjectIds.length]
  const subject = subjects.find((item) => item.id === subjectId)!
  const teacherId = subject.teacherIds[0]
  return { id: `tt-${schoolClass.id}-${day}-${periodIndex + 1}`, classId: schoolClass.id, subjectId, teacherId, day, period: periodIndex + 1, startTime: time.start, endTime: time.end, room: schoolClass.room }
})))

/* exported helpers used by timetable + workspace pages */
export function slotsForDay(day: TimetableSlot['day'], classId?: string): TimetableSlot[] {
  return timetable.filter((slot) => slot.day === day && (!classId || slot.classId === classId))
}
export function slotsForTeacher(teacherId: string): TimetableSlot[] {
  return timetable.filter((slot) => slot.teacherId === teacherId)
}
export const weekdaysOrder = weekdays
export const periodTimesOrder = periodTimes
export const todayName: TimetableSlot['day'] = weekdaysOrder[TODAY.getUTCDay() === 0 ? 6 : TODAY.getUTCDay() - 1] ?? 'Wed'
export const todaySlots: TimetableSlot[] = slotsForDay(todayName)

/* ---------- attendance: 30 days x 10 students, driven by each student's target ---------- */
export function attendanceRateFor(studentId: string, records: AttendanceRecord[]): number {
  const mine = records.filter((record) => record.studentId === studentId)
  if (mine.length === 0) return 0
  const credited = mine.filter((record) => record.status === 'present' || record.status === 'late').length
  return round((credited / mine.length) * 100, 1)
}

function rollAttendanceStatus(target: number): AttendanceStatus {
  const roll = rng() * 100
  if (roll < target) return 'present'
  const remaining = 100 - target
  if (roll < target + remaining * 0.45) return 'late'
  if (roll < target + remaining * 0.72) return 'excused'
  return 'absent'
}

export const attendance: AttendanceRecord[] = students.flatMap((student) => {
  const profile = studentProfiles.find((item) => item.studentId === student.id)!
  const classTeacherId = schoolClasses.find((item) => item.id === student.classId)?.classTeacherId ?? 'tch-01'
  return last30Days.map((date, index) => ({
    id: `att-${student.id}-${date}`,
    studentId: student.id,
    classId: student.classId,
    date,
    status: rollAttendanceStatus(profile.attendanceTarget),
    method: index % 9 === 0 ? 'face' : index % 5 === 0 ? 'qr' : 'manual',
    markedBy: classTeacherId,
  }))
})

/* ---------- exams + marks (marks derive from the performance target) ---------- */
export function gradeFor(percent: number): string {
  if (percent >= 90) return 'A+'
  if (percent >= 80) return 'A'
  if (percent >= 70) return 'B'
  if (percent >= 60) return 'C'
  if (percent >= 50) return 'D'
  return 'E'
}
export function remarkFor(percent: number): string {
  if (percent >= 90) return 'Outstanding command of the topic.'
  if (percent >= 75) return 'Meets expectations comfortably.'
  if (percent >= 60) return 'Passes, needs revision on weak units.'
  if (percent >= 50) return 'Borderline — remedial practice advised.'
  return 'Needs immediate intervention and parent update.'
}
export function percentOf(mark: Mark): number { return round((mark.marksObtained / mark.maxMarks) * 100, 1) }

const subjectName = (subjectId: string) => subjects.find((item) => item.id === subjectId)?.name ?? 'Subject'

export const exams: Exam[] = schoolClasses.flatMap((schoolClass) => schoolClass.subjectIds.map((subjectId, index): Exam => ({
  id: `exam-${schoolClass.id}-${subjectId}-unit`,
  name: `${subjectName(subjectId)} Unit Test II`,
  type: 'unit',
  classId: schoolClass.id,
  subjectId,
  date: daysAgo(16 - index),
  maxMarks: 25,
  passMarks: 10,
  invigilatorId: subjects.find((item) => item.id === subjectId)?.teacherIds[0] ?? 'tch-01',
  status: 'completed',
})).concat(schoolClass.subjectIds.filter((subjectId) => subjects.find((item) => item.id === subjectId)?.type === 'core').map((subjectId, index): Exam => ({
  id: `exam-${schoolClass.id}-${subjectId}-mid`,
  name: `${subjectName(subjectId)} Midterm Assessment`,
  type: 'midterm',
  classId: schoolClass.id,
  subjectId,
  date: daysAgo(6 - index),
  maxMarks: 100,
  passMarks: 35,
  invigilatorId: subjects.find((item) => item.id === subjectId)?.teacherIds[0] ?? 'tch-01',
  status: 'completed',
}))).concat(schoolClasses.slice(3).flatMap((schoolClass, index): Exam[] => schoolClass.subjectIds.slice(0, 2).map((subjectId, subjectIndex): Exam => ({
  id: `exam-${schoolClass.id}-${subjectId}-final`,
  name: `${subjectName(subjectId)} Final Term`,
  type: 'final',
  classId: schoolClass.id,
  subjectId,
  date: daysAhead(21 + index + subjectIndex),
  maxMarks: 100,
  passMarks: 35,
  invigilatorId: subjects.find((item) => item.id === subjectId)?.teacherIds[0] ?? 'tch-01',
  status: 'scheduled',
})))))

export const marks: Mark[] = exams.filter((exam) => exam.status === 'completed').flatMap((exam) => students
  .filter((student) => student.classId === exam.classId)
  .map((student) => {
    const profile = studentProfiles.find((item) => item.studentId === student.id)!
    const subjectIndex = subjects.findIndex((item) => item.id === exam.subjectId)
    const percent = Math.max(32, Math.min(99, profile.performanceTarget + (subjectIndex - 2) * 4 + randomInt(-6, 6)))
    const marksObtained = exam.maxMarks === 25 ? Math.round((percent / 100) * 25) : Math.round(percent)
    return {
      id: `mark-${exam.id}-${student.id}`,
      examId: exam.id,
      studentId: student.id,
      subjectId: exam.subjectId,
      classId: exam.classId,
      marksObtained,
      maxMarks: exam.maxMarks,
      grade: gradeFor(percent),
      remarks: remarkFor(percent),
    }
  }))

export const teachersOfSubject = (subjectId: string) => teachers.filter((teacher) => teacher.subjectIds.includes(subjectId))
/* ---------- assignments + submissions ---------- */
const assignmentTitles: Record<string, string[]> = {
  'sub-01': ['Quadratic equations worksheet', 'Coordinate geometry problem set'],
  'sub-02': [`Newton's laws lab report`, 'Periodic table mind map'],
  'sub-03': ['Descriptive essay — my city', 'Poetry analysis: The Road Not Taken'],
  'sub-04': ['Map work: river systems', 'Case study: industrial revolution'],
  'sub-05': ['Build a to-do list in HTML/CSS', 'Loops and conditionals practice'],
}

export const assignments: Assignment[] = schoolClasses.flatMap((schoolClass, classIndex) => schoolClass.subjectIds.slice(0, 2).map((subjectId, subjectIndex) => {
  const titles = assignmentTitles[subjectId] ?? ['Practice set']
  const overdue = (classIndex + subjectIndex) % 3 === 0
  const dueDate = overdue ? daysAgo(3 + classIndex) : daysAhead(3 + classIndex + subjectIndex * 2)
  const id = `asg-${schoolClass.id}-${subjectId}`
  const submissions: AssignmentSubmission[] = students.filter((student) => student.classId === schoolClass.id).map((student, index) => {
    const profile = studentProfiles.find((item) => item.studentId === student.id)!
    const strong = profile.engagement >= (index % 2 === 0 ? 70 : 62)
    const status: SubmissionStatus = strong ? (overdue ? 'graded' : 'submitted') : overdue ? 'late' : 'pending'
    return {
      id: `sub-${id}-${student.id}`,
      assignmentId: id,
      studentId: student.id,
      submittedAt: status === 'pending' ? null : isoDate(TODAY),
      status,
      marks: status === 'graded' ? Math.round((profile.performanceTarget / 100) * 20) : null,
      feedback: status === 'graded' ? remarkFor(profile.performanceTarget) : null,
    }
  })
  return {
    id,
    title: titles[(classIndex + subjectIndex) % titles.length],
    description: `Complete ${titles[(classIndex + subjectIndex) % titles.length].toLowerCase()} and upload evidence of your working before the due date.`,
    subjectId,
    classId: schoolClass.id,
    teacherId: subjects.find((item) => item.id === subjectId)?.teacherIds[0] ?? 'tch-01',
    createdAt: daysAgo(overdue ? 12 : 4),
    dueDate,
    maxMarks: 20,
    status: classIndex === 4 && subjectIndex === 0 ? 'draft' : overdue ? 'closed' : 'published',
    attachmentName: subjectIndex === 0 ? `unit-${classIndex + 2}-brief.pdf` : null,
    submissions,
  }
}))

/* ---------- quizzes ---------- */
const quizTopics: Record<string, string> = { 'sub-01': 'Algebra rapid round', 'sub-02': 'Physics motion check', 'sub-03': 'Grammar & comprehension', 'sub-04': 'Modern history MCQ', 'sub-05': 'Python fundamentals' }

export const quizzes: Quiz[] = schoolClasses.flatMap((schoolClass, classIndex) => schoolClass.subjectIds.slice(0, 2).map((subjectId, subjectIndex) => {
  const id = `quiz-${schoolClass.id}-${subjectId}`
  const inFuture = (classIndex + subjectIndex) % 2 === 0
  const attempts: QuizAttempt[] = students.filter((student) => student.classId === schoolClass.id).map((student) => {
    const profile = studentProfiles.find((item) => item.studentId === student.id)!
    const completed = !inFuture && profile.engagement > 65
    return {
      studentId: student.id,
      score: completed ? Math.round((profile.performanceTarget / 100) * 25) : null,
      status: inFuture ? 'not_started' : completed ? 'completed' : 'in_progress',
      violations: profile.engagement < 70 ? randomInt(0, 2) : 0,
    }
  })
  return {
    id,
    title: quizTopics[subjectId] ?? 'Quick check',
    subjectId,
    classId: schoolClass.id,
    teacherId: subjects.find((item) => item.id === subjectId)?.teacherIds[0] ?? 'tch-01',
    scheduledAt: inFuture ? `${daysAhead(4 + classIndex)} 10:00` : `${daysAgo(5 + classIndex)} 10:00`,
    durationMinutes: subjectIndex === 0 ? 30 : 45,
    mode: subjectIndex === 0 ? 'mcq' : 'descriptive',
    totalMarks: 25,
    aiProctored: subjectIndex === 1,
    attempts,
  }
}))
/* ---------- e-library ---------- */
export const libraryResources: LibraryResource[] = [
  { id: 'lib-01', title: 'Mathematics Beyond the Syllabus', author: 'R. Sundaram', category: 'Mathematics', type: 'ebook', subjectId: 'sub-01', addedOn: daysAgo(120), downloads: 342, rating: 4.7, sizeMb: 12.4 },
  { id: 'lib-02', title: 'Concepts of Physics — Volume 1', author: 'H. Verma', category: 'Science', type: 'ebook', subjectId: 'sub-02', addedOn: daysAgo(210), downloads: 511, rating: 4.9, sizeMb: 28.1 },
  { id: 'lib-03', title: 'An Anthology of Modern Poetry', author: 'L. Dsouza', category: 'English', type: 'ebook', subjectId: 'sub-03', addedOn: daysAgo(88), downloads: 198, rating: 4.3, sizeMb: 8.7 },
  { id: 'lib-04', title: 'World History Atlas', author: 'P. Nakamura', category: 'Social Studies', type: 'ebook', subjectId: 'sub-04', addedOn: daysAgo(64), downloads: 154, rating: 4.1, sizeMb: 44.2 },
  { id: 'lib-05', title: 'Python for Young Coders', author: 'E. Garcia', category: 'Computer Science', type: 'ebook', subjectId: 'sub-05', addedOn: daysAgo(45), downloads: 402, rating: 4.8, sizeMb: 16.9 },
  { id: 'lib-06', title: 'Journal of STEM Pedagogy Vol. 12', author: 'Westbridge Press', category: 'Research', type: 'journal', subjectId: null, addedOn: daysAgo(30), downloads: 76, rating: 3.9, sizeMb: 5.2 },
  { id: 'lib-07', title: 'Algebra in Motion (video series)', author: 'EduCore Studio', category: 'Mathematics', type: 'video', subjectId: 'sub-01', addedOn: daysAgo(21), downloads: 623, rating: 4.6, sizeMb: 320.5 },
  { id: 'lib-08', title: 'Lab Safety Essentials (video)', author: 'EduCore Studio', category: 'Science', type: 'video', subjectId: 'sub-02', addedOn: daysAgo(18), downloads: 289, rating: 4.4, sizeMb: 180.3 },
  { id: 'lib-09', title: 'Creative Writing Workbook', author: 'M. Fernandes', category: 'English', type: 'paper', subjectId: 'sub-03', addedOn: daysAgo(15), downloads: 132, rating: 4.2, sizeMb: 3.4 },
  { id: 'lib-10', title: 'Civics: How Governments Work', author: 'A. Oyelaran', category: 'Social Studies', type: 'ebook', subjectId: 'sub-04', addedOn: daysAgo(12), downloads: 167, rating: 4.0, sizeMb: 10.1 },
  { id: 'lib-11', title: 'Data Structures Illustrated', author: 'K. Nakamura', category: 'Computer Science', type: 'ebook', subjectId: 'sub-05', addedOn: daysAgo(9), downloads: 233, rating: 4.5, sizeMb: 22.6 },
  { id: 'lib-12', title: 'Peer Assessment Research Notes', author: 'Westbridge Press', category: 'Research', type: 'paper', subjectId: null, addedOn: daysAgo(5), downloads: 41, rating: 3.7, sizeMb: 1.8 },
]

/* ---------- live classes ---------- */
export const liveClasses: LiveClass[] = [
  { id: 'live-01', title: 'Mathematics: Quadratic graphs', subjectId: 'sub-01', classId: 'cls-05', teacherId: 'tch-01', startsAt: `${isoDate(TODAY)} 09:00`, durationMinutes: 45, platform: 'educore-meet', status: 'live', attendeeIds: ['stu-01', 'stu-02'], recordingUrl: null },
  { id: 'live-02', title: 'Science: Laws of motion clinic', subjectId: 'sub-02', classId: 'cls-05', teacherId: 'tch-02', startsAt: `${daysAhead(1)} 10:00`, durationMinutes: 45, platform: 'educore-meet', status: 'scheduled', attendeeIds: [], recordingUrl: null },
  { id: 'live-03', title: 'English: Narrative writing workshop', subjectId: 'sub-03', classId: 'cls-04', teacherId: 'tch-03', startsAt: `${daysAhead(2)} 11:30`, durationMinutes: 50, platform: 'zoom', status: 'scheduled', attendeeIds: [], recordingUrl: null },
  { id: 'live-04', title: 'Computer Science: Debugging clinic', subjectId: 'sub-05', classId: 'cls-02', teacherId: 'tch-05', startsAt: `${daysAhead(3)} 13:00`, durationMinutes: 40, platform: 'educore-meet', status: 'scheduled', attendeeIds: [], recordingUrl: null },
  { id: 'live-05', title: 'Social Studies: Map interpretation', subjectId: 'sub-04', classId: 'cls-03', teacherId: 'tch-04', startsAt: `${daysAgo(2)} 09:45`, durationMinutes: 45, platform: 'educore-meet', status: 'completed', attendeeIds: ['stu-05', 'stu-06'], recordingUrl: 'https://mock.educore.local/rec/live-05' },
  { id: 'live-06', title: 'Mathematics: Revision marathon', subjectId: 'sub-01', classId: 'cls-04', teacherId: 'tch-01', startsAt: `${daysAgo(4)} 11:00`, durationMinutes: 60, platform: 'youtube', status: 'completed', attendeeIds: ['stu-03'], recordingUrl: 'https://mock.educore.local/rec/live-06' },
  { id: 'live-07', title: 'Science: Practical walkthrough', subjectId: 'sub-02', classId: 'cls-04', teacherId: 'tch-02', startsAt: `${daysAgo(6)} 10:15`, durationMinutes: 50, platform: 'educore-meet', status: 'completed', attendeeIds: ['stu-03', 'stu-04'], recordingUrl: 'https://mock.educore.local/rec/live-07' },
  { id: 'live-08', title: 'English: Debate preparation', subjectId: 'sub-03', classId: 'cls-02', teacherId: 'tch-03', startsAt: `${daysAhead(5)} 09:30`, durationMinutes: 45, platform: 'zoom', status: 'scheduled', attendeeIds: [], recordingUrl: null },
]
/* ---------- doubt forum ---------- */
export const doubtThreads: DoubtThread[] = [
  { id: 'dbt-01', title: 'How do I factorise when the leading coefficient is not 1?', body: 'I keep getting stuck with 6x² + 11x − 35. Can someone walk through the splitting method?', subjectId: 'sub-01', studentId: 'stu-02', teacherId: 'tch-01', status: 'answered', createdAt: `${daysAgo(2)} 16:20`, replies: [{ id: 'dbr-01', authorId: 'tch-01', authorRole: 'teacher', body: 'Split the middle term using the product/sum pair, then group the terms in pairs.', createdAt: `${daysAgo(2)} 17:05`, upvotes: 4 }] },
  { id: 'dbt-02', title: 'Why is acceleration negative during free fall?', body: 'If gravity always pulls down, why do we mark acceleration as negative?', subjectId: 'sub-02', studentId: 'stu-04', teacherId: 'tch-02', status: 'answered', createdAt: `${daysAgo(3)} 14:10`, replies: [{ id: 'dbr-02', authorId: 'tch-02', authorRole: 'teacher', body: 'It is a sign convention: choose up as positive and the downward pull becomes negative.', createdAt: `${daysAgo(3)} 15:02`, upvotes: 6 }] },
  { id: 'dbt-03', title: 'Difference between a simile and a metaphor?', body: 'Our worksheet has both and I keep mixing them up.', subjectId: 'sub-03', studentId: 'stu-07', teacherId: 'tch-03', status: 'answered', createdAt: `${daysAgo(5)} 11:40`, replies: [{ id: 'dbr-03', authorId: 'tch-03', authorRole: 'teacher', body: 'A simile compares using like/as; a metaphor states the comparison directly.', createdAt: `${daysAgo(5)} 12:15`, upvotes: 3 }, { id: 'dbr-04', authorId: 'stu-01', authorRole: 'student', body: 'The example sheet in the e-library helped me too.', createdAt: `${daysAgo(4)} 09:12`, upvotes: 2 }] },
  { id: 'dbt-04', title: 'Which dynasty built the Grand Trunk Road?', body: 'Our case study mentions two rulers and I am confused about the timeline.', subjectId: 'sub-04', studentId: 'stu-05', teacherId: 'tch-04', status: 'open', createdAt: `${daysAgo(1)} 18:05`, replies: [] },
  { id: 'dbt-05', title: 'How do loops stop in Python?', body: 'My while loop runs forever. What am I missing?', subjectId: 'sub-05', studentId: 'stu-09', teacherId: 'tch-05', status: 'answered', createdAt: `${daysAgo(2)} 19:30`, replies: [{ id: 'dbr-05', authorId: 'tch-05', authorRole: 'teacher', body: 'Make sure the condition variable changes inside the loop body.', createdAt: `${daysAgo(2)} 20:01`, upvotes: 5 }] },
  { id: 'dbt-06', title: 'Trigonometry identity proof help', body: 'I cannot get past step 3 of the identity proof from the midterm practice paper.', subjectId: 'sub-01', studentId: 'stu-01', teacherId: 'tch-01', status: 'open', createdAt: `${isoDate(TODAY)} 08:40`, replies: [{ id: 'dbr-06', authorId: 'stu-03', authorRole: 'student', body: 'Try converting everything to sine and cosine first — it worked for me.', createdAt: `${isoDate(TODAY)} 08:52`, upvotes: 1 }] },
  { id: 'dbt-07', title: 'Is the science practical graded?', body: 'Do the lab notebooks count towards the final score?', subjectId: 'sub-02', studentId: 'stu-06', teacherId: null, status: 'open', createdAt: `${isoDate(TODAY)} 09:15`, replies: [] },
  { id: 'dbt-08', title: 'Reading list for the literature circle', body: 'Which books are recommended for the September literature circle?', subjectId: 'sub-03', studentId: 'stu-08', teacherId: 'tch-03', status: 'closed', createdAt: `${daysAgo(9)} 15:44`, replies: [{ id: 'dbr-07', authorId: 'tch-03', authorRole: 'teacher', body: 'Start with the anthology in the e-library, then pick one contemporary novel.', createdAt: `${daysAgo(9)} 16:30`, upvotes: 7 }] },
]

/* ---------- lookup helpers shared by pages ---------- */
export const classNameOf = (classId: string) => schoolClasses.find((item) => item.id === classId)?.name ?? 'Unassigned'
export const subjectNameOf = (subjectId: string) => subjects.find((item) => item.id === subjectId)?.name ?? 'Unassigned'
export const sectionNameOf = (sectionId: string) => sections.find((item) => item.id === sectionId)?.name ?? '—'
export const studentsOfClass = (classId: string) => students.filter((student) => student.classId === classId)
export const studentById = (studentId: string) => students.find((student) => student.id === studentId)
export const teacherById = (teacherId: string) => teachers.find((teacher) => teacher.id === teacherId)
export const subjectById = (subjectId: string) => subjects.find((subject) => subject.id === subjectId)
export const marksOfStudent = (studentId: string) => marks.filter((mark) => mark.studentId === studentId)
export const attendanceOfStudent = (studentId: string) => attendance.filter((record) => record.studentId === studentId)
export function averagePercentOfStudent(studentId: string): number {
  const mine = marksOfStudent(studentId)
  if (mine.length === 0) return 0
  return round(mine.reduce((sum, mark) => sum + percentOf(mark), 0) / mine.length, 1)
}

