// src/models/orderItem.model.js
import prisma from '../Config/db.js';

const OrderItemModel = {
  createMany: (data) => prisma.orderItem.createMany({ data }),

  addSingle: (data) => prisma.orderItem.create({ data }),

  listByOrder: (orderId) =>
    prisma.orderItem.findMany({ where: { orderId } }),
};

export default OrderItemModel;
