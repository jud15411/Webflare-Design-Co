// File: apps/server/src/modules/clientAuth/clientAuth.routes.ts

import express from 'express';
import { clientLogin, checkClientStatus, setClientPassword } from './clientAuth.controller.js';

const router = express.Router();

router.post('/status', checkClientStatus);
router.post('/set-password', setClientPassword);
router.post('/login', clientLogin);

export default router;