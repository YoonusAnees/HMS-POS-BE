import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const ReportService = {
  async endOfDay(dateStr, currency = 'LKR') {
    const start = new Date(`${dateStr}T00:00:00.000`);
    const end = new Date(`${dateStr}T23:59:59.999`);

    const payments = await prisma.payment.findMany({
      where: { currency, paidAt: { gte: start, lte: end } },
      select: { method: true, amount: true },
    });

    const byMethod = new Map();
    for (const p of payments) {
      const amt = toNum(p.amount, 0);
      const entry = byMethod.get(p.method) || { gross: 0, refunds: 0 };
      if (amt >= 0) entry.gross += amt;
      else entry.refunds += Math.abs(amt);
      byMethod.set(p.method, entry);
    }

    const totalsByMethod = Array.from(byMethod.entries()).map(([method, v]) => ({
      method,
      gross: decStr(v.gross),
      refunds: decStr(v.refunds),
      net: decStr(v.gross - v.refunds),
    }));

    const ordersClosed = await prisma.order.count({
      where: { status: 'closed', closedAt: { gte: start, lte: end } },
    });

    const orders = await prisma.order.findMany({
      where: { status: 'closed', closedAt: { gte: start, lte: end } },
      select: { grandTotal: true, taxTotal: true },
    });

    const revenueNet = orders.reduce((s, o) => s + toNum(o.grandTotal, 0), 0);
    const taxTotal = orders.reduce((s, o) => s + toNum(o.taxTotal, 0), 0);

    return {
      date: dateStr,
      currency,
      totalsByMethod,
      ordersClosed,
      revenueNet: decStr(revenueNet),
      taxTotal: decStr(taxTotal),
    };
  },
};

export default ReportService;
