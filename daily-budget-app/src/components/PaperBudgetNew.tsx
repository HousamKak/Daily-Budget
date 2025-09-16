import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { dataService, type Expense, type PlanItem } from "@/lib/data-service";

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

// ——— main component ————————————————————————————————————————————
export default function PaperBudget() {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth()); // 0-based

  const key = useMemo(() => monthKey(year, month), [year, month]);
  const [budget, setBudgetState] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [plannerExpanded, setPlannerExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data on mount and when month changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[repeating-linear-gradient(0deg,#fbf6e9,#fbf6e9_28px,#f2e8cf_28px,#f2e8cf_29px)] text-stone-900 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading your budget...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[repeating-linear-gradient(0deg,#fbf6e9,#fbf6e9_28px,#f2e8cf_28px,#f2e8cf_29px)] text-stone-900">
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
                  <HoverCard key={d}>
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
                          <div className="mt-auto w-full text-left">
                            <div className="text-[10px] sm:text-[11px] opacity-60 leading-none">spent</div>
                            <div className="text-xs sm:text-sm font-bold -mt-0.5">${spentOn(d).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-stone-600" />
                        </div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">
                            {new Date(year, month, d).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-stone-500">
                            left after: <span className="font-bold text-stone-800">${leftAfter(d).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          Spent today: <span className="font-bold">${spentOn(d).toFixed(2)}</span>
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

  const weekOptions = Array.from({ length: weekCount }, (_, i) => i);
  const labelForWeek = (i: number) => {
    const off = monStartOffset(year, month);
    const startDay = i * 7 - off + 1; // may be <=0
    const endDay = Math.min(daysInMonth(year, month), startDay + 6);
    const safeStart = Math.max(1, startDay);
    return `Week ${i + 1} (${safeStart}-${endDay})`;
  };

  const thisWeekItems = plans.filter((p) => p.weekIndex === weekIndex);
  const nextWeekItems = plans.filter((p) => p.weekIndex === Math.min(weekIndex + 1, weekCount - 1));

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
      <div className="sticky top-0 z-10 p-3 border-b-2 border-amber-200 bg-white/70 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-stone-600" />
          <h2
            className="font-bold text-lg"
            style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}
          >
            Weekly planner
          </h2>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={onToggleExpanded}>
          {expanded ? "Show calendar" : "Expand panel"}
        </Button>
      </div>

      {/* form */}
      <div className="p-3 grid grid-cols-1 gap-2">
        <div className="grid gap-1">
          <Label>Week</Label>
          <Select value={String(weekIndex)} onValueChange={(v) => setWeekIndex(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick a week" />
            </SelectTrigger>
            <SelectContent>
              {weekOptions.map((i) => (
                <SelectItem key={i} value={String(i)}>
                  {labelForWeek(i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <div className="grid gap-1">
          <Label htmlFor="p-note">Note</Label>
          <Input id="p-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., pharmacy, school fees" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="p-date">Associate to a day (optional)</Label>
          <Input id="p-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={submitPlan}>
            <Plus className="w-4 h-4 mr-1" /> Add to week
          </Button>
        </div>
      </div>

      {/* lists area (scrollable when tall) */}
      <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
        <WeekList
          title="This week"
          items={thisWeekItems}
          onMoveNext={moveToNextWeek}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onMarkPaid={onMarkPaid}
        />
        <WeekList
          title="Next week"
          items={nextWeekItems}
          onMoveNext={moveToNextWeek}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onMarkPaid={onMarkPaid}
        />
      </div>
    </div>
  );
}

function WeekList({
  title,
  items,
  onMoveNext,
  onUpdate,
  onRemove,
  onMarkPaid,
}: {
  title: string;
  items: PlanItem[];
  onMoveNext: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PlanItem>) => void;
  onRemove: (id: string) => void;
  onMarkPaid: (p: PlanItem) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium opacity-70 mb-1">{title}</div>
      {items.length === 0 && <div className="text-sm text-stone-500">No items yet.</div>}
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-stone-200 bg-white px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  ${p.amount.toFixed(2)} {" "}
                  <span className="ml-1 text-xs text-stone-500">{p.category}</span>
                </div>
                {p.note && <div className="text-xs text-stone-500 truncate">{p.note}</div>}
                <div className="flex items-center gap-2 mt-1">
                  <Label className="text-[11px] opacity-70">Day:</Label>
                  <Input
                    className="h-7 w-36"
                    type="date"
                    value={p.targetDate || ""}
                    onChange={(e) => onUpdate(p.id, { targetDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-7" onClick={() => onMarkPaid(p)}>
                  Mark paid
                </Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => onMoveNext(p.id)}>
                  → next week
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onRemove(p.id)} title="Delete">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
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