// src/Routes/table.routes.js
import express from 'express';
import TableController from '../Controllers/table.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

// View (all roles that operate POS)
router.get('/', auth(['admin', 'manager', 'cashier', 'reception']), TableController.list);
router.get('/active', auth(['admin', 'manager', 'cashier', 'reception']), TableController.listActive);
router.get('/:id', auth(['admin', 'manager']), TableController.getById);

// Create / Update (admin/manager)
router.post('/', auth(['admin', 'manager']), TableController.create);
router.post('/bulk', auth(['admin', 'manager']), TableController.bulkCreate);
router.put('/:id', auth(['admin', 'manager']), TableController.update);

// Status updates
router.patch('/:id/status', auth(['admin', 'manager']), TableController.setStatus); // free/occupied/reserved
router.patch('/:id/active', auth(['admin']), TableController.setActive);           // isActive true/false

// OPTIONAL delete (not recommended)
router.delete('/:id', auth(['admin']), TableController.remove);

export default router;
