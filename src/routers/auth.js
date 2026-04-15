import express from 'express';
import {
  loginController,
  registerUserController,
  refreshController,
  logoutController,
  sendResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import { registerUserSchema, loginUserSchema, sendResetEmailSchema, resetPasswordSchema } from '../validating/auth.js';
import { validateUserBody } from '../middlewares/validateUserBody.js';
const router = express.Router();

router.post(
  '/register',
  validateUserBody(registerUserSchema),
  registerUserController,
);
router.post('/login', validateUserBody(loginUserSchema), loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.post(
  '/send-reset-email',
  validateUserBody(sendResetEmailSchema),
  sendResetEmailController,
);
router.post(
  '/reset-pwd',
  validateUserBody(resetPasswordSchema),
  resetPasswordController,
);
export default router;
