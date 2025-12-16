// src/routes/item.routes.js
import express from 'express';
import ItemController from '../Controllers/item.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth(['admin', 'manager', 'cashier', 'reception']), ItemController.list);
router.post('/', auth(['admin', 'manager']), ItemController.create);
router.get('/active', auth(['admin', 'manager', 'cashier', 'reception']), ItemController.listActive);
router.post('/bulk', auth(['admin', 'manager']), ItemController.createMany);
router.put('/:id', auth(['admin', 'manager']), ItemController.update);
router.patch('/status/:id', auth(['admin', 'manager']), ItemController.setStatus);
router.delete('/:id', auth(['admin']), ItemController.remove);

export default router;
