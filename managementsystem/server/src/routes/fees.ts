import { Router } from 'express'
import { authenticate, requireRoles } from '../middleware/auth.js'
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getInvoices,
  getInvoiceById,
  createInvoice,
  getPayments,
  createPayment,
  getSalaries,
  createSalary,
  getExpenses,
  createExpense,
  getScholarships,
  createScholarship,
  getFinanceStats,
} from '../controllers/fees.js'

export const feesRouter = Router()

feesRouter.use(authenticate)

// Financial Stats
feesRouter.get('/stats', requireRoles('super_admin', 'principal'), getFinanceStats)

// Structures
feesRouter.get('/structures', getFeeStructures)
feesRouter.post('/structures', requireRoles('super_admin', 'principal'), createFeeStructure)
feesRouter.put('/structures/:id', requireRoles('super_admin', 'principal'), updateFeeStructure)
feesRouter.delete('/structures/:id', requireRoles('super_admin', 'principal'), deleteFeeStructure)

// Invoices
feesRouter.get('/invoices', getInvoices)
feesRouter.get('/invoices/:id', getInvoiceById)
feesRouter.post('/invoices', requireRoles('super_admin', 'principal'), createInvoice)

// Payments
feesRouter.get('/payments', getPayments)
feesRouter.post('/payments', requireRoles('super_admin', 'principal'), createPayment)

// Salaries
feesRouter.get('/salaries', requireRoles('super_admin', 'principal'), getSalaries)
feesRouter.post('/salaries', requireRoles('super_admin', 'principal'), createSalary)

// Expenses
feesRouter.get('/expenses', requireRoles('super_admin', 'principal'), getExpenses)
feesRouter.post('/expenses', requireRoles('super_admin', 'principal'), createExpense)

// Scholarships
feesRouter.get('/scholarships', getScholarships)
feesRouter.post('/scholarships', requireRoles('super_admin', 'principal'), createScholarship)
