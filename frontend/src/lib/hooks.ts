import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpenses, createExpense } from './api';

// --- THE READ HOOK ---
// useQuery is for GETting data. 
// The 'queryKey' is like a cache identifier. If category or sort changes, 
// TanStack knows it needs to fetch fresh data automatically.
export function useExpenses(category?: string, sort?: string) {
  return useQuery({
    queryKey: ['expenses', category, sort],
    queryFn: () => fetchExpenses(category, sort),
  });
}

// --- THE WRITE HOOK ---
// useMutation is for POST/PUT/DELETE operations.
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      // MAGIC: When a new expense is successfully created, we tell TanStack Query 
      // to "invalidate" the old 'expenses' cache. This forces the list UI to 
      // instantly re-fetch and show the newly added item. No manual state updates needed!
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}