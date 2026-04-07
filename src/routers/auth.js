import express from 'express';
import {
  loginController,
  registerUserController,
} from '../controllers/auth.js';
import { registerUserSchema } from '../validation/auth.js';
import { validateUserBody } from '../middlewares/validateUserBody.js';
import { loginUserSchema } from '../validating/auth.js';
const router = express.Router();

router.post(
  '/register',
  validateUserBody(registerUserSchema),
  registerUserController,
);
router.post('/login', validateUserBody(loginUserSchema), loginController);
export default router;
