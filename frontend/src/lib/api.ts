import { Expense, CreateExpensePayload } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchExpenses(category?: string, sort?: string): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (sort) params.append('sort', sort);

  const url = `${API_URL}/expenses${params.toString() ? `?${params.toString()}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(payload: CreateExpensePayload & { idempotency_key: string }): Promise<Expense> {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create expense');
  }
  return res.json();
}