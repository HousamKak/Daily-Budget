import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { dialogStyles, cn } from "@/styles";
import { type PlanItem, type Expense } from "@/lib/data-service";

interface MonthlyBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthLabel: string;
  expenses: Expense[];
  plans: PlanItem[];
  onMarkPlanPaid?: (plan: PlanItem) => void;
  onRemovePlan?: (planId: string) => void;
  onRemoveExpense?: (expenseId: string) => void;
}

export function MonthlyBookDialog({
  open,
  onOpenChange,
  monthLabel,
  expenses,
  plans,
  onMarkPlanPaid,
  onRemovePlan,
  onRemoveExpense
}: MonthlyBookDialogProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const closeBook = () => {
    setCurrentPage(0);
    setIsFlipping(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <div className={cn(dialogStyles.paperDialog)}>
          {/* Paper texture overlay */}
          <div className={dialogStyles.paperTexture}></div>

          {/* Yellow transparent tape */}
          <div className={dialogStyles.yellowTape}></div>

          {/* Torn edge effect */}
          <div className={dialogStyles.tornEdge}></div>

          <div className={dialogStyles.contentWrapper}>
            {/* Book View */}
            <div className="relative min-h-[600px] p-4">
              {/* Book title */}
              <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-stone-700 handwriting mb-2">
                  📖 {monthLabel} Ledger
                </h2>
                <p className="text-sm text-stone-500 handwriting">All your expenses and plans for the month</p>
              </div>

              {/* Book binding spine - positioned after title */}
              <div className="absolute left-1/2 top-24 bottom-0 w-2 bg-stone-400/20 transform -translate-x-1/2 shadow-inner rounded-full"></div>

              {/* Book pages with flip animation */}
              <div className="relative w-full h-full">
                {/* Page 0: Monthly Expenses */}
                {currentPage === 0 && (
                  <div className={cn(
                    "grid grid-cols-2 gap-12 min-h-[480px] transition-all duration-300 transform",
                    isFlipping ? "rotateY-90 opacity-0" : "rotateY-0 opacity-100"
                  )}>
                    {/* Left page - Expenses */}
                    <div className="relative bg-gradient-to-br from-red-50 via-white to-red-100 rounded-l-lg border-r border-stone-200/50 shadow-inner p-6">
                      <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-evenly">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-stone-300/30"></div>
                        ))}
                      </div>

                      <div className="ml-6">
                        <h3 className="text-xl font-bold text-red-700 handwriting mb-4 border-b border-red-300/50 pb-2">
                          💸 Monthly Expenses
                        </h3>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 book-scroll book-scroll-red">
                          {expenses && expenses.length > 0 ? (
                            expenses.map((expense) => (
                              <div key={expense.id} className="flex justify-between items-center py-1">
                                <div className="flex-1">
                                  <div className="handwriting text-red-600 text-sm leading-tight">
                                    <span className="font-bold">${expense.amount.toFixed(2)}</span>
                                    {expense.category && (
                                      <span className="text-xs opacity-75 ml-2">{expense.category}</span>
                                    )}
                                    {expense.note && (
                                      <span className="text-xs text-stone-600 ml-2">• {expense.note}</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-stone-400 handwriting">
                                    {new Date(expense.date).toLocaleDateString()}
                                  </div>
                                </div>
                                {onRemoveExpense && (
                                  <button
                                    onClick={() => onRemoveExpense(expense.id)}
                                    className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer ml-2"
                                    title="Delete expense"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-16 text-red-400">
                              <div className="text-3xl mb-2">📝</div>
                              <p className="handwriting">No expenses this month</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right page - Plans */}
                    <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-r-lg shadow-inner p-6">
                      <div className="absolute right-4 top-0 bottom-0 flex flex-col justify-evenly">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-stone-300/30"></div>
                        ))}
                      </div>

                      <div className="mr-6">
                        <h3 className="text-xl font-bold text-blue-700 handwriting mb-4 border-b border-blue-300/50 pb-2">
                          📋 Monthly Plans
                        </h3>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 book-scroll book-scroll-blue">
                          {plans && plans.length > 0 ? (
                            plans.map((plan) => (
                              <div key={plan.id} className="flex justify-between items-center py-1">
                                <div className="flex-1">
                                  <div className="handwriting text-blue-600 text-sm leading-tight">
                                    <span className="font-bold">${plan.amount.toFixed(2)}</span>
                                    {plan.category && (
                                      <span className="text-xs opacity-75 ml-2">{plan.category}</span>
                                    )}
                                    {plan.note && (
                                      <span className="text-xs text-stone-600 ml-2">• {plan.note}</span>
                                    )}
                                  </div>
                                  {plan.targetDate && (
                                    <div className="text-xs text-stone-400 handwriting">
                                      {new Date(plan.targetDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                {(onMarkPlanPaid || onRemovePlan) && (
                                  <div className="flex gap-1 ml-2">
                                    {onMarkPlanPaid && (
                                      <button
                                        onClick={() => onMarkPlanPaid(plan)}
                                        className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors cursor-pointer"
                                        title="Mark as paid"
                                      >
                                        ✓
                                      </button>
                                    )}
                                    {onRemovePlan && (
                                      <button
                                        onClick={() => onRemovePlan(plan.id)}
                                        className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer"
                                        title="Delete plan"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-16 text-blue-400">
                              <div className="text-3xl mb-2">📝</div>
                              <p className="handwriting">No plans this month</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Book action buttons */}
            <div className="flex justify-center items-center mt-6 pt-4 border-t border-stone-200/50">
              <Button
                variant="outline"
                onClick={closeBook}
                className="handwriting text-stone-600 border-stone-300 hover:bg-stone-50 cursor-pointer"
              >
                ← Close Monthly Book
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}