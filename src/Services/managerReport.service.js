import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const ManagerReportService = {
  async summary({ from, to, currency = 'LKR' }) {
    if (!from || !to) throw new Error('from and to are required (YYYY-MM-DD)');

    const start = new Date(`${from}T00:00:00.000Z`);
    const end = new Date(`${to}T23:59:59.999Z`);

    // Closed orders (range)
    const ordersClosed = await prisma.order.count({
      where: { status: 'closed', closedAt: { gte: start, lte: end } },
    });

    const orders = await prisma.order.findMany({
      where: { status: 'closed', closedAt: { gte: start, lte: end } },
      select: { grandTotal: true, taxTotal: true },
    });

    const revenueNet = orders.reduce((s, o) => s + toNum(o.grandTotal, 0), 0);
    const taxTotal = orders.reduce((s, o) => s + toNum(o.taxTotal, 0), 0);

    // Payments (includes refunds as negative)
    const payments = await prisma.payment.findMany({
      where: { currency, paidAt: { gte: start, lte: end } },
      select: { amount: true, method: true, paidAt: true },
    });

    const grossPayments = payments
      .filter((p) => toNum(p.amount) > 0)
      .reduce((s, p) => s + toNum(p.amount), 0);

    const refundPayments = payments
      .filter((p) => toNum(p.amount) < 0)
      .reduce((s, p) => s + Math.abs(toNum(p.amount)), 0);

    const netPayments = grossPayments - refundPayments;

    // Totals by method
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

    // Top selling items (Top 20 by qty)
    const topItemsRaw = await prisma.orderItem.groupBy({
      by: ['itemId', 'itemName'],
      where: {
        order: { status: 'closed', closedAt: { gte: start, lte: end } },
      },
      _sum: { qty: true, lineTotal: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 20,
    });

    const topItems = topItemsRaw.map((x) => ({
      itemId: x.itemId,
      itemName: x.itemName,
      qty: Number(x._sum.qty || 0),
      revenue: Number(x._sum.lineTotal || 0),
    }));

    // Daily payments trend (gross/refunds/net)
    const dailyRows = await prisma.$queryRawUnsafe(
      `
      SELECT to_char(date_trunc('day',"paidAt"), 'YYYY-MM-DD') as day,
             SUM(CASE WHEN amount::numeric >= 0 THEN amount::numeric ELSE 0 END) as gross,
             SUM(CASE WHEN amount::numeric < 0 THEN ABS(amount::numeric) ELSE 0 END) as refunds
      FROM "Payment"
      WHERE "paidAt" >= $1 AND "paidAt" <= $2 AND currency = $3
      GROUP BY 1
      ORDER BY 1 ASC
      `,
      start,
      end,
      currency
    );

    const daily = dailyRows.map((r) => {
      const gross = toNum(r.gross, 0);
      const refunds = toNum(r.refunds, 0);
      return {
        day: r.day,
        gross: round2(gross),
        refunds: round2(refunds),
        net: round2(gross - refunds),
      };
    });

    return {
      range: { from, to, currency },
      ordersClosed,
      revenueNet: decStr(revenueNet),
      taxTotal: decStr(taxTotal),

      grossPayments: decStr(grossPayments),
      refundPayments: decStr(refundPayments),
      netPayments: decStr(netPayments),

      totalsByMethod,
      topItems,
      daily,
    };
  },
};

export default ManagerReportService;
