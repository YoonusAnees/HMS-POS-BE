import express from 'express';
import RefundController from '../Controllers/refund.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

// Typically admin/manager only
router.post('/', auth(['admin', 'manager']), RefundController.create);

export default router;
