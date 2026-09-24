import { Router } from 'express'
import { createAcademic, deleteAcademic, listAcademic, updateAcademic } from '../controllers/academics.js'
import { Permission } from '../config/permissions.js'
import { authenticate, requirePermissions } from '../middleware/auth.js'
import { validateAcademicBody } from '../validators/academics.js'

export const academicsRouter = Router()
academicsRouter.use(authenticate)
academicsRouter.get('/:resource', requirePermissions(Permission.ACADEMICS_READ), listAcademic)
academicsRouter.post('/:resource', requirePermissions(Permission.ACADEMICS_WRITE), validateAcademicBody, createAcademic)
academicsRouter.patch('/:resource/:id', requirePermissions(Permission.ACADEMICS_WRITE), validateAcademicBody, updateAcademic)
academicsRouter.delete('/:resource/:id', requirePermissions(Permission.ACADEMICS_WRITE), deleteAcademic)
