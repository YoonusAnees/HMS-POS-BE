// src/models/item.model.js
import { create } from 'domain';
import prisma from '../Config/db.js';

const ItemModel = {
  list: () =>
    prisma.item.findMany({
      include: { category: true },
    }),

  //    // Get only active items
  // listActive: () =>
  //   prisma.category.findMany({
  //     where: { isActive: true },
  //   }),

  listActive: () =>
    prisma.item.findMany({
      where: { isActive: true },
      include: { category: true },
    }),

    createMany: (data) =>
    prisma.item.createMany({ data,
      skipDuplicates: true, 
     }),

  create: (data) => prisma.item.create({ data }),

  update: (id, data) => prisma.item.update({ where: { id }, data }),

  remove: (id) => prisma.item.delete({ where: { id } }),

  setStatus: (id, isActive) =>
    prisma.item.update({
      where: { id },
      data: { isActive },
    }),
};

export default ItemModel;
