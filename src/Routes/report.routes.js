import express from 'express';
import ReportController from '../Controllers/report.controller.js';
import ManagerReportController from '../Controllers/ManagerReportController.js';

import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get('/eod', auth(['admin', 'manager','cashier']), ReportController.eod);
router.get('/manager-summary', auth(['admin', 'manager','cashier']), ManagerReportController.ManagerSummery);


export default router;
