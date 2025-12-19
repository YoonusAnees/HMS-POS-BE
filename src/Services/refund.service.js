import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const VALID_PAY_METHODS = new Set(['cash', 'card', 'room', 'online']);

const RefundService = {
  async createRefund(payload, createdById) {
    if (!createdById) throw new Error('createdById missing (auth)');

    const orderId = Number(payload.orderId);
    if (!orderId) throw new Error('orderId is required');

    const method = payload.method ? String(payload.method) : 'cash';
    if (!VALID_PAY_METHODS.has(method)) throw new Error('Invalid refund method');

    const amount = toNum(payload.amount, 0);
    if (amount <= 0) throw new Error('amount must be > 0');

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payments: true },
      });
      if (!order) throw new Error('Order not found');

      // ✅ create negative payment (refund)
      const refund = await tx.payment.create({
        data: {
          orderId,
          method,
          amount: decStr(-amount),
          currency: payload.currency ? String(payload.currency) : 'LKR',
          tipAmount: null,
          tendered: null,
          change: null,
          createdById,
        },
      });

      // ✅ recompute totals after insert
      const allPays = await tx.payment.findMany({ where: { orderId } });
      const paidNet = allPays.reduce((s, p) => s + toNum(p.amount, 0), 0);

      const due = toNum(order.grandTotal, 0);
      const balance = round2(due - paidNet);

      // ✅ decide order status
      let nextStatus = order.status;
      let nextClosedAt = order.closedAt;
      let nextClosedById = order.closedById;

      if (paidNet <= 0.0001) {
        // FULL refund (net paid becomes 0 or below)
        nextStatus = 'refunded';
        // keep closedAt/closedById as-is (or set a refundedAt if you add one)
      } else if (paidNet + 0.0001 < due) {
        // not fully paid anymore -> reopen
        nextStatus = 'open';
        nextClosedAt = null;
        nextClosedById = null;
      } else {
        // still fully paid -> remain closed
        nextStatus = 'closed';
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          closedAt: nextClosedAt,
          closedById: nextClosedById,
        },
        include: { items: true, payments: true, table: true, room: true },
      });

      return {
        refund,
        order: updatedOrder,
        summary: {
          orderId,
          paid: decStr(paidNet),
          due: decStr(due),
          balance: decStr(balance),
          orderStatus: updatedOrder.status,
        },
      };
    });
  },
};

export default RefundService;
