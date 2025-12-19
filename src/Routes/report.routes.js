import express from 'express';
import ReportController from '../Controllers/report.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get('/eod', auth(['admin', 'manager','cashier']), ReportController.eod);

export default router;
