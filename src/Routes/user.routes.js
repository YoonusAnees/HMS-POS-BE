// src/routes/user.routes.js
import express from 'express';
import UserController from '../Controllers/user.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', auth(['admin']), UserController.register);
router.post('/login', UserController.login);
router.get('/', auth(['admin', 'manager']), UserController.list);

export default router;
