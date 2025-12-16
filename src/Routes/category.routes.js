// src/routes/category.routes.js
import express from 'express';
import CategoryController from '../Controllers/category.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth(['admin', 'manager', 'cashier', 'reception']), CategoryController.list);
router.get('/active', auth(['admin', 'manager', 'cashier', 'reception']), CategoryController.listActive);
router.post('/bulk', auth(['admin', 'manager']), CategoryController.bulkCreate);
router.post('/', auth(['admin', 'manager']), CategoryController.create);
router.put('/:id', auth(['admin', 'manager']), CategoryController.update);
router.delete('/:id', auth(['admin']), CategoryController.remove);
//Activate / Deactivate (NO DELETE)
router.patch('/:id/status', auth(['admin']), CategoryController.setStatus);
export default router;
