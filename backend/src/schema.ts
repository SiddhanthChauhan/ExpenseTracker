import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer (paise)"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  idempotency_key: z.string().uuid("Must be a valid UUID")
});