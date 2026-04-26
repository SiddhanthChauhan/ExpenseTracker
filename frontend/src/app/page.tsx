'use client'; // Required because we are using a TanStack Query hook

import { useExpenses } from '../lib/hooks';

export default function Home() {
  // Call our TanStack hook!
  const { data: expenses, isLoading, isError, error } = useExpenses();

  if (isLoading) return <div className="p-8">Loading from backend...</div>;
  if (isError) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Frontend Data Layer Test</h1>
      <p className="mb-4 text-green-600">If you see your database JSON below, TanStack Query is successfully connected!</p>
      
      {/* Dump the raw JSON data to the screen */}
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(expenses, null, 2)}
      </pre>
    </div>
  );
}