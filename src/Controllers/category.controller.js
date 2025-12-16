// src/controllers/category.controller.js
import CategoryService from '../Services/category.service.js';

const CategoryController = {
  list: async (req, res, next) => {
    try {
      const data = await CategoryService.list();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  listActive: async (req, res, next) => {
    try {
      const categories = await CategoryService.listActive();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const created = await CategoryService.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

    bulkCreate: async (req, res, next) => {
    try {
      const result = await CategoryService.createMany(req.body);
      res.status(201).json({
        message: 'Categories inserted',
        insertedCount: result.count,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const updated = await CategoryService.update(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await CategoryService.remove(id);
      res.json({ message: 'Category deleted' });
    } catch (err) {
      next(err);
    }
  },

   setStatus: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body;

      const category = await CategoryService.setStatus(id, isActive);
      res.json(category);
    } catch (err) {
      next(err);
    }
  },
};

export default CategoryController;
