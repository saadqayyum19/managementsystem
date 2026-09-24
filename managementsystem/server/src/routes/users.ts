import { Router } from 'express'
import { createUser, deleteUser, getUser, listUsers, teacherWorkload, updateUser } from '../controllers/users.js'
import { authenticate, requirePermissions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { Permission } from '../config/permissions.js'
import { createUserSchema, updateUserSchema } from '../validators/users.js'

export const usersRouter = Router()
usersRouter.use(authenticate)
usersRouter.get('/teachers/workload', requirePermissions(Permission.USER_READ), teacherWorkload)
usersRouter.get('/', requirePermissions(Permission.USER_READ), listUsers)
usersRouter.post('/', requirePermissions(Permission.USER_WRITE), validate(createUserSchema), createUser)
usersRouter.get('/:id', requirePermissions(Permission.USER_READ), getUser)
usersRouter.patch('/:id', requirePermissions(Permission.USER_WRITE), validate(updateUserSchema), updateUser)
usersRouter.delete('/:id', requirePermissions(Permission.USER_WRITE), deleteUser)
