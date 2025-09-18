import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Plus, Trash } from "./Icons";
import { daysInMonth, firstWeekday, pad2, ymd } from "./utils";
import type { Expense, PlanItem } from "@/lib/data-service";
import { calendarStyles, cn, conditional } from "@/styles";

interface CalendarProps {
  year: number;
  month: number;
  monthKey: string;
  budget: number;
  expenses: Expense[];
  plans: PlanItem[];
  onDayClick: (date: string) => void;
  onShowQuote: () => void;
  onRemoveExpense: (id: string) => void;
  onRemovePlan: (id: string) => void;
  onMarkPlanPaid: (plan: PlanItem) => void;
}

export function Calendar({
  year,
  month,
  monthKey,
  budget,
  expenses,
  plans,
  onDayClick,
  onShowQuote,
  onRemoveExpense,
  onRemovePlan,
  onMarkPlanPaid
}: CalendarProps) {
  const today = new Date();
  const nDays = daysInMonth(year, month);
  const startOn = firstWeekday(year, month); // 0=Sun ...
  const blanks = Array.from({ length: startOn === 0 ? 6 : startOn - 1 }); // make Monday first visually
  const days = Array.from({ length: nDays }, (_, i) => i + 1);

  // helpers per-day
  function spentOn(day: number) {
    const d = `${monthKey}-${pad2(day)}`;
    return expenses
      .filter((e) => e.date === d)
      .reduce((s, e) => s + e.amount, 0);
  }

  function leftAfter(day: number) {
    const upto = expenses
      .filter((e) => e.date <= `${monthKey}-${pad2(day)}`)
      .reduce((s, e) => s + e.amount, 0);
    return Math.max(0, budget - upto);
  }

  function listFor(day: number) {
    const d = `${monthKey}-${pad2(day)}`;
    return expenses.filter((e) => e.date === d);
  }

  function plannedFor(day: number) {
    const d = `${monthKey}-${pad2(day)}`;
    return plans.filter((p) => p.targetDate === d);
  }

  function plannedAmountOn(day: number) {
    const d = `${monthKey}-${pad2(day)}`;
    return plans
      .filter((p) => p.targetDate === d)
      .reduce((s, p) => s + p.amount, 0);
  }

  return (
    <div className="mobile-calendar-area lg:h-auto lg:flex lg:flex-col" data-mobile-view="calendar">
      {/* weekday header (Mon-first) */}
      <div className={calendarStyles.weekdayHeader}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className={calendarStyles.weekdayCell}>
            {d}
          </div>
        ))}
      </div>

      <div className={calendarStyles.calendarGrid}>
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((d) => (
          <HoverCard key={d} openDelay={200} closeDelay={200}>
            <HoverCardTrigger asChild>
              <button
                className={cn(
                  calendarStyles.dayCell,
                  conditional(ymd(today) === `${monthKey}-${pad2(d)}`, calendarStyles.todayHighlight)
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onDayClick(`${monthKey}-${pad2(d)}`);
                }}
              >
                {/* torn paper top edge */}
                <div className={calendarStyles.dayTornEdge} />
                <div className="p-0.5 xs:p-1 sm:p-2 md:p-2.5 h-full flex flex-col items-start">
                  <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
                    <span className="text-xs xs:text-sm sm:text-lg md:text-xl font-bold handwriting">
                      {d}
                    </span>
                  </div>

                  {/* Today sticker */}
                  {ymd(today) === `${monthKey}-${pad2(d)}` && (
                    <div
                      className={calendarStyles.todaySticker}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowQuote();
                      }}
                    >
                      ⭐
                    </div>
                  )}
                  <div className={calendarStyles.dayStats.container}>
                    <div className={calendarStyles.dayStats.leftStats}>
                      <div>
                        <div className={calendarStyles.dayStats.label}>spent</div>
                        <div className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold mt-0.5 text-red-600">
                          ${spentOn(d).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className={calendarStyles.dayStats.label}>rem</div>
                        <div className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold mt-0.5 text-emerald-600">
                          ${leftAfter(d).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className={calendarStyles.dayStats.rightStats}>
                      <div className={calendarStyles.dayStats.label}>planned</div>
                      <div className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold mt-0.5 text-blue-600">
                        ${plannedAmountOn(d).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={calendarStyles.hoverIcon}>
                  <Plus className="w-3.5 h-3.5 text-stone-600" />
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
                    budget: <span className="font-bold text-stone-800">${budget.toFixed(2)}</span>
                  </div>
                </div>

                {/* Day Summary */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-amber-50/50 rounded-lg p-2 border border-amber-200/30">
                  <div className="text-center">
                    <div className="opacity-60">Planned</div>
                    <div className="font-bold text-blue-600">${plannedAmountOn(d).toFixed(2)}</div>
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
                        <Button size="sm" variant="outline" className="h-7 cursor-pointer" onClick={() => onMarkPlanPaid(p)}>
                          Mark paid
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-red-50 cursor-pointer"
                          onClick={() => onRemovePlan(p.id)}
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
                        onClick={() => onRemoveExpense(e.id)}
                        className="h-7 w-7 hover:bg-red-50 cursor-pointer"
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
    </div>
  );
}