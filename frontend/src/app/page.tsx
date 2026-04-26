'use client';

import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import SummaryChart from '../components/SummaryChart';
import { useExpenses } from '../lib/hooks';

export default function Home() {
  const { data: expenses } = useExpenses();

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight mb-2">
              Expense<span className="text-teal-400">Tracker</span>
            </h1>
            <p className="text-slate-400">Production-grade financial oversight.</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Version 1.0.4 // System Active</span>
          </div>
        </header>

        <main className="space-y-8">
          {/* Top Row: Form and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <ExpenseForm />
            </div>
            <div className="lg:col-span-2">
              <SummaryChart expenses={expenses || []} />
            </div>
          </div>

          {/* Bottom Row: Full-width list */}
          <div className="w-full">
            <ExpenseList />
          </div>
        </main>

      </div>
    </div>
  );
}