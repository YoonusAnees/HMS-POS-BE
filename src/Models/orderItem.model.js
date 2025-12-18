import prisma from '../Config/db.js';

const OrderItemModel = {
  addSingle: (data) => 
    prisma.orderItem.create({ 
      data }),

  addMany: (items) =>
    prisma.orderItem.createMany({
      data: items,
    }),

  listByOrder: (orderId) =>
    prisma.orderItem.findMany({
      where: { orderId },
      orderBy: { id: 'asc' },

      
    }),

  remove: (id) => 
    prisma.orderItem.delete({ 
      where: { id } }),
};

export default OrderItemModel;
