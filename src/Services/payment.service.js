import prisma from '../Config/db.js';

const toNum = (v) => Number(v) || 0;
const decStr = (n) => n.toFixed(2);

const PaymentService = {
  async create(payload, createdById) {
    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: { payments: true },
    });

    if (!order || order.status !== 'open')
      throw new Error('Order not open');

    const amount = toNum(payload.amount);

    const payment = await prisma.payment.create({
      data: {
        orderId: payload.orderId,
        method: payload.method,
        amount: decStr(amount),
        currency: payload.currency || 'LKR',
        tipAmount: payload.tipAmount
          ? decStr(toNum(payload.tipAmount))
          : null,
        createdById,
      },
    });

    return payment;
  },

  listByOrder: (orderId) =>
    prisma.payment.findMany({
      where: { orderId },
    }),
};

export default PaymentService;
