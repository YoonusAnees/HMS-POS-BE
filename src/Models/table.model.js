// src/Models/table.model.js
import prisma from '../Config/db.js';

const TableModel = {
  list: () =>
    prisma.restaurantTable.findMany({
      orderBy: { id: 'asc' },
    }),

  listActive: () =>
    prisma.restaurantTable.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    }),

  findById: (id) =>
    prisma.restaurantTable.findUnique({ where: { id } }),

  findByCode: (code) =>
    prisma.restaurantTable.findUnique({ where: { code } }),

  create: (data) =>
    prisma.restaurantTable.create({ data }),

  createMany: (data) =>
    prisma.restaurantTable.createMany({
      data,
      skipDuplicates: true, // avoids crash if code already exists
    }),

  update: (id, data) =>
    prisma.restaurantTable.update({
      where: { id },
      data,
    }),

  setStatus: (id, status) =>
    prisma.restaurantTable.update({
      where: { id },
      data: { status },
    }),

  setActive: (id, isActive) =>
    prisma.restaurantTable.update({
      where: { id },
      data: { isActive },
    }),

  remove: (id) =>
    prisma.restaurantTable.delete({ where: { id } }),
};

export default TableModel;
