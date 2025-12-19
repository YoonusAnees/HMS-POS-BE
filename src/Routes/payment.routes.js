import express from 'express';
import PaymentController from '../Controllers/payment.controller.js';
import auth from '../Middlewares/auth.middleware.js';
import prisma from '../Config/db.js';

const router = express.Router();

router.post('/', auth(['admin', 'manager', 'cashier', 'reception']), PaymentController.create);

router.get('/order/:orderId', auth(['admin', 'manager', 'cashier', 'reception']),PaymentController.getByOrderId);

export default router;
