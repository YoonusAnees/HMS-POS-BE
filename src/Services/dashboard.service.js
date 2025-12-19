import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

// YYYY-MM-DD array between
function daysBetween(fromStr, toStr) {
  const out = [];
  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T00:00:00.000Z`);
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const DashboardService = {
  async summary({ from, to, currency = 'LKR' }) {
    if (!from || !to) throw new Error('from and to are required (YYYY-MM-DD)');

    const start = new Date(`${from}T00:00:00.000Z`);
    const end = new Date(`${to}T23:59:59.999Z`);

    // USERS
    const [usersTotal, usersActive, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
    ]);

    // ORDERS COUNTS (range by openedAt)
    const [openCount, closedCount, cancelledCount] = await Promise.all([
      prisma.order.count({ where: { status: 'open', openedAt: { gte: start, lte: end } } }),
      prisma.order.count({ where: { status: 'closed', openedAt: { gte: start, lte: end } } }),
      prisma.order.count({ where: { status: 'cancelled', openedAt: { gte: start, lte: end } } }),
    ]);

    // REVENUE (closed orders in range)
    const closedOrders = await prisma.order.findMany({
      where: { status: 'closed', closedAt: { gte: start, lte: end } },
      select: { id: true, orderNumber: true, type: true, grandTotal: true, taxTotal: true, closedAt: true },
      orderBy: { closedAt: 'desc' },
      take: 10,
    });

    const revenueClosed = decStr(closedOrders.reduce((s, o) => s + toNum(o.grandTotal, 0), 0));
    const taxClosed = decStr(closedOrders.reduce((s, o) => s + toNum(o.taxTotal, 0), 0));

    // PAYMENTS (includes refunds as negative)
    const payments = await prisma.payment.findMany({
      where: { currency, paidAt: { gte: start, lte: end } },
      select: { id: true, orderId: true, method: true, amount: true, tendered: true, change: true, paidAt: true, createdById: true },
      orderBy: { paidAt: 'desc' },
      take: 2000, // enough for dashboard calculations
    });

    const grossPayments = payments.filter(p => toNum(p.amount) > 0).reduce((s, p) => s + toNum(p.amount), 0);
    const refundPayments = payments.filter(p => toNum(p.amount) < 0).reduce((s, p) => s + Math.abs(toNum(p.amount)), 0);
    const netPayments = grossPayments - refundPayments;

    const byMethodMap = new Map();
    for (const p of payments) {
      const amt = toNum(p.amount, 0);
      const entry = byMethodMap.get(p.method) || { gross: 0, refunds: 0 };
      if (amt >= 0) entry.gross += amt;
      else entry.refunds += Math.abs(amt);
      byMethodMap.set(p.method, entry);
    }
    const paymentsByMethod = Array.from(byMethodMap.entries()).map(([method, v]) => ({
      method,
      gross: round2(v.gross),
      refunds: round2(v.refunds),
      net: round2(v.gross - v.refunds),
    }));

    const refundsCount = payments.filter(p => toNum(p.amount) < 0).length;

    // DAILY SERIES (orders + payments)
    const days = daysBetween(from, to);

    const ordersDailyAgg = await prisma.order.groupBy({
      by: ['status'],
      where: { openedAt: { gte: start, lte: end } },
      _count: { _all: true },
    });

    // Better daily charts: do per-day counts via raw SQL (fast & correct)
    // If you don't want raw SQL, skip and return zeros.
    const dailyOrders = await prisma.$queryRawUnsafe(`
      SELECT to_char(date_trunc('day',"openedAt"), 'YYYY-MM-DD') as day,
             SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) as open,
             SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) as closed,
             SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM "Order"
      WHERE "openedAt" >= $1 AND "openedAt" <= $2
      GROUP BY 1
      ORDER BY 1 ASC
    `, start, end);

    const dailyPayments = await prisma.$queryRawUnsafe(`
      SELECT to_char(date_trunc('day',"paidAt"), 'YYYY-MM-DD') as day,
             SUM(CASE WHEN amount::numeric >= 0 THEN amount::numeric ELSE 0 END) as gross,
             SUM(CASE WHEN amount::numeric < 0 THEN ABS(amount::numeric) ELSE 0 END) as refunds
      FROM "Payment"
      WHERE "paidAt" >= $1 AND "paidAt" <= $2 AND currency = $3
      GROUP BY 1
      ORDER BY 1 ASC
    `, start, end, currency);

    const dailyOrdersMap = new Map(dailyOrders.map(r => [r.day, r]));
    const dailyPaymentsMap = new Map(dailyPayments.map(r => [r.day, r]));

    const dailySeries = days.map(day => {
      const od = dailyOrdersMap.get(day) || { open: 0, closed: 0, cancelled: 0 };
      const pd = dailyPaymentsMap.get(day) || { gross: 0, refunds: 0 };
      const gross = toNum(pd.gross, 0);
      const refunds = toNum(pd.refunds, 0);
      return {
        day,
        ordersOpen: Number(od.open || 0),
        ordersClosed: Number(od.closed || 0),
        ordersCancelled: Number(od.cancelled || 0),
        paymentsGross: round2(gross),
        paymentsRefunds: round2(refunds),
        paymentsNet: round2(gross - refunds),
      };
    });

    // RECENT TABLES
    const recentPayments = await prisma.payment.findMany({
      where: { currency, paidAt: { gte: start, lte: end } },
      select: { id: true, orderId: true, method: true, amount: true, tendered: true, change: true, paidAt: true },
      orderBy: { paidAt: 'desc' },
      take: 10,
    });

    const recentOrders = await prisma.order.findMany({
      where: { openedAt: { gte: start, lte: end } },
      select: { id: true, orderNumber: true, type: true, status: true, grandTotal: true, openedAt: true },
      orderBy: { openedAt: 'desc' },
      take: 10,
    });

    return {
      range: { from, to, currency },

      users: {
        total: usersTotal,
        active: usersActive,
        byRole: usersByRole.map(x => ({ role: x.role, count: x._count._all })),
      },

      counts: {
        open: openCount,
        closed: closedCount,
        cancelled: cancelledCount,
      },

      revenueClosed, // from closed orders
      taxClosed,

      payments: {
        gross: decStr(grossPayments),
        refunds: decStr(refundPayments),
        net: decStr(netPayments),
        refundsCount,
        byMethod: paymentsByMethod,
      },

      recent: {
        orders: recentOrders,
        payments: recentPayments,
        closedOrdersTop: closedOrders,
      },

      charts: {
        daily: dailySeries,
      },
    };
  },
};

export default DashboardService;
