import prisma from '../Config/db.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const OrderService = {
  async create(payload, openedById) {
    const items = payload.items || [];
    if (!items.length) throw new Error('Order must have items');

    const dbItems = await prisma.item.findMany({
      where: {
        id: { in: items.map((i) => i.itemId) },
        isActive: true,
      },
    });

    let subtotal = 0;
    let taxTotal = 0;

    const orderItems = items.map((i) => {
      const dbItem = dbItems.find((x) => x.id === i.itemId);
      if (!dbItem) throw new Error(`Item ${i.itemId} not found`);

      const qty = toNum(i.qty);
      const price = toNum(dbItem.price);
      const taxRate = toNum(dbItem.taxRate);

      const base = price * qty;
      const tax = base * (taxRate / 100);
      const total = base + tax;

      subtotal += base;
      taxTotal += tax;

      return {
        itemId: dbItem.id,
        itemName: dbItem.name,
        qty,
        unitPrice: decStr(price),
        taxRate: decStr(taxRate),
        discount: '0.00',
        lineTotal: decStr(total),
      };
    });

    const serviceCharge = round2(subtotal * 0.1);
    const grandTotal = round2(subtotal + taxTotal + serviceCharge);

    return prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        type: payload.type,
        status: 'open',
        tableId: payload.tableId || null,
        roomId: payload.roomId || null,
        openedById,
        subtotal: decStr(subtotal),
        taxTotal: decStr(taxTotal),
        discountTotal: '0.00',
        serviceCharge: decStr(serviceCharge),
        grandTotal: decStr(grandTotal),
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });
  },

  getById: (id) => prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true },
  }),

  listOpen: () =>
    prisma.order.findMany({
      where: { status: 'open' },
      include: { items: true },
    }),

  closeOrder: (id, closedById) =>
    prisma.order.update({
      where: { id },
      data: {
        status: 'closed',
        closedById,
        closedAt: new Date(),
      },
    }),
};

export default OrderService;
