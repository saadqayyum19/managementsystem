import { schoolClasses } from './academics'
import { students, teachers } from './people'
import { studentProfiles } from './profiles'
import { daysAgo, isoDate, rng, round, TODAY } from './seed'
import type { Expense, FeeInvoice, FeeItem, FeePayment, SalarySlip, Scholarship } from './types'

const termItems = (grade: number): FeeItem[] => [
  { label: 'Tuition fee', amount: 900 + grade * 60 },
  { label: 'Transport', amount: 120 },
  { label: 'Library & laboratories', amount: 80 },
  { label: 'Examination fee', amount: 60 },
]

const paymentMethods: FeePayment['method'][] = ['card', 'upi', 'bank', 'cash']

/** Invoices are generated from each student's fee behaviour, so fee status matches everywhere. */
export const feeInvoices: FeeInvoice[] = students.flatMap((student, studentIndex) => (['Term 1', 'Term 2'] as const).map((term, termIndex) => {
  const profile = studentProfiles.find((item) => item.studentId === student.id)!
  const grade = schoolClasses.find((item) => item.id === student.classId)?.grade ?? 6
  const items = termItems(grade)
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const discountPercent = student.id === 'stu-10' ? 25 : 0
  const payable = Math.round(total * (1 - discountPercent / 100))
  const behaviour: FeeInvoice['status'] = termIndex === 0 ? 'paid' : profile.feeBehaviour
  const payments: FeePayment[] = behaviour === 'paid'
    ? [{ id: `pay-${student.id}-${termIndex}`, amount: payable, paidOn: daysAgo(70 - studentIndex * 2), method: paymentMethods[studentIndex % paymentMethods.length], reference: `TXN-${9000 + studentIndex * 7 + termIndex}` }]
    : behaviour === 'partial'
      ? [{ id: `pay-${student.id}-${termIndex}`, amount: Math.round(payable * 0.5), paidOn: daysAgo(28 - studentIndex), method: 'upi', reference: `TXN-${7000 + studentIndex * 5}` }]
      : []
  return {
    id: `inv-${student.id}-${termIndex + 1}`,
    invoiceNo: `WB/${term.replace(' ', '')}/${student.admissionNo.slice(-3)}${termIndex + 1}`,
    studentId: student.id,
    classId: student.classId,
    term,
    items,
    total: payable,
    dueDate: daysAgo(termIndex === 0 ? 45 : 8),
    issuedOn: daysAgo(termIndex === 0 ? 75 : 30),
    status: behaviour,
    payments,
    discountPercent,
  }
}))

export const paidAmountOf = (invoice: FeeInvoice) => invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
export const dueAmountOf = (invoice: FeeInvoice) => Math.max(0, invoice.total - paidAmountOf(invoice))
export const invoiceByStudent = (studentId: string) => feeInvoices.filter((invoice) => invoice.studentId === studentId)

export function feeStatusOfStudent(studentId: string): FeeInvoice['status'] {
  const mine = invoiceByStudent(studentId)
  if (mine.some((invoice) => invoice.status === 'overdue')) return 'overdue'
  if (mine.some((invoice) => invoice.status === 'partial')) return 'partial'
  return 'paid'
}

export function feeTotals() {
  const billed = feeInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const collected = feeInvoices.reduce((sum, invoice) => sum + paidAmountOf(invoice), 0)
  return { billed, collected, outstanding: billed - collected, collectionRate: billed === 0 ? 0 : round((collected / billed) * 100, 1), overdueCount: feeInvoices.filter((invoice) => invoice.status === 'overdue').length }
}
/* ---------- salary & payroll ---------- */
export const payrollMonths = ['Jul 2026', 'Aug 2026', 'Sep 2026']

const payrollEntities = [...teachers.map((teacher) => ({ id: teacher.id, monthly: 3200 + teacher.weeklyPeriods * 45 })), { id: 'usr-principal', monthly: 6200 }, { id: 'usr-superadmin', monthly: 7100 }]

export const salarySlips: SalarySlip[] = payrollEntities.flatMap((entity, index) => payrollMonths.map((month, monthIndex) => {
  const basic = Math.round(entity.monthly * 0.7)
  const allowances = entity.monthly - basic
  const deductions = Math.round(entity.monthly * 0.09)
  const processed = monthIndex < 2 || index % 4 !== 0
  const status: SalarySlip['status'] = processed ? (index === 3 && monthIndex === 1 ? 'on_hold' : 'processed') : 'pending'
  return {
    id: `sal-${entity.id}-${monthIndex}`,
    staffId: entity.id,
    month,
    basic,
    allowances,
    deductions,
    netPay: basic + allowances - deductions,
    status,
    processedOn: processed ? `${daysAgo(85 - monthIndex * 30)} 11:30` : null,
    bankAccount: `**** ${4100 + index * 13}`,
  }
}))

export const payrollTotals = () => {
  const latest = salarySlips.filter((slip) => slip.month === payrollMonths[2])
  const gross = latest.reduce((sum, slip) => sum + slip.basic + slip.allowances, 0)
  const net = latest.reduce((sum, slip) => sum + slip.netPay, 0)
  return { gross, net, deductions: gross - net, pending: latest.filter((slip) => slip.status !== 'processed').length, headcount: latest.length }
}

