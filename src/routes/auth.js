import { Router } from 'express'
import { login, register } from '../controllers/auth.controller.js'
import { loginLimiter, registerLimiter } from '../middleware/rate-limit.js'
import { verifyCaptcha } from '../middleware/verify-captcha.js'

const router = Router()

router.post('/login', loginLimiter, verifyCaptcha, login)
router.post('/register', registerLimiter, verifyCaptcha, register)

export default router