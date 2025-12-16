// src/Controllers/table.controller.js
import TableService from '../Services/table.service.js';

const TableController = {
  list: async (req, res, next) => {
    try {
      const tables = await TableService.list();
      res.json(tables);
    } catch (err) {
      next(err);
    }
  },

  listActive: async (req, res, next) => {
    try {
      const tables = await TableService.listActive();
      res.json(tables);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const table = await TableService.getById(id);
      res.json(table);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const table = await TableService.create(req.body);
      res.status(201).json({ message: 'Table created', table });
    } catch (err) {
      next(err);
    }
  },

  bulkCreate: async (req, res, next) => {
    try {
      const result = await TableService.bulkCreate(req.body);
      res.status(201).json({ message: 'Tables inserted', count: result.count });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const table = await TableService.update(id, req.body);
      res.json({ message: 'Table updated', table });
    } catch (err) {
      next(err);
    }
  },

  setStatus: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const table = await TableService.setStatus(id, status);
      res.json({ message: 'Table status updated', table });
    } catch (err) {
      next(err);
    }
  },

  setActive: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body;
      const table = await TableService.setActive(id, isActive);
      res.json({ message: 'Table active status updated', table });
    } catch (err) {
      next(err);
    }
  },

  // OPTIONAL
  remove: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const result = await TableService.remove(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

export default TableController;
