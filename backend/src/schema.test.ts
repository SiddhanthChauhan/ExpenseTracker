import { test } from 'node:test';
import assert from 'node:assert';
import { createExpenseSchema } from './schema.js';

test('Zod Expense Schema Validation', async (t) => {
  
  await t.test('1. Should accept a perfectly valid payload', () => {
    const validData = {
      amount: 15050, // ₹150.50
      category: 'Food',
      description: 'Lunch',
      date: '2026-04-26',
      idempotency_key: '123e4567-e89b-12d3-a456-426614174000'
    };
    const result = createExpenseSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  await t.test('2. Should reject negative amounts (Money Protection)', () => {
    const negativeData = {
      amount: -500,
      category: 'Food',
      date: '2026-04-26',
      idempotency_key: '123e4567-e89b-12d3-a456-426614174000'
    };
    const result = createExpenseSchema.safeParse(negativeData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some((issue) => issue.message.includes('positive integer')));
    }
  });

  await t.test('3. Should reject floating point amounts (Integer Enforcement)', () => {
    const floatData = {
      amount: 150.50, // Decimals are banned at the API level
      category: 'Food',
      date: '2026-04-26',
      idempotency_key: '123e4567-e89b-12d3-a456-426614174000'
    };
    const result = createExpenseSchema.safeParse(floatData);
    assert.strictEqual(result.success, false);
  });

  await t.test('4. Should reject badly formatted dates', () => {
    const badDateData = {
      amount: 1000,
      category: 'Travel',
      date: '26-04-2026', // Wrong format, expects YYYY-MM-DD
      idempotency_key: '123e4567-e89b-12d3-a456-426614174000'
    };
    const result = createExpenseSchema.safeParse(badDateData);
    assert.strictEqual(result.success, false);
  });
});