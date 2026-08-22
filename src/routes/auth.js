import { Router } from 'express'
import { login, register, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { loginLimiter, registerLimiter, forgotPasswordLimiter } from '../middleware/rate-limit.js'
import { verifyCaptcha } from '../middleware/verify-captcha.js'

const router = Router()

router.post('/login', loginLimiter, verifyCaptcha, login)
router.post('/register', registerLimiter, verifyCaptcha, register)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password', forgotPasswordLimiter, resetPassword)

export default router