/* ---------- expense tracker ---------- */
export const expenses: Expense[] = [
  { id: 'exp-01', category: 'utilities', description: 'Electricity bill — September', amount: 2480, spentOn: daysAgo(4), vendor: 'CityGrid Utilities', approvedBy: 'usr-superadmin', status: 'approved' },
  { id: 'exp-02', category: 'maintenance', description: 'Classroom repainting (Block B)', amount: 1860, spentOn: daysAgo(9), vendor: 'BrightWalls Co', approvedBy: 'usr-principal', status: 'approved' },
  { id: 'exp-03', category: 'supplies', description: 'Laboratory consumables restock', amount: 940, spentOn: daysAgo(12), vendor: 'LabPros', approvedBy: 'usr-principal', status: 'approved' },
  { id: 'exp-04', category: 'it', description: 'Campus Wi-Fi access point upgrade', amount: 3200, spentOn: daysAgo(15), vendor: 'ByteTech', approvedBy: 'usr-superadmin', status: 'approved' },
  { id: 'exp-05', category: 'transport', description: 'Bus fleet servicing', amount: 1450, spentOn: daysAgo(18), vendor: 'FleetCare Garage', approvedBy: 'usr-superadmin', status: 'approved' },
  { id: 'exp-06', category: 'events', description: 'Athletics meet equipment', amount: 780, spentOn: daysAgo(3), vendor: 'PlayField Co', approvedBy: null, status: 'pending' },
  { id: 'exp-07', category: 'supplies', description: 'Stationery bulk order', amount: 620, spentOn: daysAgo(6), vendor: 'Paperly', approvedBy: 'usr-principal', status: 'approved' },
  { id: 'exp-08', category: 'utilities', description: 'Water tanker supply', amount: 310, spentOn: daysAgo(7), vendor: 'AquaFlow', approvedBy: 'usr-principal', status: 'approved' },
  { id: 'exp-09', category: 'it', description: 'Learning platform add-on licences', amount: 2150, spentOn: daysAgo(21), vendor: 'EduSoft', approvedBy: 'usr-superadmin', status: 'approved' },
  { id: 'exp-10', category: 'events', description: 'Cultural evening stage lighting', amount: 1680, spentOn: daysAgo(2), vendor: 'StageCraft', approvedBy: null, status: 'pending' },
  { id: 'exp-11', category: 'maintenance', description: 'Broken furniture repair', amount: 540, spentOn: daysAgo(11), vendor: 'WoodWorks', approvedBy: 'usr-principal', status: 'approved' },
  { id: 'exp-12', category: 'transport', description: 'GPS tracker subscription renewal', amount: 690, spentOn: daysAgo(26), vendor: 'FleetCare Garage', approvedBy: null, status: 'rejected' },
]
export const expenseTotals = () => ({
  total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
  approved: expenses.filter((expense) => expense.status === 'approved').reduce((sum, expense) => sum + expense.amount, 0),
  pending: expenses.filter((expense) => expense.status === 'pending').length,
  rejected: expenses.filter((expense) => expense.status === 'rejected').reduce((sum, expense) => sum + expense.amount, 0),
})

/* ---------- scholarships ---------- */
export const scholarships: Scholarship[] = [
  { id: 'sch-01', name: 'Academic Merit Scholarship', type: 'merit', coveragePercent: 40, amount: 2400, criteria: 'Consistent grade average above 85% across two terms.', status: 'active', applications: [{ studentId: 'stu-01', status: 'awarded', score: 92 }, { studentId: 'stu-07', status: 'awarded', score: 90 }, { studentId: 'stu-03', status: 'shortlisted', score: 86 }, { studentId: 'stu-05', status: 'applied', score: 81 }] },
  { id: 'sch-02', name: 'Sports Excellence Grant', type: 'sports', coveragePercent: 30, amount: 1800, criteria: 'State-level participation in a recognised sport.', status: 'active', applications: [{ studentId: 'stu-10', status: 'shortlisted', score: 78 }, { studentId: 'stu-06', status: 'applied', score: 69 }, { studentId: 'stu-08', status: 'rejected', score: 60 }] },
  { id: 'sch-03', name: 'Need-based Support Fund', type: 'need', coveragePercent: 60, amount: 3600, criteria: 'Household income verification and attendance above 80%.', status: 'active', applications: [{ studentId: 'stu-04', status: 'applied', score: 58 }, { studentId: 'stu-08', status: 'applied', score: 63 }, { studentId: 'stu-06', status: 'shortlisted', score: 69 }] },
  { id: 'sch-04', name: 'Arts & Culture Award', type: 'arts', coveragePercent: 25, amount: 1500, criteria: 'Portfolio review by the arts department.', status: 'closed', applications: [{ studentId: 'stu-09', status: 'awarded', score: 88 }, { studentId: 'stu-05', status: 'rejected', score: 71 }] },
]

export const scholarshipTotals = () => ({
  active: scholarships.filter((scholarship) => scholarship.status === 'active').length,
  awarded: scholarships.reduce((sum, scholarship) => sum + scholarship.applications.filter((application) => application.status === 'awarded').length, 0),
  committed: scholarships.reduce((sum, scholarship) => sum + scholarship.applications.filter((application) => application.status === 'awarded').length * scholarship.amount, 0),
})

/** Collection performance vs target per month, used by the finance charts. */
export const collectionTrend = payrollMonths.map((month, index) => ({ month: month.split(' ')[0], collected: Math.round(58000 + rng() * 26000), target: 82000 + index * 1500 }))
export const expenseBreakdown = (['maintenance', 'utilities', 'supplies', 'events', 'transport', 'it'] as const).map((category) => ({ category, amount: expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0) }))
export const refreshedOn = isoDate(TODAY)
