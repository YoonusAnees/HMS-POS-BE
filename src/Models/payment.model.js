// src/models/payment.model.js
import prisma from '../Config/db.js';

const PaymentModel = {
  create: (data) => prisma.payment.create({ data }),
  listByOrder: (orderId) =>
    prisma.payment.findMany({ where: { orderId } }),
};

export default PaymentModel;
