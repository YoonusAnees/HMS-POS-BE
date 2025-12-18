import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const VALID_PAY_METHODS = new Set(['cash', 'card', 'room', 'online']);

async function tryAutoCloseOrder(tx, orderId, closedById) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) throw new Error('Order not found');
  if (order.status !== 'open') return order;

  const paid = order.payments.reduce((sum, p) => sum + toNum(p.amount, 0), 0);
  const due = toNum(order.grandTotal, 0);

  if (paid + 0.0001 >= due) {
    // free table if dine-in
    if (order.type === 'dine_in' && order.tableId) {
      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: 'free' },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: 'closed', closedById, closedAt: new Date() },
      include: { items: true, payments: true },
    });
  }

  return order;
}

const PaymentService = {
  async createPayment(payload, createdById) {
    const orderId = Number(payload.orderId);
    const method = String(payload.method || '');
    const amount = toNum(payload.amount, 0);

    if (!createdById) throw new Error('createdById missing (auth)');
    if (!orderId) throw new Error('orderId is required');
    if (!VALID_PAY_METHODS.has(method)) throw new Error('Invalid payment method');
    if (amount <= 0) throw new Error('amount must be > 0');

    const currency = payload.currency ? String(payload.currency) : 'LKR';
    const tipAmount =
      payload.tipAmount === undefined || payload.tipAmount === null
        ? null
        : toNum(payload.tipAmount, 0);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');
      if (order.status !== 'open') throw new Error('Order is not open');

      const payment = await tx.payment.create({
        data: {
          orderId,
          method,
          amount: decStr(amount),
          currency,
          tipAmount: tipAmount === null ? null : decStr(tipAmount),
          createdById,
        },
      });

      const updatedOrder = await tryAutoCloseOrder(tx, orderId, createdById);

      const paid = (await tx.payment.findMany({ where: { orderId } }))
        .reduce((s, p) => s + toNum(p.amount, 0), 0);

      const due = toNum(updatedOrder.grandTotal, 0);
      const balance = round2(due - paid);

      return {
        payment,
        summary: {
          orderId,
          paid: decStr(paid),
          due: decStr(due),
          balance: decStr(balance),
          isFullyPaid: paid + 0.0001 >= due,
          orderStatus: updatedOrder.status,
        },
        order: updatedOrder,
      };
    });
  },
};

export default PaymentService;
