// src/utils/calcTotals.js

function calculateOrderTotals(items, serviceChargeRate = 0) {
  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const line = Number(item.unitPrice) * item.qty;
    const discount = Number(item.discount || 0);
    const taxable = line - discount;
    const tax = taxable * Number(item.taxRate || 0) / 100;

    subtotal += line;
    taxTotal += tax;
    discountTotal += discount;
  }

  const serviceCharge = subtotal * (serviceChargeRate / 100);
  const grandTotal = subtotal - discountTotal + taxTotal + serviceCharge;

  return {
    subtotal:      subtotal.toFixed(2),
    taxTotal:      taxTotal.toFixed(2),
    discountTotal: discountTotal.toFixed(2),
    serviceCharge: serviceCharge.toFixed(2),
    grandTotal:    grandTotal.toFixed(2),
  };
}

export default calculateOrderTotals;
