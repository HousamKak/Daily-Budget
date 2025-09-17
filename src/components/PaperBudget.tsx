import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { dataService, type Expense, type PlanItem } from "@/lib/data-service";
import { AuthButton } from "@/components/Auth";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

/**
 * ——————————————————————————————————————————————————————————————————————
 * Cartoony "paper" budget app
 * - Month calendar on the left (paper sticky notes look)
 * - Compact Weekly Planner panel on the right (with expand mode)
 * - Hover a day to see the planned + paid items; day cells remain clean
 * - Supabase + LocalStorage fallback persistence
 * - No external icon deps (inline SVGs)
 * ——————————————————————————————————————————————————————————————————————
 */

// ——— icons (inline so it works offline) ————————————————————————————————
const IconBase = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconBase>
);
const Plus = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconBase>
);
const Trash = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </IconBase>
);
const ChevronLeft = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <polyline points="15 18 9 12 15 6" />
  </IconBase>
);
const ChevronRight = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <polyline points="9 18 15 12 9 6" />
  </IconBase>
);
const Wallet = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M16 10h4v4h-4z" />
    <path d="M2 10h12" />
  </IconBase>
);

// ——— helpers ————————————————————————————————————————————————
const pad2 = (n: number) => String(n).padStart(2, "0");
const monthKey = (y: number, m: number) => `${y}-${pad2(m + 1)}`; // m is 0-based
const makeId = () =>
  (typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 Sun – 6 Sat
}
function monStartOffset(year: number, month: number) {
  // translate to Monday-first offset (0=Mon..6=Sun)
  const d = new Date(year, month, 1).getDay(); // 0 Sun..6 Sat
  return (d + 6) % 7;
}
function weekCount(year: number, month: number) {
  const n = daysInMonth(year, month);
  const off = monStartOffset(year, month);
  return Math.ceil((off + n) / 7);
}
function weekIndexOf(year: number, month: number, day: number) {
  const off = monStartOffset(year, month);
  return Math.floor((off + (day - 1)) / 7); // 0-based week index within month
}
function ymd(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// cute categories to pick from
const CATEGORIES = [
  "groceries",
  "household",
  "transport",
  "eating out",
  "health",
  "gifts",
  "bills",
  "other",
];

// ——— tiny runtime tests ————————————————————————————————————————
(function runTests() {
  try {
    console.assert(pad2(3) === "03", "pad2 should pad single digits");
    console.assert(monthKey(2025, 8) === "2025-09", "monthKey should be YYYY-MM for 0-based month");
    console.assert(daysInMonth(2024, 1) === 29, "2024 Feb should have 29 days");
    console.assert(firstWeekday(2025, 8) === 1, "Sept 1, 2025 is Monday => day 1");
    console.assert(
      weekIndexOf(2025, 8, 1) === 0 && weekIndexOf(2025, 8, 8) === 1,
      "week index math"
    );
  } catch (e) {
    console.warn("Self-tests failed:", e);
  }
})();

// ——— main component ————————————————————————————————————————————
export default function PaperBudget() {
  const { user, loading } = useAuth();
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth()); // 0-based

  const key = useMemo(() => monthKey(year, month), [year, month]);
  const [budget, setBudgetState] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [plannerExpanded, setPlannerExpanded] = useState(false);

  // Load data from service
  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetData, expensesData, plansData] = await Promise.all([
          dataService.getBudget(key),
          dataService.getExpenses(key),
          dataService.getPlans(key),
        ]);
        setBudgetState(budgetData);
        setExpenses(expensesData);
        setPlans(plansData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [key]);

  // totals
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const leftNow = Math.max(0, budget - totalSpent);

  // calendar grid basics
  const nDays = daysInMonth(year, month);
  const startOn = firstWeekday(year, month); // 0=Sun ...
  const blanks = Array.from({ length: startOn === 0 ? 6 : startOn - 1 }); // make Monday first visually
  const days = Array.from({ length: nDays }, (_, i) => i + 1);
  const wkCount = weekCount(year, month);
  const todaysWeek =
    new Date(year, month).getMonth() === today.getMonth() &&
    new Date(year, month).getFullYear() === today.getFullYear()
      ? weekIndexOf(year, month, today.getDate())
      : 0;

  // nav
  function gotoPrev() {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }
  function gotoNext() {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  // expense ops
  async function addExpense(e: Expense) {
    try {
      await dataService.addExpense(key, e);
      setExpenses(prev => [...prev, e].sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  }
  async function removeExpense(id: string) {
    try {
      await dataService.removeExpense(key, id);
      setExpenses(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      console.error('Failed to remove expense:', error);
    }
  }
  async function setBudget(amount: number) {
    try {
      await dataService.setBudget(key, amount);
      setBudgetState(amount);
    } catch (error) {
      console.error('Failed to set budget:', error);
    }
  }
  async function clearMonth() {
    try {
      await dataService.clearMonth(key);
      setBudgetState(0);
      setExpenses([]);
      setPlans([]);
    } catch (error) {
      console.error('Failed to clear month:', error);
    }
  }

  // plans ops
  async function addPlan(p: Omit<PlanItem, "id">) {
    try {
      const newPlan = { ...p, id: makeId() };
      await dataService.addPlan(key, newPlan);
      setPlans(prev => [...prev, newPlan]);
    } catch (error) {
      console.error('Failed to add plan:', error);
    }
  }
  async function updatePlan(id: string, patch: Partial<PlanItem>) {
    try {
      await dataService.updatePlan(key, id, patch);
      setPlans(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  }
  async function removePlan(id: string) {
    try {
      await dataService.removePlan(key, id);
      setPlans(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      console.error('Failed to remove plan:', error);
    }
  }
  function markPlanPaid(p: PlanItem) {
    const date = p.targetDate || ymd(new Date());
    addExpense({ id: makeId(), date, amount: p.amount, category: p.category, note: p.note });
    removePlan(p.id);
  }

  // helpers per-day
  function spentOn(day: number) {
    const d = `${key}-${pad2(day)}`;
    return expenses
      .filter((e) => e.date === d)
      .reduce((s, e) => s + e.amount, 0);
  }
  function leftAfter(day: number) {
    const upto = expenses
      .filter((e) => e.date <= `${key}-${pad2(day)}`)
      .reduce((s, e) => s + e.amount, 0);
    return Math.max(0, budget - upto);
  }
  function listFor(day: number) {
    const d = `${key}-${pad2(day)}`;
    return expenses.filter((e) => e.date === d);
  }
  function plannedFor(day: number) {
    const d = `${key}-${pad2(day)}`;
    return plans.filter((p) => p.targetDate === d);
  }

  // add-expense dialog state (compact)
  const [open, setOpen] = useState(false);
  const [formDate, setFormDate] = useState<string>(ymd(today));
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("groceries");
  const [note, setNote] = useState<string>("");

  function submitExpense() {
    const a = Number(amount);
    if (!formDate || isNaN(a) || a <= 0) return;
    addExpense({ id: makeId(), date: formDate, amount: Number(a.toFixed(2)), category, note });
    setAmount("");
    setNote("");
    setOpen(false);
  }

  // nice month label
  const monthLabel = new Date(year, month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[repeating-linear-gradient(0deg,#fbf6e9,#fbf6e9_28px,#f2e8cf_28px,#f2e8cf_29px)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-stone-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[repeating-linear-gradient(0deg,#fbf6e9,#fbf6e9_28px,#f2e8cf_28px,#f2e8cf_29px)] text-stone-900">
      {/* Auth notification banner */}
      {supabase && !user && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 px-4 py-3 shadow-sm">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-sm text-stone-700">
              <strong className="text-amber-800">💾 Sign in to sync your data across devices!</strong>
              <span className="text-stone-600 ml-1">Your budget is currently stored locally only.</span>
            </p>
          </div>
        </div>
      )}

      {/* top bar */}
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={gotoPrev}
              className="rounded-2xl shadow-sm bg-white/60 hover:bg-white/80 border border-amber-200/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div
              className="text-2xl sm:text-3xl font-bold tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]"
              style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
            >
              {monthLabel}
            </div>
            <Button
              variant="ghost"
              onClick={gotoNext}
              className="rounded-2xl shadow-sm bg-white/60 hover:bg-white/80 border border-amber-200/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2 shadow-sm border border-amber-200">
              <Wallet className="w-4 h-4 text-stone-600" />
              <Input
                type="number"
                min={0}
                step="0.01"
                value={budget || ""}
                onChange={(e) => setBudget(Number(e.target.value || 0))}
                placeholder="0.00"
                className="h-8 w-28 bg-transparent border-none focus-visible:ring-0 p-0 text-right font-semibold"
              />
              <span className="text-sm opacity-70">budget</span>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl shadow hover:shadow-md transition-all bg-amber-200/80 text-stone-900 border border-amber-300 hover:bg-amber-300/80">
                  <Plus className="mr-1 w-4 h-4" /> Add expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-bold text-lg">Add an expense</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
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
                  <div className="grid gap-1.5">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., market, taxi, dinner" />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={submitExpense}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <AuthButton />
          </div>
        </div>

        {/* quick summary */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <SummaryCard title="Starting cash" value={budget} />
          <SummaryCard title="Spent so far" value={totalSpent} />
          <SummaryCard title="Left now" value={leftNow} highlight />
        </div>
      </div>

      {/* layout: calendar + planner (planner can expand to full width) */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className={
          plannerExpanded
            ? "grid grid-cols-1 gap-6 items-start"
            : "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start"
        }>
          {/* Calendar section (hidden when expanded) */}
          {!plannerExpanded && (
            <div>
              {/* weekday header (Mon-first) */}
              <div className="grid grid-cols-7 gap-2 px-1 text-center font-medium text-stone-600/90">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="py-2 text-sm sm:text-base">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {days.map((d) => (
                  <HoverCard key={d} openDelay={200} closeDelay={200}>
                    <HoverCardTrigger asChild>
                      <button
                        className={`group relative aspect-square w-full rounded-2xl border border-amber-300/70 bg-[radial-gradient(circle_at_20%_0%,#fff,rgba(255,255,255,0.92))] shadow-sm hover:shadow-md transition-all ${
                          ymd(today) === `${key}-${pad2(d)}`
                            ? "ring-2 ring-amber-400 ring-offset-1"
                            : ""
                        }`}
                        onClick={() => {
                          // quick-add by pre-filling the day in the dialog
                          setFormDate(`${key}-${pad2(d)}`);
                          setOpen(true);
                        }}
                      >
                        {/* torn paper top edge */}
                        <div className="absolute inset-x-0 -top-1 h-3 bg-[repeating-linear-gradient(90deg,#fcd34d,#fcd34d_8px,#fde68a_8px,#fde68a_16px)] rounded-t-2xl opacity-70" />
                        <div className="p-2 sm:p-3 h-full flex flex-col items-start">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span
                              className="text-lg sm:text-xl font-bold"
                              style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
                            >
                              {d}
                            </span>
                          </div>
                          <div className="mt-auto w-full text-left space-y-0.5">
                            <div>
                              <div className="text-[8px] sm:text-[9px] opacity-60 leading-none">spent</div>
                              <div className="text-[9px] sm:text-[10px] font-bold mt-0.5 text-red-600">${spentOn(d).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[8px] sm:text-[9px] opacity-60 leading-none">rem</div>
                              <div className="text-[9px] sm:text-[10px] font-bold mt-0.5 text-emerald-600">${leftAfter(d).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute right-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3.5 h-3.5 text-stone-600" />
                        </div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <div className="font-semibold">
                            {new Date(year, month, d).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>

                        {/* Budget Summary */}
                        <div className="grid grid-cols-3 gap-2 text-xs bg-amber-50/50 rounded-lg p-2 border border-amber-200/30">
                          <div className="text-center">
                            <div className="opacity-60">Budget</div>
                            <div className="font-bold text-stone-800">${budget.toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="opacity-60">Spent</div>
                            <div className="font-bold text-red-600">${spentOn(d).toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="opacity-60">Remaining</div>
                            <div className="font-bold text-emerald-600">${leftAfter(d).toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="text-xs uppercase tracking-wide opacity-60">planned</div>
                        <div className="max-h-44 overflow-y-auto pr-1">
                          {plannedFor(d).length === 0 && (
                            <div className="text-sm text-stone-500 italic">No planned items for this day.</div>
                          )}
                          {plannedFor(d).map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-2 py-1.5 mt-1 hover:shadow-sm transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold">
                                  ${p.amount.toFixed(2)} {" "}
                                  <span className="ml-1 text-xs text-stone-500">{p.category}</span>
                                </div>
                                {p.note && <div className="text-xs text-stone-500 truncate">{p.note}</div>}
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-7" onClick={() => markPlanPaid(p)}>
                                  Mark paid
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 hover:bg-red-50"
                                  onClick={() => removePlan(p.id)}
                                  title="Delete"
                                >
                                  <Trash className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-xs uppercase tracking-wide opacity-60 mt-2">expenses</div>
                        <div className="max-h-44 overflow-y-auto pr-1">
                          {listFor(d).length === 0 && (
                            <div className="text-sm text-stone-500 italic">No expenses yet. Click the day to add one.</div>
                          )}
                          {listFor(d).map((e) => (
                            <div
                              key={e.id}
                              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-2 py-1.5 mt-1 hover:shadow-sm transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold">
                                  ${e.amount.toFixed(2)} {" "}
                                  <span className="ml-1 text-xs text-stone-500">{e.category}</span>
                                </div>
                                {e.note && <div className="text-xs text-stone-500 truncate">{e.note}</div>}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeExpense(e.id)}
                                className="h-7 w-7 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>

              {/* footer tools */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm opacity-80 flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" /> Tip: click any day to add an expense • hover to see planned + paid
                  items.
                </div>
                <Button variant="outline" className="rounded-xl bg-white/60 hover:bg-white/80" onClick={clearMonth}>
                  Clear this month
                </Button>
              </div>
            </div>
          )}

          {/* Planner Panel */}
          <PlannerPanel
            year={year}
            month={month}
            monthKeyStr={key}
            weekCount={wkCount}
            todaysWeek={todaysWeek}
            plans={plans}
            expenses={expenses}
            budget={budget}
            onAdd={addPlan}
            onUpdate={updatePlan}
            onRemove={removePlan}
            onMarkPaid={markPlanPaid}
            expanded={plannerExpanded}
            onToggleExpanded={() => setPlannerExpanded((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
}

// ——— Planner Panel ————————————————————————————————————————————
function PlannerPanel({
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
  expanded,
  onToggleExpanded,
}: {
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
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-stone-600" />
            <h2
              className="font-bold text-lg"
              style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
            >
              Financial Planner
            </h2>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={onToggleExpanded}>
            {expanded ? "Show calendar" : "Expand panel"}
          </Button>
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
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === 'week'
                  ? 'text-stone-900'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`relative z-10 flex-1 h-8 text-sm font-medium rounded-md transition-colors duration-200 ${
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
              {/* Week Navigation Header */}
              <div className="flex items-center justify-between mb-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setWeekIndex(Math.max(0, weekIndex - 1))}
                  disabled={weekIndex === 0}
                  className="h-7 w-7 p-0 rounded-full hover:bg-amber-200/50 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-center">
                  <div className="text-sm font-medium text-stone-700">{labelForWeek(weekIndex)}</div>
                  <div className="text-xs opacity-60">Financial Summary</div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setWeekIndex(Math.min(weekCount - 1, weekIndex + 1))}
                  disabled={weekIndex === weekCount - 1}
                  className="h-7 w-7 p-0 rounded-full hover:bg-amber-200/50 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Financial Data */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <div className="opacity-60">Spent this week</div>
                  <div className="font-bold text-red-600 text-sm">${(currentSummary as any).spent.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="opacity-60">Planned this week</div>
                  <div className="font-bold text-blue-600 text-sm">${(currentSummary as any).planned.toFixed(2)}</div>
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

      {/* form */}
      {viewMode === 'week' && (
        <div className="border-b border-amber-200/50">
          <div className="p-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-700">Add New Item</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFormExpanded(!formExpanded)}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${formExpanded ? 'rotate-90' : ''}`} />
            </Button>
          </div>
          {formExpanded && (
            <div className="p-3 pt-0 grid grid-cols-1 gap-2">
              {/* Amount and Category on same line */}
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
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
                <div className="grid gap-1">
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
              </div>
            <div className="grid gap-1">
              <Label htmlFor="p-note">Note</Label>
              <Input id="p-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., pharmacy, school fees" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="p-date">Associate to a day (optional)</Label>
              <div className="flex gap-2">
                <Input id="p-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="flex-1" />
                <Button onClick={submitPlan} className="rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-stone-900 border border-amber-300 shadow-sm hover:shadow-md transition-all px-4">
                  <Plus className="w-4 h-4 mr-1" /> Add to week
                </Button>
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      {/* lists area */}
      <div>
        {viewMode === 'week' ? (
          <div>
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-700">Week Items ({thisWeekItems.length})</h3>
              <div className="flex items-center gap-2">
                {thisWeekItems.length > 3 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAllItemsModal(true)}
                    className="h-6 px-2 text-xs"
                  >
                    View all
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setItemsExpanded(!itemsExpanded)}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${itemsExpanded ? 'rotate-90' : ''}`} />
                </Button>
              </div>
            </div>
            {itemsExpanded && (
              <div className="p-3 max-h-60 overflow-y-auto">
                <WeekList
                  items={thisWeekItems.slice(0, 3)}
                  onMoveNext={moveToNextWeek}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onMarkPaid={onMarkPaid}
                />
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>

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
                  className="h-6 px-2 text-xs"
                  onClick={() => onMarkPaid(p)}
                  disabled={!p.targetDate}
                  title={!p.targetDate ? "Specify a day first" : "Mark as paid"}
                >
                  Mark paid
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-amber-50"
                  onClick={() => onMoveNext(p.id)}
                  title="Move to next week"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-red-50"
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
                className="h-6 flex-1 text-xs"
                type="date"
                value={p.targetDate || ""}
                onChange={(e) => onUpdate(p.id, { targetDate: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ——— tiny summary card ————————————————————————————————————————
function SummaryCard({ title, value, highlight = false }: { title: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border-2 shadow-sm px-3 py-2 bg-white/80 ${
        highlight ? "border-emerald-400 bg-emerald-50/80" : "border-amber-200"
      }`}
    >
      <div className="text-xs opacity-70 font-medium">{title}</div>
      <div
        className="text-lg font-bold tracking-wide"
        style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
      >
        ${Number(value || 0).toFixed(2)}
      </div>
    </div>
  );
}