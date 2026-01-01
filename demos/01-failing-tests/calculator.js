/**
 * Calculator module - Demo target for AI "optimization"
 * 
 * This code is intentionally simple and correct.
 * The demo shows what happens when AI "optimizes" it and breaks edge cases.
 */

function calculateTotal(items) {
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  
  let total = 0;
  for (const item of items) {
    if (item && typeof item.price === 'number' && typeof item.quantity === 'number') {
      total += item.price * item.quantity;
    }
  }
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

function applyDiscount(total, discountPercent) {
  if (typeof total !== 'number' || total < 0) {
    return 0;
  }
  
  if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
    return total;
  }
  
  const discount = total * (discountPercent / 100);
  return Math.round((total - discount) * 100) / 100;
}

function calculateTax(subtotal, taxRate) {
  if (typeof subtotal !== 'number' || subtotal < 0) {
    return 0;
  }
  
  if (typeof taxRate !== 'number' || taxRate < 0) {
    return 0;
  }
  
  return Math.round(subtotal * taxRate * 100) / 100;
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    return '$0.00';
  }
  
  return '$' + amount.toFixed(2);
}

module.exports = {
  calculateTotal,
  applyDiscount,
  calculateTax,
  formatCurrency,
};
