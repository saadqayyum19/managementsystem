import type { Request, Response } from 'express'
import { FeeStructure } from '../models/FeeStructure.js'
import { Invoice } from '../models/Invoice.js'
import { FeePayment } from '../models/FeePayment.js'
import { Salary } from '../models/Salary.js'
import { Expense } from '../models/Expense.js'
import { Scholarship } from '../models/Scholarship.js'
import { AppError, asyncHandler } from '../utils/errors.js'

// --- Fee Structures ---
export const getFeeStructures = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, search, type, frequency } = req.query

  const query: any = { institutionId }
  if (type) query.type = type
  if (frequency) query.frequency = frequency
  if (search) query.name = { $regex: String(search), $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [structures, total] = await Promise.all([
    FeeStructure.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    FeeStructure.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: structures,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const structure = await FeeStructure.create({ ...req.body, institutionId })
  res.status(201).json({ success: true, data: structure, message: 'Fee structure created successfully' })
})

export const updateFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const structure = await FeeStructure.findOneAndUpdate(
    { _id: id, institutionId: req.auth!.institutionId },
    req.body,
    { new: true }
  )
  if (!structure) throw new AppError('Fee structure not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: structure, message: 'Fee structure updated successfully' })
})

export const deleteFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const deleted = await FeeStructure.findOneAndDelete({ _id: id, institutionId: req.auth!.institutionId })
  if (!deleted) throw new AppError('Fee structure not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: deleted, message: 'Fee structure deleted successfully' })
})

// --- Invoices ---
export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, search, status, studentId } = req.query

  const query: any = { institutionId }
  if (status) query.status = status
  if (studentId) query.studentId = studentId
  if (search) query.invoiceNumber = { $regex: String(search), $options: 'i' }

  // If student or parent, restrict to their own records
  if (req.auth!.role === 'student') {
    query.studentId = req.auth!.userId
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .populate('studentId', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Invoice.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const invoice = await Invoice.findOne({ _id: id, institutionId: req.auth!.institutionId })
    .populate('studentId', 'firstName lastName email')
  if (!invoice) throw new AppError('Invoice not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: invoice })
})

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const invoiceNumber = req.body.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`
  const invoice = await Invoice.create({ ...req.body, invoiceNumber, institutionId })
  res.status(201).json({ success: true, data: invoice, message: 'Invoice generated successfully' })
})

// --- Payments ---
export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, status, studentId, search } = req.query

  const query: any = { institutionId }
  if (status) query.status = status
  if (studentId) query.studentId = studentId
  if (search) query.receiptNumber = { $regex: String(search), $options: 'i' }

  if (req.auth!.role === 'student') {
    query.studentId = req.auth!.userId
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [payments, total] = await Promise.all([
    FeePayment.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    FeePayment.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const receiptNumber = req.body.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`
  const payment = await FeePayment.create({
    ...req.body,
    receiptNumber,
    institutionId,
    collectedBy: req.auth!.userId,
  })

  // Update corresponding invoice
  if (payment.invoiceId) {
    const invoice = await Invoice.findOne({ _id: payment.invoiceId, institutionId })
    if (invoice) {
      invoice.paidAmount = (invoice.paidAmount || 0) + payment.amount
      if (invoice.paidAmount >= invoice.totalAmount) {
        invoice.status = 'paid'
      } else if (invoice.paidAmount > 0) {
        invoice.status = 'partial'
      }
      await invoice.save()
    }
  }

  res.status(201).json({ success: true, data: payment, message: 'Payment recorded successfully' })
})

// --- Salaries ---
export const getSalaries = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, month, status } = req.query

  const query: any = { institutionId }
  if (month) query.month = month
  if (status) query.status = status

  const skip = (Number(page) - 1) * Number(limit)
  const [salaries, total] = await Promise.all([
    Salary.find(query)
      .populate('staffId', 'firstName lastName email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Salary.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: salaries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createSalary = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { baseSalary = 0, allowances = 0, deductions = 0 } = req.body
  const netSalary = Number(baseSalary) + Number(allowances) - Number(deductions)
  const salary = await Salary.create({ ...req.body, netSalary, institutionId })
  res.status(201).json({ success: true, data: salary, message: 'Salary recorded successfully' })
})

// --- Expenses ---
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, category, search } = req.query

  const query: any = { institutionId }
  if (category) query.category = category
  if (search) query.title = { $regex: String(search), $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [expenses, total] = await Promise.all([
    Expense.find(query).skip(skip).limit(Number(limit)).sort({ date: -1 }),
    Expense.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const expense = await Expense.create({ ...req.body, institutionId, recordedBy: req.auth!.userId })
  res.status(201).json({ success: true, data: expense, message: 'Expense recorded successfully' })
})

// --- Scholarships ---
export const getScholarships = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, search, status } = req.query

  const query: any = { institutionId }
  if (status) query.status = status
  if (search) query.name = { $regex: String(search), $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [scholarships, total] = await Promise.all([
    Scholarship.find(query).populate('beneficiaries', 'firstName lastName email').skip(skip).limit(Number(limit)),
    Scholarship.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: scholarships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createScholarship = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const scholarship = await Scholarship.create({ ...req.body, institutionId })
  res.status(201).json({ success: true, data: scholarship, message: 'Scholarship created successfully' })
})

// --- Finance Overview Stats ---
export const getFinanceStats = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId

  const [invoices, payments, expenses, salaries] = await Promise.all([
    Invoice.find({ institutionId }),
    FeePayment.find({ institutionId, status: 'successful' }),
    Expense.find({ institutionId }),
    Salary.find({ institutionId }),
  ])

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingFees = Math.max(0, totalInvoiced - totalCollected)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const totalSalaries = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0)

  res.json({
    success: true,
    data: {
      totalInvoiced,
      totalCollected,
      pendingFees,
      totalExpenses,
      totalSalaries,
      netBalance: totalCollected - (totalExpenses + totalSalaries),
    },
  })
})
