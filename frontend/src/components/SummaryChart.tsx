'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense } from '../types';

interface SummaryChartProps {
  expenses: Expense[];
}

// Professional color palette matching our dark slate/teal theme
const COLORS = ['#2dd4bf', '#818cf8', '#c084fc', '#fb7185', '#94a3b8'];

export default function SummaryChart({ expenses }: SummaryChartProps) {
  // Efficiently aggregate totals by category
  const dataMap = expenses.reduce((acc: { [key: string]: number }, curr) => {
    const category = curr.category;
    acc[category] = (acc[category] || 0) + curr.amount;
    return acc;
  }, {});

  // Transform into Recharts-friendly format and convert paise to rupees
  const chartData = Object.keys(dataMap).map((name) => ({
    name,
    value: dataMap[name] / 100, 
  }));

  if (expenses.length === 0) return null;

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col">
      <h3 className="text-xl font-bold text-slate-50 mb-6 tracking-tight">Spending Breakdown</h3>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
              formatter={(value) => `₹${Number(value ?? 0).toFixed(2)}`}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}