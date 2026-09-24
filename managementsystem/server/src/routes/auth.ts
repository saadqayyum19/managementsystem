import { Router } from 'express'
import { forgotPassword, login, logout, me, refresh, register, requestOtp, resetPassword } from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { forgotPasswordSchema, loginSchema, registerSchema, requestOtpSchema, resetPasswordSchema } from '../validators/auth.js'

export const authRouter = Router()
authRouter.post('/register', validate(registerSchema), register)
authRouter.post('/login', validate(loginSchema), login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', logout)
authRouter.post('/otp/request', validate(requestOtpSchema), requestOtp)
authRouter.post('/password/forgot', validate(forgotPasswordSchema), forgotPassword)
authRouter.post('/password/reset', validate(resetPasswordSchema), resetPassword)
authRouter.get('/me', authenticate, me)
