import type { Request } from 'express'
import type { Model } from 'mongoose'
import { AcademicClass } from '../models/AcademicClass.js'
import { Department } from '../models/Department.js'
import { Program } from '../models/Program.js'
import { Section } from '../models/Section.js'
import { Semester } from '../models/Semester.js'
import { Subject } from '../models/Subject.js'
import { academicResources, type AcademicResource } from '../validators/academics.js'
import { AppError, asyncHandler } from '../utils/errors.js'

const resourceModels: Record<AcademicResource, Model<any>> = { classes: AcademicClass, sections: Section, subjects: Subject, departments: Department, programs: Program, semesters: Semester }
function getModel(resource: string) { if (!academicResources.includes(resource as AcademicResource)) throw new AppError('Academic resource not found', 404, 'RESOURCE_NOT_FOUND'); return resourceModels[resource as AcademicResource] }
function getResource(req: Request): AcademicResource { const resource = req.params.resource as AcademicResource; getModel(resource); return resource }
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

export const listAcademic = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const resource = getResource(req); const model = getModel(resource); const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100); const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const filter: Record<string, unknown> = { institutionId: req.auth.institutionId }; if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'; if (search) filter.$or = [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { code: { $regex: escapeRegex(search), $options: 'i' } }]
  const [data, total] = await Promise.all([model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), model.countDocuments(filter)])
  res.json({ success: true, data, meta: { resource, page, limit, total, pages: Math.ceil(total / limit) } })
})

export const createAcademic = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const resource = getResource(req); const model = getModel(resource); const item = await model.create({ ...req.body, institutionId: req.auth.institutionId }); res.status(201).json({ success: true, data: item })
})

export const updateAcademic = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const resource = getResource(req); const model = getModel(resource); const item = await model.findOneAndUpdate({ _id: req.params.id, institutionId: req.auth.institutionId }, { $set: req.body }, { new: true, runValidators: true }).lean(); if (!item) throw new AppError('Academic record not found', 404, 'RECORD_NOT_FOUND'); res.json({ success: true, data: item })
})

export const deleteAcademic = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const resource = getResource(req); const model = getModel(resource); const item = await model.findOneAndUpdate({ _id: req.params.id, institutionId: req.auth.institutionId }, { $set: { isActive: false } }, { new: true }).lean(); if (!item) throw new AppError('Academic record not found', 404, 'RECORD_NOT_FOUND'); res.json({ success: true, data: { id: req.params.id, isActive: false } })
})
