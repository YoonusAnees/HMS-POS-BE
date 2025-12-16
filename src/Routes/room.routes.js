// src/routes/room.routes.js
import express from 'express';
import RoomController from '../Controllers/room.controller.js';
import auth from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.get(
  '/',
  auth(['admin', 'manager', 'reception', 'cashier']),
  RoomController.list
);

router.get(
  '/vacant',
  auth(['admin', 'manager', 'reception']),
  RoomController.listVacant
);

router.get(
  '/occupied',
  auth(['admin', 'manager', 'reception']),
  RoomController.listOccupied
);

router.get(
  '/out-of-order',
  auth(['admin', 'manager']),
  RoomController.listOutOfOrder
);

router.post(
  '/',
  auth(['admin', 'manager']),
  RoomController.create
);

router.post(
  '/bulk',
  auth(['admin', 'manager']),
  RoomController.bulkCreate
);


router.put(
  '/:id',
  auth(['admin', 'manager']),
  RoomController.update
);

router.patch(
  '/:id/status',
  auth(['admin', 'manager', 'reception']),
  RoomController.setStatus
);

export default router;
