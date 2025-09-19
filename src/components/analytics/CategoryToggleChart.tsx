import { useState } from 'react';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import type { CategoryAnalytics } from '@/utils/analytics';
import { CategoryPieChart } from './CategoryPieChart';
import { CategoryBarChart } from './CategoryBarChart';

interface CategoryToggleChartProps {
  data: CategoryAnalytics[];
}

export function CategoryToggleChart({ data }: CategoryToggleChartProps) {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');

  return (
    <div>
      {/* Toggle Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {viewMode === 'pie' ? (
            <PieChartIcon className="w-8 h-8 text-amber-600" />
          ) : (
            <BarChart3 className="w-8 h-8 text-amber-600" />
          )}
          <h2 className="text-xl font-bold text-stone-800 handwriting">
            {viewMode === 'pie' ? 'Spending by Category' : 'Category Totals'}
          </h2>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-white/40 rounded-lg p-1 border border-amber-200">
          <button
            onClick={() => setViewMode('pie')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'pie'
                ? 'bg-amber-100 text-amber-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-800 hover:bg-white/60'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Pie
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'bar'
                ? 'bg-amber-100 text-amber-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-800 hover:bg-white/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Bar
          </button>
        </div>
      </div>

      {/* Chart Content */}
      {viewMode === 'pie' ? (
        <CategoryPieChart data={data} />
      ) : (
        <CategoryBarChart data={data} />
      )}
    </div>
  );
}