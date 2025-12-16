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
      },
    }),

  listOpen: () =>
    prisma.order.findMany({
      where: { status: 'open' },
      include: {
        items: true,
      },
      orderBy: { openedAt: 'desc' },
    }),

  update: (id, data) =>
    prisma.order.update({
      where: { id },
      data,
    }),
};

export default OrderModel;
