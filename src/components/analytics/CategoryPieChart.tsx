import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryAnalytics } from '@/utils/analytics';
import { chartColors, formatCurrency, formatPercentage } from '@/utils/analytics';
import { paperTheme } from '@/styles';

interface CategoryPieChartProps {
  data: CategoryAnalytics[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`${paperTheme.colors.background.white} ${paperTheme.colors.borders.paper} ${paperTheme.radius.md} p-3 ${paperTheme.effects.shadow.md}`}>
          <p className={`font-semibold ${paperTheme.colors.text.primary} ${paperTheme.fonts.handwriting}`}>
            {data.category}
          </p>
          <p className={`${paperTheme.colors.text.accent} text-sm`}>
            {formatCurrency(data.amount)} ({formatPercentage(data.percentage)})
          </p>
          <p className={`${paperTheme.colors.text.muted} text-xs`}>
            {data.count} transaction{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = (props: any) => {
    if (props.percentage < 5) return ''; // Hide labels for small slices
    return `${props.category} (${formatPercentage(props.percentage)})`;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className={`${paperTheme.colors.text.muted} ${paperTheme.fonts.handwriting} text-lg`}>
          No spending data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="amount"
          stroke="#fff"
          strokeWidth={2}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors.mixed[index % chartColors.mixed.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className={`${paperTheme.fonts.handwriting} text-sm ${paperTheme.colors.text.secondary}`}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}