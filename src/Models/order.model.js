// src/models/order.model.js
import prisma from '../Config/db.js';

const OrderModel = {
  create: (data) =>
    prisma.order.create({
      data,
      include: { items: true, payments: true },
    }),

  findById: (id) =>
    prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        room: true,
        items: true,
        payments: true,
      },
    }),

  listOpen: () =>
    prisma.order.findMany({
      where: { status: 'open' },
      include: { table: true, room: true },
    }),

  update: (id, data) =>
    prisma.order.update({
      where: { id },
      data,
      include: { items: true, payments: true },
    }),
};

export default OrderModel;
