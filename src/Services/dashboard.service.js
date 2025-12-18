import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const DashboardService = {
  async summary(fromStr, toStr) {
    const from = new Date(`${fromStr}T00:00:00.000`);
    const to = new Date(`${toStr}T23:59:59.999`);

    const orders = await prisma.order.findMany({
      where: { openedAt: { gte: from, lte: to } },
      select: { status: true, grandTotal: true, taxTotal: true, openedAt: true },
    });

    const counts = { open: 0, closed: 0, cancelled: 0 };
    let revenueClosed = 0;
    let taxClosed = 0;

    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
      if (o.status === 'closed') {
        revenueClosed += toNum(o.grandTotal, 0);
        taxClosed += toNum(o.taxTotal, 0);
      }
    }

    const daily = new Map();
    for (const o of orders) {
      if (o.status !== 'closed') continue;
      const key = new Date(o.openedAt).toISOString().slice(0, 10);
      daily.set(key, (daily.get(key) || 0) + toNum(o.grandTotal, 0));
    }

    const revenueSeries = Array.from(daily.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue: decStr(revenue) }));

    return {
      range: { from: fromStr, to: toStr },
      counts,
      revenueClosed: decStr(revenueClosed),
      taxClosed: decStr(taxClosed),
      revenueSeries,
    };
  },
};

export default DashboardService;
