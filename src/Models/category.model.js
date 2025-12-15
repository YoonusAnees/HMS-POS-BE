// src/models/category.model.js
const prisma = require('../Config/db');

const CategoryModel = {
  list: () => prisma.category.findMany(),
  create: (data) => prisma.category.create({ data }),
  update: (id, data) => prisma.category.update({ where: { id }, data }),
  remove: (id) => prisma.category.delete({ where: { id } }),
};

module.exports = CategoryModel;
