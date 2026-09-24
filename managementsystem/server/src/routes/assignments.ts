import { Router } from 'express'
import { Permission } from '../config/permissions.js'
import { createAssignment, deleteAssignment, gradeSubmission, listAssignments, listSubmissions, submitAssignment, updateAssignment } from '../controllers/assignments.js'
import { authenticate, requirePermissions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { assignmentSchema, assignmentUpdateSchema, gradeSchema, submissionSchema } from '../validators/assignments.js'

export const assignmentsRouter = Router()
assignmentsRouter.use(authenticate)
assignmentsRouter.get('/', requirePermissions(Permission.ASSIGNMENTS_READ), listAssignments)
assignmentsRouter.post('/', requirePermissions(Permission.ASSIGNMENTS_WRITE), validate(assignmentSchema), createAssignment)
assignmentsRouter.patch('/:id', requirePermissions(Permission.ASSIGNMENTS_WRITE), validate(assignmentUpdateSchema), updateAssignment)
assignmentsRouter.delete('/:id', requirePermissions(Permission.ASSIGNMENTS_WRITE), deleteAssignment)
assignmentsRouter.post('/:id/submit', requirePermissions(Permission.ASSIGNMENTS_READ), validate(submissionSchema), submitAssignment)
assignmentsRouter.get('/:id/submissions', requirePermissions(Permission.ASSIGNMENTS_WRITE), listSubmissions)
assignmentsRouter.patch('/:id/submissions/:submissionId', requirePermissions(Permission.ASSIGNMENTS_WRITE), validate(gradeSchema), gradeSubmission)
