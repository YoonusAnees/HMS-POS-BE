import express from 'express';
import OrderController from '../Controllers/order.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', auth(['admin','manager','cashier','reception']), OrderController.create);
router.get('/open', auth(['admin','manager','cashier','reception']), OrderController.listOpen);
router.get('/:id', auth(['admin','manager','cashier','reception']), OrderController.getById);
router.post('/:id/close', auth(['admin','manager']), OrderController.close);

export default router;
