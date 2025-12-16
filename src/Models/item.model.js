// src/models/item.model.js
import prisma from '../Config/db.js';

const ItemModel = {
  list: () =>
    prisma.item.findMany({
      include: { category: true },
    }),

  create: (data) => prisma.item.create({ data }),

  update: (id, data) => prisma.item.update({ where: { id }, data }),

  remove: (id) => prisma.item.delete({ where: { id } }),
};

export default ItemModel;
