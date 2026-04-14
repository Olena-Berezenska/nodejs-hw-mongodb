import express from 'express';
import {
  loginController,
  registerUserController,
  refreshController,
  logoutController,
} from '../controllers/auth.js';
import { registerUserSchema, loginUserSchema } from '../validating/auth.js';
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
export default router;
