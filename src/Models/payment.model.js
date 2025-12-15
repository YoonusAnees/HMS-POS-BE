// src/models/payment.model.js
const prisma = require('../Config/db');

const PaymentModel = {
  create: (data) => prisma.payment.create({ data }),
  listByOrder: (orderId) =>
    prisma.payment.findMany({ where: { orderId } }),
};

module.exports = PaymentModel;
