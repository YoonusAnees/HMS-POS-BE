// src/routes/user.routes.js
import express from 'express';
import UserController from '../Controllers/user.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

// Auth routes
router.post('/login', UserController.login);

// TEMP: open to create first admin; later change to auth(['admin'])
router.post('/register', UserController.register);

// User management
router.get('/', auth(['admin', 'manager']), UserController.list);

export default router;
