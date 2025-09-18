import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash } from "./Icons";
import { CATEGORIES } from "./constants";
import { makeId, monStartOffset, daysInMonth, weekIndexOf } from "./utils";
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
  const [weekIndex, setWeekIndex] = useState<number>(todaysWeek);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("groceries");
  const [note, setNote] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [formExpanded, setFormExpanded] = useState<boolean>(true);
  const [itemsExpanded, setItemsExpanded] = useState<boolean>(true);
  const [showAllItemsModal, setShowAllItemsModal] = useState<boolean>(false);

  const labelForWeek = (i: number) => {
    const off = monStartOffset(year, month);
    const startDay = i * 7 - off + 1; // may be <=0
    const endDay = Math.min(daysInMonth(year, month), startDay + 6);
    const safeStart = Math.max(1, startDay);
    return `Week ${i + 1} (${safeStart}-${endDay})`;
  };

  const thisWeekItems = plans.filter((p) => p.weekIndex === weekIndex);

  // Financial summary helpers
  function getWeekDateRange(wkIndex: number) {
    const off = monStartOffset(year, month);
    const startDay = Math.max(1, wkIndex * 7 - off + 1);
    const endDay = Math.min(daysInMonth(year, month), startDay + 6);
    return { startDay, endDay };
  }

  function getWeekExpenses(wkIndex: number) {
    const { startDay, endDay } = getWeekDateRange(wkIndex);
    return expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const expenseDay = expenseDate.getDate();
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();
      return expenseYear === year && expenseMonth === month &&
             expenseDay >= startDay && expenseDay <= endDay;
    });
  }

  function getWeekSummary(wkIndex: number) {
    const weekExpenses = getWeekExpenses(wkIndex);
    const weekPlans = plans.filter((p) => p.weekIndex === wkIndex);
    const spent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const planned = weekPlans.reduce((sum, p) => sum + p.amount, 0);
    return { spent, planned, weekExpenses, weekPlans };
  }

  function getMonthSummary() {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPlanned = plans.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, budget - totalSpent);
    return { totalSpent, totalPlanned, remaining, budget };
  }

  const currentSummary = viewMode === 'week' ? getWeekSummary(weekIndex) : getMonthSummary();

  function submitPlan() {
    const a = Number(amount);
    if (isNaN(a) || a <= 0) return;
    let wk = weekIndex;
    let t = targetDate || undefined;
    if (t) {
      const [Y, M, D] = t.split("-").map(Number);
      const w = weekIndexOf(Y, M - 1, D);
      wk = w;
    }
    onAdd({ monthKey: monthKeyStr, weekIndex: wk, amount: Number(a.toFixed(2)), category, note, targetDate: t });
    setAmount("");
    setNote("");
    setTargetDate("");
  }

  function moveToNextWeek(id: string) {
    onUpdate(id, { weekIndex: Math.min(weekIndex + 1, weekCount - 1) });
  }

  return (
    <div className="bg-white/70 border-2 border-amber-200 rounded-2xl shadow-sm">
      {/* sticky header */}
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

        {/* Animated toggle selector */}
        <div className="relative bg-amber-100/50 rounded-lg p-1">
          {/* Sliding background indicator */}
          <div
            className={`absolute top-1 h-8 w-1/2 bg-white shadow-sm rounded-md transition-all duration-300 ease-in-out ${
              viewMode === 'week' ? 'left-1' : 'left-1/2'
            }`}
          />

          {/* Toggle buttons */}
          <div className="relative flex">
            <button
              onClick={() => setViewMode('week')}
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer ${
                viewMode === 'week'
                  ? 'text-stone-900'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer ${
                viewMode === 'month'
                  ? 'text-stone-900'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Month View
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="p-3 border-b border-amber-200/50">
        <div className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80 rounded-xl p-3 border border-amber-200/40">
          {viewMode === 'week' ? (
            <>
              {/* Compact Week Navigation & Summary */}
              <div className="flex items-center justify-between mb-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setWeekIndex(Math.max(0, weekIndex - 1))}
                  disabled={weekIndex === 0}
                  className="h-6 w-6 p-0 rounded-full hover:bg-amber-200/50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>

                <div className="text-center flex-1">
                  <div className="text-sm font-medium text-stone-700">{labelForWeek(weekIndex)}</div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setWeekIndex(Math.min(weekCount - 1, weekIndex + 1))}
                  disabled={weekIndex === weekCount - 1}
                  className="h-6 w-6 p-0 rounded-full hover:bg-amber-200/50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>

              {/* Compact Financial Data */}
              <div className="flex justify-center gap-4 text-xs">
                <div className="text-center">
                  <div className="opacity-60">Spent</div>
                  <div className="font-bold text-red-600">${(currentSummary as any).spent.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="opacity-60">Planned</div>
                  <div className="font-bold text-blue-600">${(currentSummary as any).planned.toFixed(2)}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-stone-700 mb-2">Month Financial Summary</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="opacity-60">Budget</div>
                  <div className="font-bold text-stone-700 text-sm">${(currentSummary as any).budget.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="opacity-60">Spent</div>
                  <div className="font-bold text-red-600 text-sm">${(currentSummary as any).totalSpent.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="opacity-60">Remaining</div>
                  <div className="font-bold text-emerald-600 text-sm">${(currentSummary as any).remaining.toFixed(2)}</div>
                </div>
              </div>

              {/* Progress bar */}
              {(currentSummary as any).budget > 0 ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                    <span>Budget Used</span>
                    <span>{(((currentSummary as any).totalSpent / (currentSummary as any).budget) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all"
                      style={{
                        width: `${Math.min(100, ((currentSummary as any).totalSpent / (currentSummary as any).budget) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-center">
                  <div className="text-xs text-stone-500 italic">Set a budget to see progress</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Two-column layout for week view */}
      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Form */}
          <div className="border-b md:border-b-0 md:border-r border-amber-200/50">
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-700">Add New Item</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFormExpanded(!formExpanded)}
                className="h-6 w-6 p-0 cursor-pointer"
              >
                <ChevronRight className={`h-4 w-4 transition-transform ${formExpanded ? 'rotate-90' : ''}`} />
              </Button>
            </div>
            {formExpanded && (
              <div className="p-3 pt-0 grid grid-cols-1 gap-2">
                {/* Amount, Category, and Day on same line */}
                <div className="flex gap-2">
                  <div className="flex-1 grid gap-1">
                    <Label htmlFor="p-amount">Amount</Label>
                    <Input
                      id="p-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1 grid gap-1">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <div className="h-5"></div>
                    <div className="relative w-9 h-9 custom-calendar-hidden" title="Assign to a day (optional)">
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        style={{
                          colorScheme: 'light'
                        }}
                      />
                      <div className="absolute inset-0 w-9 h-9 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300/70 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center pointer-events-none">
                        <CalendarIcon className="w-4 h-4 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Note and Add button on same line */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="p-note">Note</Label>
                    <Input id="p-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., pharmacy, school fees" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Button onClick={submitPlan} title="Add to week" className="rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-stone-900 border border-amber-300 shadow-sm hover:shadow-md transition-all px-2 cursor-pointer h-9 w-9">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Week Items */}
          <div>
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-700">Week Items ({thisWeekItems.length})</h3>
              <div className="flex items-center gap-2">
                {thisWeekItems.length > 5 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAllItemsModal(true)}
                    className="h-6 px-2 text-xs cursor-pointer"
                  >
                    View all
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setItemsExpanded(!itemsExpanded)}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${itemsExpanded ? 'rotate-90' : ''}`} />
                </Button>
              </div>
            </div>
            {itemsExpanded && (
              <div className="p-3 pt-0 max-h-80 overflow-y-auto">
                <WeekList
                  items={thisWeekItems}
                  onMoveNext={moveToNextWeek}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onMarkPaid={onMarkPaid}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="text-sm font-medium opacity-70 mb-3">Monthly Breakdown</div>
            {Array.from({ length: weekCount }, (_, i) => {
              const weekSummary = getWeekSummary(i);
              const weekItems = plans.filter((p) => p.weekIndex === i);
              return (
                <div key={i} className="mb-4 bg-white/50 rounded-lg p-3 border border-amber-200/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{labelForWeek(i)}</div>
                    <div className="text-xs opacity-60">
                      Spent: ${weekSummary.spent.toFixed(2)} | Planned: ${weekSummary.planned.toFixed(2)}
                    </div>
                  </div>
                  {weekItems.length === 0 ? (
                    <div className="text-xs text-stone-500 italic">No planned items this week.</div>
                  ) : (
                    <div className="space-y-1">
                      {weekItems.map((item) => (
                        <div key={item.id} className="text-xs flex items-center justify-between bg-white rounded px-2 py-1">
                          <span>${item.amount.toFixed(2)} - {item.category}</span>
                          {item.note && <span className="opacity-60 truncate ml-2">{item.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Items Modal */}
      <Dialog open={showAllItemsModal} onOpenChange={setShowAllItemsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Week Items ({thisWeekItems.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <WeekList
              items={thisWeekItems}
              onMoveNext={moveToNextWeek}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMarkPaid={onMarkPaid}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WeekList({
  items,
  onMoveNext,
  onUpdate,
  onRemove,
  onMarkPaid,
}: {
  items: PlanItem[];
  onMoveNext: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PlanItem>) => void;
  onRemove: (id: string) => void;
  onMarkPaid: (p: PlanItem) => void;
}) {
  return (
    <div>
      {items.length === 0 && <div className="text-sm text-stone-500">No items yet.</div>}
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="rounded-lg border border-stone-200 bg-white p-2.5 text-sm">
            {/* First line: Amount, Category, Action buttons */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-3">
                <div className="font-bold text-stone-900">${p.amount.toFixed(2)}</div>
                <div className="text-stone-600">{p.category}</div>
                {p.note && <div className="text-xs text-stone-500 truncate max-w-24">• {p.note}</div>}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs cursor-pointer"
                  onClick={() => onMarkPaid(p)}
                  disabled={!p.targetDate}
                  title={!p.targetDate ? "Specify a day first" : "Mark as paid"}
                >
                  Mark paid
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-amber-50 cursor-pointer"
                  onClick={() => onMoveNext(p.id)}
                  title="Move to next week"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-red-50 cursor-pointer"
                  onClick={() => onRemove(p.id)}
                  title="Delete"
                >
                  <Trash className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </div>
            {/* Second line: Date input */}
            <div className="flex items-center gap-2">
              <Label className="text-xs opacity-70 min-w-fit">Day:</Label>
              <Input
                className="h-6 flex-1 text-xs date-input-stable"
                type="date"
                value={p.targetDate || ""}
                onChange={(e) => onUpdate(p.id, { targetDate: e.target.value })}
                autoComplete="off"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}