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
    if (order.type === 'dine_in' && order.tableId) {
      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: 'free' },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: 'closed', closedById, closedAt: new Date() },
      include: { items: true, payments: true, table: true, room: true },
    });
  }

  return order;
}

const PaymentService = {
  /**
   * Supports overpay:
   * - payload.tendered = what customer gives (e.g. 500)
   * - system applies only up to balanceDue (e.g. 450)
   * - stores amount=450, tendered=500, change=50
   */
  async createPayment(payload, createdById) {
    const orderId = Number(payload.orderId);
    const method = String(payload.method || '');

    if (!createdById) throw new Error('createdById missing (auth)');
    if (!orderId) throw new Error('orderId is required');
    if (!VALID_PAY_METHODS.has(method)) throw new Error('Invalid payment method');

    const currency = payload.currency ? String(payload.currency) : 'LKR';
    const tipAmount =
      payload.tipAmount === undefined || payload.tipAmount === null
        ? null
        : toNum(payload.tipAmount, 0);

    // IMPORTANT:
    // - if frontend sends tendered, use it
    // - else fallback to amount
    const tendered = toNum(payload.tendered ?? payload.amount, 0);
    if (tendered <= 0) throw new Error('tendered/amount must be > 0');

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payments: true },
      });
      if (!order) throw new Error('Order not found');
      if (order.status !== 'open') throw new Error('Order is not open');

      const dueTotal = toNum(order.grandTotal, 0);
      const paidSoFar = order.payments.reduce((s, p) => s + toNum(p.amount, 0), 0);
      const balanceBefore = round2(dueTotal - paidSoFar);

      if (balanceBefore <= 0) throw new Error('Order is already fully paid');

      // ✅ Apply only what is needed to settle the bill
      const applied = round2(Math.min(tendered, balanceBefore));
      const change = round2(Math.max(0, tendered - balanceBefore));

      const payment = await tx.payment.create({
        data: {
          orderId,
          method,
          amount: decStr(applied),          // ✅ bill applied
          tendered: decStr(tendered),       // ✅ customer gave
          change: decStr(change),           // ✅ change
          currency,
          tipAmount: tipAmount === null ? null : decStr(tipAmount),
          createdById,
        },
      });

      const updatedOrder = await tryAutoCloseOrder(tx, orderId, createdById);

      // recompute totals after create
      const allPays = await tx.payment.findMany({ where: { orderId } });
      const paid = allPays.reduce((s, p) => s + toNum(p.amount, 0), 0);
      const balanceAfter = round2(dueTotal - paid);

      return {
        payment,
        summary: {
          orderId,
          due: decStr(dueTotal),
          paid: decStr(paid),
          balanceBefore: decStr(balanceBefore),
          balance: decStr(balanceAfter),
          tendered: decStr(tendered),
          applied: decStr(applied),
          change: decStr(change),
          isFullyPaid: paid + 0.0001 >= dueTotal,
          orderStatus: updatedOrder.status,
        },
        order: updatedOrder,
      };
    });
  },
};

export default PaymentService;
