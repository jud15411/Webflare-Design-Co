import { Router } from 'express';
import { login, setInitialPassword } from './auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/set-initial-password', setInitialPassword);

export default router;
