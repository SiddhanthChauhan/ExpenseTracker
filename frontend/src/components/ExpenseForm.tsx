'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCreateExpense } from '../lib/hooks';

export default function ExpenseForm() {
    // Generate today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localDate = new Date(now.getTime() - offsetMs);
        return localDate.toISOString().split('T')[0];
    };
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(getTodayDate());

    const mutation = useCreateExpense();
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Engineering logic remains strict: decimal to integer conversion
        const amountInPaise = Math.round(parseFloat(amount) * 100);

        // Trigger the bulletproof mutation
        mutation.mutate(
            {
                amount: amountInPaise,
                category,
                description: description || null,
                date,
                idempotency_key: idempotencyKey, // Core idempotency rule
            },
            {
                onSuccess: () => {
                    setAmount('');
                    setCategory('');
                    setDescription('');
                    setDate(getTodayDate());
                    setIdempotencyKey(uuidv4());
                },
            }
        );
    };

    return (
        // Card Style: Deep navy background, rounded, bordered, subtle shadow (Aesthetic inspired by image)
        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-6 text-slate-50 tracking-tight">Add New Expense</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        // Input Style: Dark background, light border, crisp contrast text
                        className="w-full p-3.5 bg-slate-800/50 border border-slate-700/70 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-slate-800 outline-none text-slate-50 text-base placeholder-slate-600 transition-colors"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                    <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3.5 bg-slate-800/50 border border-slate-700/70 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-slate-800 outline-none text-slate-50 text-base placeholder-slate-600 transition-colors appearance-none"
                    >
                        <option value="" disabled className="text-slate-500">Select category</option>
                        <option value="Food" className="text-slate-900 bg-white">Food</option>
                        <option value="Travel" className="text-slate-900 bg-white">Travel</option>
                        <option value="Entertainment" className="text-slate-900 bg-white">Entertainment</option>
                        <option value="Utilities" className="text-slate-900 bg-white">Utilities</option>
                        <option value="Other" className="text-slate-900 bg-white">Other</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3.5 bg-slate-800/50 border border-slate-700/70 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-slate-800 outline-none text-slate-50 text-base placeholder-slate-600 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Description (Optional)</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3.5 bg-slate-800/50 border border-slate-700/70 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-slate-800 outline-none text-slate-50 text-base placeholder-slate-600 transition-colors"
                        placeholder="What was this for?"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={mutation.isPending}
                // Button Style: Bold, modern color (Teal from your image), modern transition
                className="w-full bg-teal-500 text-slate-950 font-semibold py-3.5 px-6 rounded-xl hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 transition-colors duration-200 text-base shadow-lg"
            >
                {mutation.isPending ? 'Adding...' : 'Add Expense'}
            </button>

            {/* Production UX detail: Simple but effective error handling */}
            {mutation.isError && (
                <p className="text-rose-400 text-sm mt-3 text-center">Error: {mutation.error.message}</p>
            )}
        </form>
    );
}