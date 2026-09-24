import { Router } from 'express'
import { Permission } from '../config/permissions.js'
import { createExam, deleteExam, enterMarks, generateResults, listExams, listResults, updateExam } from '../controllers/exams.js'
import { authenticate, requirePermissions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { examSchema, examUpdateSchema, marksSchema } from '../validators/exams.js'

export const examsRouter = Router()
examsRouter.use(authenticate)
examsRouter.get('/', requirePermissions(Permission.EXAMS_READ), listExams)
examsRouter.post('/', requirePermissions(Permission.EXAMS_WRITE), validate(examSchema), createExam)
examsRouter.patch('/:id', requirePermissions(Permission.EXAMS_WRITE), validate(examUpdateSchema), updateExam)
examsRouter.delete('/:id', requirePermissions(Permission.EXAMS_WRITE), deleteExam)
examsRouter.get('/:id/results', requirePermissions(Permission.EXAMS_READ), listResults)
examsRouter.post('/:id/marks', requirePermissions(Permission.EXAMS_WRITE), validate(marksSchema), enterMarks)
examsRouter.post('/:id/results/generate', requirePermissions(Permission.EXAMS_WRITE), generateResults)
