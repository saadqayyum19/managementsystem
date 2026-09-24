import { schoolClasses, studentsOfClass } from './academics'
import { students, teachers } from './people'
import { daysAgo, daysAhead, isoDate, randomInt, TODAY } from './seed'
import type { Holiday, HostelBlock, InventoryItem, LeaveRequest, LibraryIssue, SchoolEvent, TransportRoute, WorkspaceTask } from './types'

/* ---------- leave management ---------- */
export const leaveRequests: LeaveRequest[] = [
  { id: 'lv-01', applicantId: 'tch-02', applicantRole: 'teacher', type: 'sick', from: daysAgo(2), to: daysAgo(1), days: 2, reason: 'Viral fever, doctor advised rest.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(3) },
  { id: 'lv-02', applicantId: 'stu-04', applicantRole: 'student', type: 'sick', from: daysAhead(1), to: daysAhead(3), days: 3, reason: 'Recovering from a fracture, physiotherapy sessions.', status: 'pending', approverId: null, appliedOn: daysAgo(1) },
  { id: 'lv-03', applicantId: 'tch-03', applicantRole: 'teacher', type: 'casual', from: daysAhead(6), to: daysAhead(6), days: 1, reason: 'Family commitment out of town.', status: 'pending', approverId: null, appliedOn: isoDate(TODAY) },
  { id: 'lv-04', applicantId: 'stu-08', applicantRole: 'student', type: 'casual', from: daysAgo(5), to: daysAgo(5), days: 1, reason: 'Passport appointment.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(7) },
  { id: 'lv-05', applicantId: 'tch-05', applicantRole: 'teacher', type: 'annual', from: daysAhead(14), to: daysAhead(21), days: 8, reason: 'Annual vacation with family.', status: 'pending', approverId: null, appliedOn: daysAgo(2) },
  { id: 'lv-06', applicantId: 'stu-06', applicantRole: 'student', type: 'sick', from: daysAgo(9), to: daysAgo(8), days: 2, reason: 'Dental procedure.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(10) },
  { id: 'lv-07', applicantId: 'stu-02', applicantRole: 'student', type: 'casual', from: daysAgo(12), to: daysAgo(11), days: 2, reason: 'Cousin wedding in another city.', status: 'rejected', approverId: 'usr-principal', appliedOn: daysAgo(14) },
  { id: 'lv-08', applicantId: 'tch-01', applicantRole: 'teacher', type: 'casual', from: daysAhead(3), to: daysAhead(3), days: 1, reason: 'Parent-teacher council briefing.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(1) },
  { id: 'lv-09', applicantId: 'stu-09', applicantRole: 'student', type: 'sick', from: daysAgo(4), to: daysAgo(4), days: 1, reason: 'Seasonal cold.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(5) },
  { id: 'lv-10', applicantId: 'tch-04', applicantRole: 'teacher', type: 'maternity', from: daysAhead(20), to: daysAhead(110), days: 90, reason: 'Statutory maternity leave.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(8) },
  { id: 'lv-11', applicantId: 'stu-10', applicantRole: 'student', type: 'casual', from: daysAhead(2), to: daysAhead(2), days: 1, reason: 'State athletics trial.', status: 'pending', approverId: null, appliedOn: isoDate(TODAY) },
  { id: 'lv-12', applicantId: 'stu-03', applicantRole: 'student', type: 'sick', from: daysAgo(16), to: daysAgo(14), days: 3, reason: 'Weather-related asthma flare-up.', status: 'approved', approverId: 'usr-principal', appliedOn: daysAgo(17) },
]

/* ---------- holiday calendar ---------- */
export const holidays: Holiday[] = [
  { id: 'hol-01', name: `Founder's Day`, date: daysAhead(6), type: 'institutional', description: 'Assembly, alumni talks and inter-house quiz finals.' },
  { id: 'hol-02', name: 'Autumn Break', date: daysAhead(18), type: 'vacation', description: 'Institution closed for the mid-term autumn break.' },
  { id: 'hol-03', name: 'National Unity Day', date: daysAhead(32), type: 'national', description: 'Civic assembly and pledge ceremony.' },
  { id: 'hol-04', name: 'Lantern Festival', date: daysAhead(41), type: 'festival', description: 'Cultural evening hosted by the arts department.' },
  { id: 'hol-05', name: 'Science Exhibition Day', date: daysAhead(55), type: 'institutional', description: 'Open campus exhibition for parents and partners.' },
  { id: 'hol-06', name: 'Winter Vacation', date: daysAhead(72), type: 'vacation', description: 'Two-week winter break for all grades.' },
  { id: 'hol-07', name: 'Republic Observance', date: daysAhead(88), type: 'national', description: 'Parade and prize distribution.' },
  { id: 'hol-08', name: 'Reading Week', date: daysAhead(96), type: 'institutional', description: 'Library-led reading marathon across grades.' },
  { id: 'hol-09', name: 'Staff Development Day', date: daysAhead(110), type: 'institutional', description: 'No classes — faculty training workshops.' },
  { id: 'hol-10', name: 'Harvest Festival', date: daysAgo(24), type: 'festival', description: 'Community fair held earlier this term.' },
]
/* ---------- hostels ---------- */
const hostelAssignments = students.filter((student) => student.hostelBlockId)
export const hostelBlocks: HostelBlock[] = [
  { id: 'hst-01', name: 'Aurora Boys Hostel', wardenId: 'tch-04', type: 'boys', rooms: [1, 2, 3].map((floor) => ({ id: `room-b${floor}1`, number: `B-${floor}01`, floor, capacity: 4, occupantIds: floor === 1 ? hostelAssignments.filter((student) => student.gender === 'male').map((student) => student.id) : [] })) },
  { id: 'hst-02', name: 'Cobalt Girls Hostel', wardenId: 'tch-03', type: 'girls', rooms: [1, 2].map((floor) => ({ id: `room-g${floor}1`, number: `G-${floor}01`, floor, capacity: 4, occupantIds: [] })) },
]

/* ---------- library circulation ---------- */
export const libraryIssues: LibraryIssue[] = [
  { id: 'iss-01', resourceId: 'lib-02', memberId: 'stu-01', memberRole: 'student', issuedOn: daysAgo(9), dueOn: daysAgo(2), returnedOn: null, fine: 40, status: 'overdue' },
  { id: 'iss-02', resourceId: 'lib-05', memberId: 'stu-09', memberRole: 'student', issuedOn: daysAgo(12), dueOn: daysAgo(5), returnedOn: daysAgo(6), fine: 0, status: 'returned' },
  { id: 'iss-03', resourceId: 'lib-01', memberId: 'tch-01', memberRole: 'teacher', issuedOn: daysAgo(20), dueOn: daysAgo(6), returnedOn: daysAgo(7), fine: 0, status: 'returned' },
  { id: 'iss-04', resourceId: 'lib-03', memberId: 'stu-07', memberRole: 'student', issuedOn: daysAgo(4), dueOn: daysAhead(10), returnedOn: null, fine: 0, status: 'issued' },
  { id: 'iss-05', resourceId: 'lib-07', memberId: 'stu-02', memberRole: 'student', issuedOn: daysAgo(6), dueOn: daysAgo(1), returnedOn: null, fine: 20, status: 'overdue' },
  { id: 'iss-06', resourceId: 'lib-11', memberId: 'tch-05', memberRole: 'teacher', issuedOn: daysAgo(3), dueOn: daysAhead(11), returnedOn: null, fine: 0, status: 'issued' },
  { id: 'iss-07', resourceId: 'lib-04', memberId: 'stu-05', memberRole: 'student', issuedOn: daysAgo(15), dueOn: daysAgo(8), returnedOn: daysAgo(8), fine: 0, status: 'returned' },
  { id: 'iss-08', resourceId: 'lib-08', memberId: 'stu-03', memberRole: 'student', issuedOn: daysAgo(2), dueOn: daysAhead(12), returnedOn: null, fine: 0, status: 'issued' },
  { id: 'iss-09', resourceId: 'lib-06', memberId: 'tch-02', memberRole: 'teacher', issuedOn: daysAgo(11), dueOn: daysAgo(4), returnedOn: daysAgo(3), fine: 0, status: 'returned' },
  { id: 'iss-10', resourceId: 'lib-10', memberId: 'stu-06', memberRole: 'student', issuedOn: daysAgo(7), dueOn: daysAgo(3), returnedOn: null, fine: 15, status: 'overdue' },
]

/* ---------- inventory ---------- */
export const inventoryItems: InventoryItem[] = [
  { id: 'inv-01', name: 'Compound microscope', category: 'lab', quantity: 24, unit: 'units', location: 'Science Lab 01', vendor: 'Optica Supplies', purchasedOn: daysAgo(400), unitCost: 320, condition: 'good', reorderLevel: 10 },
  { id: 'inv-02', name: 'Bunsen burner', category: 'lab', quantity: 30, unit: 'units', location: 'Science Lab 02', vendor: 'LabPros', purchasedOn: daysAgo(360), unitCost: 45, condition: 'good', reorderLevel: 12 },
  { id: 'inv-03', name: 'Cricket kit (senior)', category: 'sports', quantity: 6, unit: 'kits', location: 'Sports Store', vendor: 'PlayField Co', purchasedOn: daysAgo(210), unitCost: 260, condition: 'good', reorderLevel: 4 },
  { id: 'inv-04', name: 'Basketball', category: 'sports', quantity: 18, unit: 'units', location: 'Sports Store', vendor: 'PlayField Co', purchasedOn: daysAgo(180), unitCost: 32, condition: 'new', reorderLevel: 10 },
  { id: 'inv-05', name: 'Student desk', category: 'furniture', quantity: 320, unit: 'units', location: 'All classrooms', vendor: 'WoodWorks', purchasedOn: daysAgo(700), unitCost: 78, condition: 'good', reorderLevel: 40 },
  { id: 'inv-06', name: 'Teacher chair', category: 'furniture', quantity: 42, unit: 'units', location: 'All classrooms', vendor: 'WoodWorks', purchasedOn: daysAgo(690), unitCost: 96, condition: 'repair', reorderLevel: 10 },
  { id: 'inv-07', name: 'Laptop cart (30 devices)', category: 'it', quantity: 3, unit: 'carts', location: 'IT Store', vendor: 'ByteTech', purchasedOn: daysAgo(320), unitCost: 14500, condition: 'good', reorderLevel: 1 },
  { id: 'inv-08', name: 'Interactive projector', category: 'it', quantity: 12, unit: 'units', location: 'Smart classrooms', vendor: 'ByteTech', purchasedOn: daysAgo(280), unitCost: 890, condition: 'good', reorderLevel: 4 },
  { id: 'inv-09', name: 'Network switch (48 port)', category: 'it', quantity: 4, unit: 'units', location: 'Server room', vendor: 'ByteTech', purchasedOn: daysAgo(520), unitCost: 410, condition: 'good', reorderLevel: 2 },
  { id: 'inv-10', name: 'A4 paper ream', category: 'stationery', quantity: 48, unit: 'reams', location: 'Admin store', vendor: 'Paperly', purchasedOn: daysAgo(20), unitCost: 6, condition: 'new', reorderLevel: 60 },
  { id: 'inv-11', name: 'Whiteboard marker set', category: 'stationery', quantity: 90, unit: 'sets', location: 'Admin store', vendor: 'Paperly', purchasedOn: daysAgo(34), unitCost: 4, condition: 'new', reorderLevel: 70 },
  { id: 'inv-12', name: 'Chemistry glassware set', category: 'lab', quantity: 40, unit: 'sets', location: 'Science Lab 01', vendor: 'LabPros', purchasedOn: daysAgo(150), unitCost: 58, condition: 'good', reorderLevel: 20 },
  { id: 'inv-13', name: 'Table tennis table', category: 'sports', quantity: 4, unit: 'units', location: 'Indoor Hall', vendor: 'PlayField Co', purchasedOn: daysAgo(240), unitCost: 480, condition: 'good', reorderLevel: 2 },
  { id: 'inv-14', name: 'Library reading chair', category: 'furniture', quantity: 26, unit: 'units', location: 'Library', vendor: 'WoodWorks', purchasedOn: daysAgo(610), unitCost: 88, condition: 'retired', reorderLevel: 8 },
]
/* ---------- events ---------- */
export const schoolEvents: SchoolEvent[] = [
  { id: 'evt-01', title: 'Inter-house athletics meet', category: 'sports', startsAt: `${daysAhead(4)} 08:00`, endsAt: `${daysAhead(4)} 16:00`, venue: 'Main ground', organizerId: 'tch-02', expectedParticipants: 240, status: 'upcoming', budget: 4200 },
  { id: 'evt-02', title: 'Science exhibition', category: 'academic', startsAt: `${daysAhead(9)} 09:30`, endsAt: `${daysAhead(9)} 15:00`, venue: 'Science block', organizerId: 'tch-02', expectedParticipants: 180, status: 'upcoming', budget: 3100 },
  { id: 'evt-03', title: 'Parent-teacher conference', category: 'meeting', startsAt: `${daysAhead(2)} 10:00`, endsAt: `${daysAhead(2)} 14:00`, venue: 'Auditorium', organizerId: 'usr-principal', expectedParticipants: 320, status: 'upcoming', budget: 900 },
  { id: 'evt-04', title: 'Autumn cultural evening', category: 'cultural', startsAt: `${daysAhead(16)} 17:00`, endsAt: `${daysAhead(16)} 21:00`, venue: 'Open amphitheatre', organizerId: 'tch-03', expectedParticipants: 400, status: 'upcoming', budget: 5600 },
  { id: 'evt-05', title: 'Coding marathon', category: 'academic', startsAt: `${isoDate(TODAY)} 09:00`, endsAt: `${isoDate(TODAY)} 18:00`, venue: 'Computer lab', organizerId: 'tch-05', expectedParticipants: 90, status: 'ongoing', budget: 1200 },
  { id: 'evt-06', title: 'Library reading week launch', category: 'academic', startsAt: `${daysAgo(3)} 09:00`, endsAt: `${daysAgo(3)} 11:00`, venue: 'Library', organizerId: 'tch-04', expectedParticipants: 120, status: 'completed', budget: 400 },
  { id: 'evt-07', title: 'Football league finals', category: 'sports', startsAt: `${daysAgo(6)} 15:00`, endsAt: `${daysAgo(6)} 18:00`, venue: 'Main ground', organizerId: 'tch-02', expectedParticipants: 200, status: 'completed', budget: 1500 },
  { id: 'evt-08', title: 'Staff strategy retreat', category: 'meeting', startsAt: `${daysAhead(23)} 09:00`, endsAt: `${daysAhead(24)} 17:00`, venue: 'Conference hall', organizerId: 'usr-principal', expectedParticipants: 60, status: 'upcoming', budget: 7400 },
]

/* ---------- transport ---------- */
export const transportRoutes: TransportRoute[] = [
  { id: 'rt-01', name: 'Harbourside — Maple loop', code: 'RT-01', driverName: 'Samuel Adeyemi', driverPhone: '+1 415 555 0701', vehicleNo: 'WB-BUS-01', capacity: 40, assignedStudentIds: students.filter((student) => student.transportRouteId === 'rt-01').map((student) => student.id), stops: ['Harbourside Lane', 'Maple Crescent', 'Orchid Road', 'Campus gate'], morningDeparture: '07:05', eveningDeparture: '15:45', status: 'active' },
  { id: 'rt-02', name: 'Rosewood — Lakeside loop', code: 'RT-02', driverName: 'Marcus Alvarez', driverPhone: '+1 415 555 0702', vehicleNo: 'WB-BUS-02', capacity: 40, assignedStudentIds: students.filter((student) => student.transportRouteId === 'rt-02').map((student) => student.id), stops: ['Rosewood Street', 'Greenfield Avenue', 'Bellflower Way', 'Campus gate'], morningDeparture: '06:55', eveningDeparture: '15:45', status: 'active' },
  { id: 'rt-03', name: 'Sunridge — Ashgrove loop', code: 'RT-03', driverName: 'Peter Nkemdirim', driverPhone: '+1 415 555 0703', vehicleNo: 'WB-BUS-03', capacity: 36, assignedStudentIds: students.filter((student) => student.transportRouteId === 'rt-03').map((student) => student.id), stops: ['Sunridge Street', 'Ashgrove Terrace', 'Lakeside Drive', 'Campus gate'], morningDeparture: '07:10', eveningDeparture: '16:00', status: 'maintenance' },
]

/* ---------- teacher workspace ---------- */
export const workspaceTasks: WorkspaceTask[] = teachers.flatMap((teacher, index) => [
  { id: `task-${teacher.id}-1`, teacherId: teacher.id, title: `Update mark sheet for ${schoolClasses[index % schoolClasses.length].name}`, module: 'Examinations', dueDate: daysAhead(1 + index), priority: 'high', done: index % 2 === 0 },
  { id: `task-${teacher.id}-2`, teacherId: teacher.id, title: `Reply to pending doubt threads`, module: 'Doubt Forum', dueDate: daysAhead(2 + index), priority: 'normal', done: index % 3 === 0 },
  { id: `task-${teacher.id}-3`, teacherId: teacher.id, title: `Prepare quiz questions for next week`, module: 'Quiz & Online Exams', dueDate: daysAhead(5 + index), priority: index === 2 ? 'low' : 'normal', done: false },
  { id: `task-${teacher.id}-4`, teacherId: teacher.id, title: `Approve late submissions`, module: 'Learning & Assignments', dueDate: daysAgo(1 + index), priority: 'high', done: true },
])

export const classStudentIds = (classId: string) => studentsOfClass(classId).map((student) => student.id)
export const randomViolations = () => randomInt(0, 3)
