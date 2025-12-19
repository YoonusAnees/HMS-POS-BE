import express from 'express';
import RefundController from '../Controllers/refund.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', auth(['admin', 'manager','cashier']), RefundController.create);

export default router;
