// src/controllers/room.controller.js
import RoomService from '../Services/room.service.js';

const RoomController = {
  list: async (req, res, next) => {
    try {
      const data = await RoomService.list();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  listVacant: async (req, res, next) => {
    try {
      const data = await RoomService.listVacant();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  listOccupied: async (req, res, next) => {
    try {
      const data = await RoomService.listOccupied();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  listOutOfOrder: async (req, res, next) => {
    try {
      const data = await RoomService.listOutOfOrder();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const created = await RoomService.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  bulkCreate: async (req, res, next) => {
  try {
    const created = await RoomService.bulkCreate(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
},


  update: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const updated = await RoomService.update(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  setStatus: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const updated = await RoomService.setStatus(id, status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};

export default RoomController;
