'use client';

import { useState } from 'react';
import { useExpenses } from '../lib/hooks';
import { Expense } from '../types';

export default function ExpenseList() {
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('date_desc');

  // TanStack Query will automatically refetch when category or sort state changes!
  const { data: expenses, isLoading, isError, error } = useExpenses(category, sort);

  // Calculate total of VISIBLE expenses. 
  // Crucial step: Divide by 100 because the DB stores integers (paise)
  const totalAmount = expenses 
    ? expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0) / 100 
    : 0;

  if (isError) return <div className="text-rose-400 p-4 bg-rose-400/10 rounded-xl border border-rose-400/20">Failed to load expenses: {error.message}</div>;

  return (
    <div className="bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl mt-8">
      
      {/* Header & Total */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Recent Expenses</h2>
        <div className="bg-slate-800/80 px-5 py-3 rounded-xl border border-slate-700 flex items-center gap-3">
          <span className="text-slate-400 text-sm font-medium">Total:</span>
          {isLoading ? (
            <div className="w-16 h-6 bg-slate-700 animate-pulse rounded"></div>
          ) : (
            <span className="text-xl font-bold text-teal-400">₹{totalAmount.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Filters & Sorting Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter by Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-slate-200 text-sm appearance-none transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-slate-200 text-sm appearance-none transition-colors"
          >
            <option value="date_desc">Newest First</option>
            <option value="">Oldest First</option>
          </select>
        </div>
      </div>

      {/* The List */}
      <div className="space-y-3">
        {isLoading ? (
           // Skeleton Loading State
           [1, 2, 3].map(i => (
             <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-xl border border-slate-700/50"></div>
           ))
        ) : expenses?.length === 0 ? (
          // Empty State
          <div className="text-center py-12 text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800 border-dashed">
            No expenses found.
          </div>
        ) : (
          expenses?.map((expense: Expense) => (
            <div key={expense.id} className="group flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 transition-all duration-200">
              
              <div className="mb-3 md:mb-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-slate-200 font-medium">{expense.category}</span>
                  <span className="text-xs px-2.5 py-0.5 bg-slate-900 text-slate-400 rounded-full border border-slate-700">
                    {expense.date}
                  </span>
                </div>
                {expense.description && (
                  <p className="text-sm text-slate-500">{expense.description}</p>
                )}
              </div>

              <div className="text-lg font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                ₹{(expense.amount / 100).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}