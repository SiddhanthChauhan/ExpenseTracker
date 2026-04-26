import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

export default function Home() {
  return (
    // Global dark background wrapper
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight mb-2">
            Expense<span className="text-teal-400">Tracker</span>
          </h1>
          <p className="text-slate-400">Track your spending with precision.</p>
        </header>

        {/* The two main components */}
        <main className="space-y-8">
          <ExpenseForm />
          <ExpenseList />
        </main>

      </div>
    </div>
  );
}