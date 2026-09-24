import { daysAgo, isoDate, TODAY } from './seed'
import type { BehaviorIncident, ChatbotConversation, FaceAttendanceSession, PlagiarismReport, Recommendation } from './types'

/* Advanced / AI module data — every screen built on this ships feature-toggled off. */
export const chatbotConversations: ChatbotConversation[] = [
  { id: 'cb-01', userId: 'gdn-01', userRole: 'parent', topic: 'Fee payment methods', startedAt: `${daysAgo(0)} 08:14`, turns: 6, resolved: true, satisfaction: 5, lastPrompt: 'Which payment methods are accepted for Term 2?' },
  { id: 'cb-02', userId: 'stu-02', userRole: 'student', topic: 'Quadratic equations', startedAt: `${daysAgo(0)} 19:22`, turns: 11, resolved: true, satisfaction: 4, lastPrompt: 'Can you show another example of splitting the middle term?' },
  { id: 'cb-03', userId: 'tch-03', userRole: 'teacher', topic: 'Rubric generation', startedAt: `${daysAgo(1)} 11:05`, turns: 4, resolved: false, satisfaction: 3, lastPrompt: 'Draft a rubric for a descriptive essay out of 20.' },
  { id: 'cb-04', userId: 'stu-07', userRole: 'student', topic: 'Timetable change request', startedAt: `${daysAgo(1)} 16:48`, turns: 3, resolved: false, satisfaction: 2, lastPrompt: 'Why did the Thursday science period move?' },
  { id: 'cb-05', userId: 'usr-principal', userRole: 'principal', topic: 'Attendance summary for grade 8', startedAt: `${daysAgo(2)} 09:31`, turns: 8, resolved: true, satisfaction: 5, lastPrompt: 'Summarise attendance defaulters in Grade 8B this month.' },
  { id: 'cb-06', userId: 'gdn-05', userRole: 'parent', topic: 'Transport route change', startedAt: `${daysAgo(3)} 07:52`, turns: 5, resolved: true, satisfaction: 4, lastPrompt: 'Which stop is closest to Lakeside Drive on RT-03?' },
  { id: 'cb-07', userId: 'stu-09', userRole: 'student', topic: 'Python loops', startedAt: `${daysAgo(4)} 20:10`, turns: 9, resolved: true, satisfaction: 5, lastPrompt: 'Explain while versus for loops with an example.' },
  { id: 'cb-08', userId: 'tch-05', userRole: 'teacher', topic: 'Quiz difficulty balance', startedAt: `${daysAgo(5)} 14:26`, turns: 7, resolved: false, satisfaction: 3, lastPrompt: 'Suggest a difficulty mix for a 25-mark MCQ quiz.' },
]

