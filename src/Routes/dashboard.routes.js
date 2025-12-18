import express from 'express';
import DashboardController from '../Controllers/dashboard.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get('/summary', auth(['admin', 'manager']), DashboardController.summary);

export default router;
