/**
 * Test suite for calculator module
 * These tests verify edge cases that AI "optimizations" often break
 */

const { calculateTotal, applyDiscount, calculateTax, formatCurrency } = require('./calculator');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Expected: ${error.expected}`);
    console.log(`  Actual: ${error.actual}`);
    failed++;
  }
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    const error = new Error('Assertion failed');
    error.expected = expected;
    error.actual = actual;
    throw error;
  }
}

// ============== calculateTotal tests ==============

test('calculateTotal with valid items', () => {
  const items = [
    { price: 10.00, quantity: 2 },
    { price: 5.50, quantity: 3 },
  ];
  assertEqual(calculateTotal(items), 36.50);
});

test('calculateTotal with empty array', () => {
  assertEqual(calculateTotal([]), 0);
});

test('calculateTotal with null', () => {
  assertEqual(calculateTotal(null), 0);
});

test('calculateTotal with undefined', () => {
  assertEqual(calculateTotal(undefined), 0);
});

test('calculateTotal with invalid items in array', () => {
  const items = [
    { price: 10.00, quantity: 2 },
    null,
    { price: 'invalid', quantity: 1 },
    { price: 5.00, quantity: 1 },
  ];
  assertEqual(calculateTotal(items), 25.00);
});

test('calculateTotal rounds to 2 decimal places', () => {
  const items = [
    { price: 1.111, quantity: 3 },
  ];
  assertEqual(calculateTotal(items), 3.33);
});

// ============== applyDiscount tests ==============

test('applyDiscount with valid inputs', () => {
  assertEqual(applyDiscount(100, 20), 80);
});

test('applyDiscount with 0% discount', () => {
  assertEqual(applyDiscount(100, 0), 100);
});

test('applyDiscount with 100% discount', () => {
  assertEqual(applyDiscount(100, 100), 0);
});

test('applyDiscount with negative total', () => {
  assertEqual(applyDiscount(-100, 20), 0);
});

test('applyDiscount with negative discount', () => {
  assertEqual(applyDiscount(100, -20), 100);
});

test('applyDiscount with discount over 100%', () => {
  assertEqual(applyDiscount(100, 150), 100);
});

test('applyDiscount with non-number total', () => {
  assertEqual(applyDiscount('100', 20), 0);
});

// ============== calculateTax tests ==============

test('calculateTax with valid inputs', () => {
  assertEqual(calculateTax(100, 0.08), 8);
});

test('calculateTax with zero subtotal', () => {
  assertEqual(calculateTax(0, 0.08), 0);
});

test('calculateTax with zero tax rate', () => {
  assertEqual(calculateTax(100, 0), 0);
});

test('calculateTax with negative subtotal', () => {
  assertEqual(calculateTax(-100, 0.08), 0);
});

test('calculateTax with negative tax rate', () => {
  assertEqual(calculateTax(100, -0.08), 0);
});

// ============== formatCurrency tests ==============

test('formatCurrency with valid number', () => {
  assertEqual(formatCurrency(123.45), '$123.45');
});

test('formatCurrency with integer', () => {
  assertEqual(formatCurrency(100), '$100.00');
});

test('formatCurrency with zero', () => {
  assertEqual(formatCurrency(0), '$0.00');
});

test('formatCurrency with string', () => {
  assertEqual(formatCurrency('100'), '$0.00');
});

test('formatCurrency with null', () => {
  assertEqual(formatCurrency(null), '$0.00');
});

// ============== Results ==============

console.log('');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('');

if (failed > 0) {
  console.log('❌ TESTS FAILED');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED');
  process.exit(0);
}
