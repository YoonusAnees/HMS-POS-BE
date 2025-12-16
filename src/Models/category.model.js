// src/models/category.model.js
import prisma from '../Config/db.js';

const CategoryModel = {
  // Get all categories
  list: () => prisma.category.findMany(),

  // Get only active categories
  listActive: () =>
    prisma.category.findMany({
      where: { isActive: true },
    }),

  create: (data) => prisma.category.create({ data }),

  //  BULK INSERT
  createMany: (data) =>
    prisma.category.createMany({
      data,
      skipDuplicates: true, // avoids crash if same name exists
    }),

  update: (id, data) => prisma.category.update({ where: { id }, data }),
  remove: (id) => prisma.category.delete({ where: { id } }),
  
  //Status Update
    setStatus: (id, isActive) =>
    prisma.category.update({
      where: { id },
      data: { isActive },
    }),
};

export default CategoryModel;
