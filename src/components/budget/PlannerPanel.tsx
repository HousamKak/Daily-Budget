import { useState } from "react";
import { CalendarIcon } from "./Icons";
import { weekIndexOf } from "./utils";
import { DraftView } from "./DraftView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import type { Expense, PlanItem } from "@/lib/data-service";

interface PlannerPanelProps {
  year: number;
  month: number;
  monthKeyStr: string;
  weekCount: number;
  todaysWeek: number;
  plans: PlanItem[];
  expenses: Expense[];
  budget: number;
  onAdd: (p: Omit<PlanItem, "id">) => void;
  onUpdate: (id: string, patch: Partial<PlanItem>) => void;
  onRemove: (id: string) => void;
  onMarkPaid: (p: PlanItem) => void;
}

interface DraftItem {
  id: string;
  note: string;
  amount?: number;
  category?: string;
  date?: string;
}

export function PlannerPanel({
  year,
  month,
  monthKeyStr,
  weekCount,
  todaysWeek,
  plans,
  expenses,
  budget,
  onAdd,
  onUpdate,
  onRemove,
  onMarkPaid,
}: PlannerPanelProps) {
  const [viewMode, setViewMode] = useState<'draft' | 'week' | 'month'>('draft');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  function handleAddFromDraft(item: Omit<PlanItem, "id" | "monthKey" | "weekIndex">) {
    let wk = todaysWeek;
    if (item.targetDate) {
      const [Y, M, D] = item.targetDate.split("-").map(Number);
      const w = weekIndexOf(Y, M - 1, D);
      wk = w;
    }
    onAdd({
      ...item,
      monthKey: monthKeyStr,
      weekIndex: wk,
      amount: Number(item.amount.toFixed(2))
    });
  }

  function addDraftItem(item: Omit<DraftItem, "id">) {
    const newItem: DraftItem = {
      ...item,
      id: Date.now().toString(),
    };
    setDraftItems(prev => [...prev, newItem]);
  }

  function updateDraftItem(id: string, updates: Partial<DraftItem>) {
    setDraftItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }

  function removeDraftItem(id: string) {
    setDraftItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="bg-white/70 border-2 border-amber-200 rounded-2xl shadow-sm">
      {/* Header with navigation */}
      <div className="sticky top-0 z-10 p-3 border-b-2 border-amber-200 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="w-5 h-5 text-stone-600" />
          <h2
            className="font-bold text-lg"
            style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
          >
            Financial Planner
          </h2>
        </div>

        {/* Three-way toggle selector */}
        <div className="relative bg-amber-100/50 rounded-lg p-1">
          {/* Sliding background indicator */}
          <div
            className={`absolute top-1 h-8 w-1/3 bg-white shadow-sm rounded-md transition-all duration-300 ease-in-out ${
              viewMode === 'draft' ? 'left-1' : viewMode === 'week' ? 'left-1/3' : 'left-2/3'
            }`}
          />

          {/* Toggle buttons */}
          <div className="relative flex">
            <button
              onClick={() => setViewMode('draft')}
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer ${
                viewMode === 'draft'
                  ? 'text-stone-900'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer ${
                viewMode === 'week'
                  ? 'text-stone-900'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer ${
                viewMode === 'month'
                  ? 'text-stone-900'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Content based on selected view */}
      <div className="min-h-[400px]">
        {viewMode === 'draft' && (
          <DraftView
            onAddToPlan={handleAddFromDraft}
            draftItems={draftItems}
            onAddDraftItem={addDraftItem}
            onUpdateDraftItem={updateDraftItem}
            onRemoveDraftItem={removeDraftItem}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            year={year}
            month={month}
            weekCount={weekCount}
            todaysWeek={todaysWeek}
            plans={plans}
            expenses={expenses}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onMarkPaid={onMarkPaid}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            year={year}
            month={month}
            weekCount={weekCount}
            plans={plans}
            expenses={expenses}
            budget={budget}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onMarkPaid={onMarkPaid}
          />
        )}
      </div>
    </div>
  );
}