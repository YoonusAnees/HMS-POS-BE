import express from 'express';
import auth from '../Middlewares/auth.middleware.js';
import DashboardController from '../Controllers/dashboard.controller.js';

const router = express.Router();

router.get('/summary', auth(['admin', 'manager']), DashboardController.summary);

export default router;
