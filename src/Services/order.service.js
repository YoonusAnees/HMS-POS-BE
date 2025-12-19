import prisma from '../Config/db.js';
import OrderModel from '../Models/order.model.js';
import OrderItemModel from '../Models/orderItem.model.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const decStr = (n) => round2(n).toFixed(2);

const VALID_TYPES = new Set(['dine_in', 'room', 'takeaway']);


const OrderService = {
  // async create(payload, openedById) {
  //   const items = payload.items || [];
  //   if (!items.length) throw new Error('Order must have items');

  //   const dbItems = await prisma.item.findMany({
  //     where: {
  //       id: { in: items.map((i) => i.itemId) },
  //       isActive: true,
  //     },
  //   });

  //   let subtotal = 0;
  //   let taxTotal = 0;

  //   const orderItems = items.map((i) => {
  //     const dbItem = dbItems.find((x) => x.id === i.itemId);
  //     if (!dbItem) throw new Error(`Item ${i.itemId} not found`);

  //     const qty = toNum(i.qty);
  //     const price = toNum(dbItem.price);
  //     const taxRate = toNum(dbItem.taxRate);

  //     const base = price * qty;
  //     const tax = base * (taxRate / 100);
  //     const total = base + tax;

  //     subtotal += base;
  //     taxTotal += tax;

  //     return {
  //       itemId: dbItem.id,
  //       itemName: dbItem.name,
  //       qty,
  //       unitPrice: decStr(price),
  //       taxRate: decStr(taxRate),
  //       discount: '0.00',
  //       lineTotal: decStr(total),
  //     };
  //   });

  //   const serviceCharge = round2(subtotal * 0.1);
  //   const grandTotal = round2(subtotal + taxTotal + serviceCharge);

  //   return prisma.order.create({
  //     data: {
  //       orderNumber: `ORD-${Date.now()}`,
  //       type: payload.type,
  //       status: 'open',
  //       tableId: payload.tableId || null,
  //       roomId: payload.roomId || null,
  //       openedById,
  //       subtotal: decStr(subtotal),
  //       taxTotal: decStr(taxTotal),
  //       discountTotal: '0.00',
  //       serviceCharge: decStr(serviceCharge),
  //       grandTotal: decStr(grandTotal),
  //       items: {
  //         create: orderItems,
  //       },
  //     },
  //     include: { items: true },
  //   });
  // },

  // getById: (id) => prisma.order.findUnique({
  //   where: { id },
  //   include: { items: true, payments: true },
  // }),

  // listOpen: () =>
  //   prisma.order.findMany({
  //     where: { status: 'open' },
  //     include: { items: true },
  //   }),

  // closeOrder: (id, closedById) =>
  //   prisma.order.update({
  //     where: { id },
  //     data: {
  //       status: 'closed',
  //       closedById,
  //       closedAt: new Date(),
  //     },
  //   }),


   async createOrder(payload, openedById) {
    if (!openedById) throw new Error('openedById missing (auth token?)');

    const type = String(payload.type || '');
    if (!VALID_TYPES.has(type)) throw new Error('Invalid type');

    const tableId = payload.tableId ? Number(payload.tableId) : null;
    const roomId = payload.roomId ? Number(payload.roomId) : null;

    if (type === 'dine_in' && !tableId) throw new Error('tableId is required for dine_in');
    if (type === 'room' && !roomId) throw new Error('roomId is required for room order');

    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length === 0) throw new Error('Order must have at least 1 item');

    const serviceChargeRate = toNum(payload.serviceChargeRate, 0); // percent
    const extraOrderDiscount = toNum(payload.discountTotal, 0);

    const itemIds = items.map((x) => Number(x.itemId)).filter(Boolean);

    const dbItems = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, price: true, taxRate: true, isActive: true },
    });

    const itemMap = new Map(dbItems.map((it) => [it.id, it]));

    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    const orderItemsData = items.map((line) => {
      const itemId = Number(line.itemId);
      const qty = Math.floor(toNum(line.qty, 0));
      if (!itemId || qty <= 0) throw new Error('Invalid itemId/qty');

      const it = itemMap.get(itemId);
      if (!it) throw new Error(`Item not found: ${itemId}`);
      if (!it.isActive) throw new Error(`Item inactive: ${itemId}`);

      const unitPrice = toNum(it.price, 0);
      const taxRate = toNum(it.taxRate, 0);
      const lineDiscount = toNum(line.discount, 0);

      const lineBase = unitPrice * qty;
      const baseAfterDiscount = Math.max(0, lineBase - lineDiscount);
      const lineTax = baseAfterDiscount * (taxRate / 100);
      const lineTotal = baseAfterDiscount + lineTax;

      subtotal += lineBase;
      discountTotal += lineDiscount;
      taxTotal += lineTax;

      return {
        itemId,
        itemName: it.name,
        qty,
        unitPrice: decStr(unitPrice),
        taxRate: decStr(taxRate),
        discount: decStr(lineDiscount),
        lineTotal: decStr(lineTotal),
      };
    });

    subtotal = round2(subtotal);
    taxTotal = round2(taxTotal);
    discountTotal = round2(discountTotal + extraOrderDiscount);

    const baseAfterDiscount = Math.max(0, subtotal - discountTotal);
    const serviceCharge = round2(baseAfterDiscount * (serviceChargeRate / 100));
    const grandTotal = round2(baseAfterDiscount + taxTotal + serviceCharge);

    const orderData = {
      orderNumber: `ORD-${Date.now()}`,
      type,
      status: 'open',
      tableId,
      roomId,
      openedById,
      subtotal: decStr(subtotal),
      taxTotal: decStr(taxTotal),
      discountTotal: decStr(discountTotal),
      serviceCharge: decStr(serviceCharge),
      grandTotal: decStr(grandTotal),
      items: { create: orderItemsData },
    };

    return prisma.$transaction(async (tx) => {
      // optional: if dine_in, mark table occupied
      if (type === 'dine_in' && tableId) {
        await tx.restaurantTable.update({
          where: { id: tableId },
          data: { status: 'occupied' },
        });
      }

      const order = await tx.order.create({
        data: orderData,
        include: { items: true, payments: true, table: true, room: true },
      });

      return order;
    });
  },

  async addItem(orderId, itemPayload) {
    const order = await OrderModel.findById(orderId);
    if (!order || order.status !== 'open') throw new Error('Order not found or not open');

    // NOTE: This API expects full numbers (unitPrice/taxRate). If you want it to re-fetch item price,
    // we can implement addItemByItemId too.
    const qty = Math.floor(toNum(itemPayload.qty, 0));
    const unitPrice = toNum(itemPayload.unitPrice, 0);
    const taxRate = toNum(itemPayload.taxRate, 0);
    const discount = toNum(itemPayload.discount, 0);

    if (qty <= 0) throw new Error('qty must be > 0');

    const lineBase = unitPrice * qty;
    const baseAfterDiscount = Math.max(0, lineBase - discount);
    const lineTax = baseAfterDiscount * (taxRate / 100);
    const lineTotal = baseAfterDiscount + lineTax;

    await OrderItemModel.addSingle({
      orderId: order.id,
      itemId: Number(itemPayload.itemId),
      itemName: String(itemPayload.itemName || 'Item'),
      qty,
      unitPrice: decStr(unitPrice),
      taxRate: decStr(taxRate),
      discount: decStr(discount),
      lineTotal: decStr(lineTotal),
    });

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });

    const subtotal = items.reduce((s, it) => s + toNum(it.unitPrice, 0) * toNum(it.qty, 0), 0);
    const discountTotal = items.reduce((s, it) => s + toNum(it.discount, 0), 0);
    const taxTotal = items.reduce((s, it) => {
      // derive tax from lineTotal - (baseAfterDiscount)
      const qty = toNum(it.qty, 0);
      const unitPrice = toNum(it.unitPrice, 0);
      const disc = toNum(it.discount, 0);
      const base = unitPrice * qty;
      const baseAfter = Math.max(0, base - disc);
      const lineTotal = toNum(it.lineTotal, 0);
      return s + Math.max(0, lineTotal - baseAfter);
    }, 0);

    const baseAfter = Math.max(0, subtotal - discountTotal);
    const serviceCharge = toNum(order.serviceCharge, 0); // keep existing SC unless you want recalc
    const grandTotal = baseAfter + taxTotal + serviceCharge;

    return OrderModel.update(order.id, {
      subtotal: decStr(subtotal),
      discountTotal: decStr(discountTotal),
      taxTotal: decStr(taxTotal),
      grandTotal: decStr(grandTotal),
    });
  },

  getById: (id) => OrderModel.findById(id),
  listOpen: () => OrderModel.listOpen(),
  listAll: () => OrderModel.listAll(),
  
};

export default OrderService;
