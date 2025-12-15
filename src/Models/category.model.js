// src/models/category.model.js
import prisma from '../Config/db.js';

const CategoryModel = {
  list: () => prisma.category.findMany(),
  create: (data) => prisma.category.create({ data }),
  update: (id, data) => prisma.category.update({ where: { id }, data }),
  remove: (id) => prisma.category.delete({ where: { id } }),
};

export default CategoryModel;
