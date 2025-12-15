// src/models/orderItem.model.js
const prisma = require('../Config/db');

const OrderItemModel = {
  createMany: (data) => prisma.orderItem.createMany({ data }),

  addSingle: (data) => prisma.orderItem.create({ data }),

  listByOrder: (orderId) =>
    prisma.orderItem.findMany({ where: { orderId } }),
};

module.exports = OrderItemModel;
