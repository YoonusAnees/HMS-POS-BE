import prisma from '../Config/db.js';

const OrderItemModel = {
  addMany: (items) =>
    prisma.orderItem.createMany({
      data: items,
    }),

  listByOrder: (orderId) =>
    prisma.orderItem.findMany({
      where: { orderId },
    }),
};

export default OrderItemModel;
