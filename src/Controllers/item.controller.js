// src/controllers/item.controller.js
import ItemService from '../Services/item.service.js';

const ItemController = {
  list: async (req, res, next) => {
    try {
      const data = await ItemService.list();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  listActive: async (req, res, next) => {
    try {
      const items = await ItemService.listActive();         
      res.json(items);
    } catch (err) {
      next(err);
    }
  },

  createMany: async (req, res, next) => {
    try {
      const result = await ItemService.createMany(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const created = await ItemService.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const updated = await ItemService.update(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await ItemService.remove(id);
      res.json({ message: 'Item deleted' });
    } catch (err) {
      next(err);
    }
  },

    setStatus: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body;
      await ItemService.setStatus(id, isActive);
      res.json({ message: 'Item status updated' });
    } catch (err) {
      next(err);
    }
  },
};

export default ItemController;