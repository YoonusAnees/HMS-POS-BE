// src/controllers/user.controller.js
const UserService = require('../Services/user.service');

const UserController = {
  register: async (req, res, next) => {
    try {
      const user = await UserService.register(req.body);
      res.status(201).json({ message: 'User created', user });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await UserService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const users = await UserService.list();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