export const faceAttendanceSessions: FaceAttendanceSession[] = [
  { id: 'fa-01', label: 'Morning gate capture — Grade 10A', classId: 'cls-05', camera: 'Gate camera 01', capturedAt: `${daysAgo(0)} 08:05`, recognized: 2, unknown: 0, accuracy: 98.4, durationSeconds: 12, status: 'completed' },
  { id: 'fa-02', label: 'Classroom capture — Grade 9A', classId: 'cls-04', camera: 'Room R-201 camera', capturedAt: `${daysAgo(0)} 09:00`, recognized: 2, unknown: 1, accuracy: 91.2, durationSeconds: 18, status: 'review' },
  { id: 'fa-03', label: 'Classroom capture — Grade 8B', classId: 'cls-03', camera: 'Room R-103 camera', capturedAt: `${daysAgo(1)} 09:00`, recognized: 2, unknown: 0, accuracy: 96.7, durationSeconds: 14, status: 'completed' },
  { id: 'fa-04', label: 'Classroom capture — Grade 7A', classId: 'cls-02', camera: 'Room R-102 camera', capturedAt: `${daysAgo(2)} 09:05`, recognized: 1, unknown: 2, accuracy: 84.5, durationSeconds: 21, status: 'review' },
  { id: 'fa-05', label: 'Morning gate capture — Grade 6A', classId: 'cls-01', camera: 'Gate camera 02', capturedAt: `${daysAgo(3)} 08:10`, recognized: 2, unknown: 0, accuracy: 97.9, durationSeconds: 11, status: 'completed' },
  { id: 'fa-06', label: 'Afternoon capture — Grade 10A', classId: 'cls-05', camera: 'Room R-202 camera', capturedAt: `${daysAgo(4)} 13:40`, recognized: 2, unknown: 1, accuracy: 89.3, durationSeconds: 16, status: 'completed' },
]
export const plagiarismReports: PlagiarismReport[] = [
  { id: 'plg-01', submissionTitle: 'Coordinate geometry problem set', studentId: 'stu-02', assignmentId: 'asg-cls-05-sub-01', submittedAt: `${daysAgo(2)} 21:10`, similarityPercent: 68, matchedSource: 'Public worksheet archive (answer key)', status: 'flagged' },
  { id: 'plg-02', submissionTitle: 'Loops and conditionals practice', studentId: 'stu-09', assignmentId: 'asg-cls-01-sub-05', submittedAt: `${daysAgo(1)} 18:44`, similarityPercent: 12, matchedSource: 'Internal e-library sample code', status: 'clear' },
  { id: 'plg-03', submissionTitle: 'Descriptive essay — my city', studentId: 'stu-07', assignmentId: 'asg-cls-02-sub-03', submittedAt: `${daysAgo(3)} 20:05`, similarityPercent: 31, matchedSource: 'Essay blog published 2023', status: 'reviewing' },
  { id: 'plg-04', submissionTitle: 'Periodic table mind map', studentId: 'stu-06', assignmentId: 'asg-cls-03-sub-02', submittedAt: `${daysAgo(4)} 19:32`, similarityPercent: 74, matchedSource: 'Study platform infographic', status: 'flagged' },
  { id: 'plg-05', submissionTitle: 'Quadratic equations worksheet', studentId: 'stu-01', assignmentId: 'asg-cls-05-sub-01', submittedAt: `${daysAgo(2)} 17:48`, similarityPercent: 8, matchedSource: 'No significant match', status: 'clear' },
  { id: 'plg-06', submissionTitle: 'Map work: river systems', studentId: 'stu-05', assignmentId: 'asg-cls-03-sub-04', submittedAt: `${daysAgo(5)} 16:12`, similarityPercent: 22, matchedSource: 'Atlas scan (school copy)', status: 'reviewing' },
]

