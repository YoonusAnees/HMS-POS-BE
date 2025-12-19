import prisma from '../Config/db.js';

const OrderModel = {
  create: (data) =>
    prisma.order.create({
      data,
      include: {
        items: true,
        payments: true,
      },
    }),

  findById: (id) =>
    prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
         table: true,
        room: true,
      },
    }),

  listOpen: () =>
    prisma.order.findMany({
      where: { status: 'open' },
      include: {
         items: true, payments: true, table: true, room: true
      },
      orderBy: { openedAt: 'desc' },
    }),

    listAll: () =>
    prisma.order.findMany({
      include: {  items: true, payments: true, table: true, room: true }, 
    }),

  update: (id, data) =>
    prisma.order.update({
      where: { id },
      data,
      include: { items: true, payments: true, table: true, room: true },
    }),
};

export default OrderModel;
