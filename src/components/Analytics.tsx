import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { layoutStyles, commonStyles } from "@/styles";

/**
 * Analytics page with the same paper theme as the main budget app
 * Eventually will contain charts and expense analytics grouped by categories
 */
export default function Analytics() {
  return (
    <div className={layoutStyles.appContainer}>
      {/* Header section */}
      <div className="mx-auto max-w-7xl px-1 sm:px-2 pt-4 sm:pt-6 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.1)] handwriting">
            📊 Analytics Dashboard
          </h1>
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl px-1 sm:px-2 pb-12">
        {/* Coming soon cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Expense Categories Card */}
          <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300/70 rounded-2xl p-6 shadow-xl overflow-hidden">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_1px_1px,rgba(139,69,19,0.3)_1px,transparent_0)] bg-[length:12px_12px] rounded-2xl pointer-events-none"></div>

            {/* Yellow tape effect */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-300/60 rounded-sm shadow-sm transform rotate-3"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-8 h-8 text-amber-600" />
                <h2 className="text-xl font-bold text-stone-800 handwriting">Expense Categories</h2>
              </div>
              <p className="text-stone-600 handwriting">
                Visualize your spending patterns across different categories like groceries, entertainment, utilities, and more.
              </p>
              <div className="mt-4 text-sm text-amber-700 font-medium handwriting">
                📈 Coming Soon
              </div>
            </div>
          </div>

          {/* Monthly Trends Card */}
          <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 border-2 border-blue-300/70 rounded-2xl p-6 shadow-xl overflow-hidden">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.3)_1px,transparent_0)] bg-[length:12px_12px] rounded-2xl pointer-events-none"></div>

            {/* Blue tape effect */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-blue-300/60 rounded-sm shadow-sm transform -rotate-2"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h2 className="text-xl font-bold text-stone-800 handwriting">Monthly Trends</h2>
              </div>
              <p className="text-stone-600 handwriting">
                Track your spending habits over time and identify patterns in your budget allocation and expenses.
              </p>
              <div className="mt-4 text-sm text-blue-700 font-medium handwriting">
                📊 Coming Soon
              </div>
            </div>
          </div>

          {/* Budget Performance Card */}
          <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300/70 rounded-2xl p-6 shadow-xl overflow-hidden">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.3)_1px,transparent_0)] bg-[length:12px_12px] rounded-2xl pointer-events-none"></div>

            {/* Green tape effect */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-green-300/60 rounded-sm shadow-sm transform rotate-1"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <h2 className="text-xl font-bold text-stone-800 handwriting">Budget Performance</h2>
              </div>
              <p className="text-stone-600 handwriting">
                Analyze how well you stick to your budget goals and identify areas for improvement.
              </p>
              <div className="mt-4 text-sm text-green-700 font-medium handwriting">
                💡 Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="mt-12 text-center">
          <div className="relative bg-gradient-to-br from-stone-50 via-neutral-50 to-slate-50 border-2 border-stone-300/70 rounded-2xl p-8 shadow-xl overflow-hidden max-w-2xl mx-auto">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_1px_1px,rgba(120,113,108,0.3)_1px,transparent_0)] bg-[length:12px_12px] rounded-2xl pointer-events-none"></div>

            {/* Torn edge effect */}
            <div className="absolute -top-1 left-4 right-4 h-3 bg-[repeating-linear-gradient(90deg,#d6d3d1,#d6d3d1_8px,#e7e5e4_8px,#e7e5e4_16px)] rounded-t-2xl opacity-70"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-stone-800 handwriting mb-4">
                🚧 Analytics Dashboard Under Construction
              </h3>
              <p className="text-stone-600 handwriting text-lg leading-relaxed">
                This analytics dashboard will soon feature interactive charts, expense breakdowns by category,
                spending trends over time, budget performance metrics, and much more to help you understand
                your financial habits better.
              </p>
              <div className="mt-6 text-stone-500 handwriting">
                Stay tuned for awesome insights! 📈✨
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}