export const recommendations: Recommendation[] = [
  { id: 'rec-01', studentId: 'stu-04', type: 'remedial', title: 'Remedial block: algebra foundations', rationale: 'Attendance drop plus a 58% average across mathematics papers.', confidence: 92, generatedAt: daysAgo(1), accepted: false },
  { id: 'rec-02', studentId: 'stu-08', type: 'remedial', title: 'Catch-up schedule for missed labs', rationale: 'Four missed science practicals this term.', confidence: 88, generatedAt: daysAgo(1), accepted: true },
  { id: 'rec-03', studentId: 'stu-01', type: 'enrichment', title: 'Olympiad preparation track', rationale: 'Consistently above 90% with fast completion times.', confidence: 95, generatedAt: daysAgo(2), accepted: true },
  { id: 'rec-04', studentId: 'stu-07', type: 'resource', title: 'Advanced writing workshop', rationale: 'Top language score but limited exposure to creative formats.', confidence: 79, generatedAt: daysAgo(2), accepted: false },
  { id: 'rec-05', studentId: 'stu-02', type: 'remedial', title: 'Practice set: factorisation drills', rationale: 'Two consecutive low scores in algebra units.', confidence: 84, generatedAt: daysAgo(3), accepted: true },
  { id: 'rec-06', studentId: 'stu-10', type: 'career', title: 'Sports science pathway briefing', rationale: 'Strong athletics participation with steady academics.', confidence: 76, generatedAt: daysAgo(3), accepted: false },
  { id: 'rec-07', studentId: 'stu-06', type: 'enrichment', title: 'Peer tutoring role in science', rationale: 'High engagement in practicals, confidence needs building.', confidence: 81, generatedAt: daysAgo(4), accepted: true },
  { id: 'rec-08', studentId: 'stu-09', type: 'career', title: 'Junior coding mentorship', rationale: 'Consistent strength in computer science assessments.', confidence: 87, generatedAt: daysAgo(5), accepted: false },
]
export const behaviorIncidents: BehaviorIncident[] = [
  { id: 'bhi-01', studentId: 'stu-01', recordedBy: 'tch-01', category: 'merit', points: 5, notes: 'Led the peer revision session for the whole class.', occurredAt: daysAgo(1), followUp: 'none' },
  { id: 'bhi-02', studentId: 'stu-04', recordedBy: 'tch-03', category: 'punctuality', points: -2, notes: 'Late to first period for the third time this fortnight.', occurredAt: daysAgo(2), followUp: 'parent_call' },
  { id: 'bhi-03', studentId: 'stu-06', recordedBy: 'tch-02', category: 'disruption', points: -3, notes: 'Repeatedly talking during the laboratory briefing.', occurredAt: daysAgo(3), followUp: 'counselling' },
  { id: 'bhi-04', studentId: 'stu-09', recordedBy: 'tch-05', category: 'positive', points: 3, notes: 'Helped a classmate debug their project during break.', occurredAt: daysAgo(4), followUp: 'none' },
  { id: 'bhi-05', studentId: 'stu-02', recordedBy: 'tch-04', category: 'disruption', points: -2, notes: 'Unapproved use of a mobile device during class.', occurredAt: daysAgo(5), followUp: 'detention' },
  { id: 'bhi-06', studentId: 'stu-07', recordedBy: 'tch-03', category: 'merit', points: 4, notes: 'Won the inter-house debate round.', occurredAt: daysAgo(6), followUp: 'none' },
  { id: 'bhi-07', studentId: 'stu-08', recordedBy: 'tch-04', category: 'bullying', points: -5, notes: 'Reported exclusion of a peer during a group activity.', occurredAt: daysAgo(7), followUp: 'counselling' },
  { id: 'bhi-08', studentId: 'stu-10', recordedBy: 'tch-02', category: 'positive', points: 4, notes: 'Represented the institution at the district athletics meet.', occurredAt: daysAgo(8), followUp: 'none' },
  { id: 'bhi-09', studentId: 'stu-03', recordedBy: 'tch-01', category: 'merit', points: 3, notes: 'Volunteered to mentor a junior student in mathematics.', occurredAt: daysAgo(9), followUp: 'none' },
  { id: 'bhi-10', studentId: 'stu-05', recordedBy: 'tch-02', category: 'punctuality', points: -1, notes: 'Arrived late after the transport delay on RT-03.', occurredAt: daysAgo(10), followUp: 'none' },
]

export const behaviorSummary = () => ({
  positivePoints: behaviorIncidents.filter((incident) => incident.points > 0).reduce((sum, incident) => sum + incident.points, 0),
  negativePoints: behaviorIncidents.filter((incident) => incident.points < 0).reduce((sum, incident) => sum + incident.points, 0),
  followUps: behaviorIncidents.filter((incident) => incident.followUp !== 'none').length,
  window: `${daysAgo(30)} to ${isoDate(TODAY)}`,
})

export const chatbotSummary = () => ({
  total: chatbotConversations.length,
  resolved: chatbotConversations.filter((conversation) => conversation.resolved).length,
  averageTurns: Number((chatbotConversations.reduce((sum, conversation) => sum + conversation.turns, 0) / chatbotConversations.length).toFixed(1)),
  averageSatisfaction: Number((chatbotConversations.reduce((sum, conversation) => sum + conversation.satisfaction, 0) / chatbotConversations.length).toFixed(1)),
})
