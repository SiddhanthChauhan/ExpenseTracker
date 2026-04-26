export interface Expense {
  id: number;
  amount: number; // Remember: this is in paise!
  category: string;
  description: string | null;
  date: string;
  idempotency_key: string;
  created_at: string;
}

export type CreateExpensePayload = Omit<Expense, 'id' | 'created_at'>;