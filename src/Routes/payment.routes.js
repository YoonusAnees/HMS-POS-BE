import express from 'express';
import PaymentController from '../Controllers/payment.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', auth(['admin','manager','cashier','reception']), PaymentController.create);
router.get('/order/:orderId', auth(['admin','manager','cashier','reception']), PaymentController.listByOrder);

export default router;
