import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "./Icons";
import { CATEGORIES } from "./constants";
import { dialogStyles, cn } from "@/styles";
import { type PlanItem } from "@/lib/data-service";

type DialogMode = 'expense' | 'plan';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formDate: string;
  onFormDateChange: (date: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
  onSubmitPlan?: (planData: { date: string; amount: number; category: string; note: string }) => void;
  dayExpenses?: Array<{id: string, amount: number, category?: string, note?: string}>;
  dayPlans?: PlanItem[];
  onMarkPlanPaid?: (plan: PlanItem) => void;
  onRemovePlan?: (planId: string) => void;
  onRemoveExpense?: (expenseId: string) => void;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  formDate,
  onFormDateChange,
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  note,
  onNoteChange,
  onSubmit,
  onSubmitPlan,
  dayExpenses = [],
  dayPlans = [],
  onMarkPlanPaid,
  onRemovePlan,
  onRemoveExpense
}: ExpenseDialogProps) {
  const [mode, setMode] = useState<DialogMode>('expense');
  const [bookMode, setBookMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleSubmit = () => {
    if (mode === 'expense') {
      onSubmit();
    } else {
      // Plan mode
      const a = Number(amount);
      if (!formDate || isNaN(a) || a <= 0 || !onSubmitPlan) return;
      onSubmitPlan({
        date: formDate,
        amount: Number(a.toFixed(2)),
        category,
        note
      });
    }
  };

  const openBook = () => {
    setBookMode(true);
    setCurrentPage(0);
  };

  const closeBook = () => {
    setBookMode(false);
    setCurrentPage(0);
    setIsFlipping(false);
  };

  const flipPage = (targetPage: number) => {
    if (isFlipping || targetPage === currentPage) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(targetPage);
      setIsFlipping(false);
    }, 300);
  };

  // Dynamic styles based on mode
  const modeStyles = {
    expense: {
      borderColor: 'border-red-300 bg-red-50/80',
      titleColor: 'text-red-700',
      buttonColor: 'bg-red-600 hover:bg-red-700 text-white'
    },
    plan: {
      borderColor: 'border-blue-300 bg-blue-50/80',
      titleColor: 'text-blue-700',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const currentStyles = modeStyles[mode];

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          onOpenChange(newOpen);
          // Clear any lingering focus when dialog closes
          if (!newOpen) {
            setTimeout(() => document.body.focus(), 0);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className={dialogStyles.buttons.primary}>
            <Plus className="mr-0 sm:mr-1 w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Quick add</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </DialogTrigger>
        <DialogContent className={cn("sm:max-w-md", bookMode && "sm:max-w-4xl")}>
        <div className={cn(
          dialogStyles.paperDialog,
          !bookMode && mode === 'expense'
            ? "!border-red-300/80 bg-red-50/20"
            : !bookMode && mode === 'plan'
            ? "!border-blue-300/80 bg-blue-50/20"
            : ""
        )}>
          {/* Paper texture overlay */}
          <div className={dialogStyles.paperTexture}></div>

          {/* Yellow transparent tape */}
          <div className={dialogStyles.yellowTape}></div>

          {/* Torn edge effect */}
          <div className={dialogStyles.tornEdge}></div>

          <div className={dialogStyles.contentWrapper}>
            {!bookMode ? (
              <>
                {/* Simple Modal - Default View */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-stone-700 handwriting mb-2">
                    Quick Add for{" "}
                    <span className="text-amber-600 underline decoration-wavy decoration-2">
                      {new Date(formDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </h2>
                </div>

                {/* Mode Selection Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('expense')}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                      "bg-gradient-to-br from-red-50 to-red-100",
                      mode === 'expense'
                        ? "border-red-400 shadow-md ring-2 ring-red-200"
                        : "border-red-200 hover:border-red-300"
                    )}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💸</div>
                      <p className="text-sm font-medium text-red-700 handwriting">Expense</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('plan')}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                      "bg-gradient-to-br from-blue-50 to-blue-100",
                      mode === 'plan'
                        ? "border-blue-400 shadow-md ring-2 ring-blue-200"
                        : "border-blue-200 hover:border-blue-300"
                    )}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📋</div>
                      <p className="text-sm font-medium text-blue-700 handwriting">Plan</p>
                    </div>
                  </button>
                </div>

                {/* Simple Form */}
                <div className="space-y-4 mb-6">
                  <div className={dialogStyles.form.fieldContainer}>
                    <Label htmlFor="date" className={dialogStyles.form.label}>Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formDate}
                      onChange={(e) => onFormDateChange(e.target.value)}
                      autoComplete="off"
                      className={cn("date-input-stable", dialogStyles.form.input)}
                    />
                  </div>
                  <div className={dialogStyles.form.fieldContainer}>
                    <Label htmlFor="amount" className={dialogStyles.form.label}>Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => onAmountChange(e.target.value)}
                      autoFocus
                      inputMode="decimal"
                      className={dialogStyles.form.input}
                    />
                  </div>
                  <div className={dialogStyles.form.fieldContainer}>
                    <Label className={dialogStyles.form.label}>Category</Label>
                    <Select value={category} onValueChange={onCategoryChange}>
                      <SelectTrigger className={cn("w-full", dialogStyles.form.input)}>
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
                  <div className={dialogStyles.form.fieldContainer}>
                    <Label htmlFor="note" className={dialogStyles.form.label}>
                      {mode === 'expense' ? 'Note (optional)' : 'Plan description (optional)'}
                    </Label>
                    <Input
                      id="note"
                      value={note}
                      onChange={(e) => onNoteChange(e.target.value)}
                      placeholder={
                        mode === 'expense'
                          ? "e.g., market, taxi, dinner"
                          : "e.g., birthday gift, vacation fund"
                      }
                      className={dialogStyles.form.input}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={openBook}
                    className="handwriting text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer"
                  >
                    📖 Open Book
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className={dialogStyles.buttons.secondary}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className={cn("cursor-pointer handwriting", currentStyles.buttonColor)}
                    >
                      {mode === 'expense' ? 'Save Expense 💰' : 'Save Plan 📝'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Book View */}
                <div className="relative min-h-[500px] p-4">
                  {/* Book binding spine */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-stone-400/20 transform -translate-x-1/2 shadow-inner rounded-full"></div>

                  {/* Book pages with flip animation */}
                  <div className="relative w-full h-full">
                    {/* Page 0: Mode selection and form */}
                    {currentPage === 0 && (
                      <div className={cn(
                        "grid grid-cols-2 gap-8 min-h-[450px] transition-all duration-300 transform",
                        isFlipping ? "rotateY-90 opacity-0" : "rotateY-0 opacity-100"
                      )}>
                        {/* Left page - Mode selection */}
                        <div className="relative bg-gradient-to-br from-amber-50 via-white to-amber-100 rounded-l-lg border-r border-stone-200/50 shadow-inner p-4">
                          <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-evenly">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-stone-300/40"></div>
                            ))}
                          </div>

                          <div className="ml-4">
                            <h3 className="text-xl font-bold text-stone-700 handwriting mb-6 border-b border-stone-300/50 pb-2">
                              Choose Your Action
                            </h3>

                            <div className="space-y-4">
                              <button
                                type="button"
                                onClick={() => setMode('expense')}
                                className={cn(
                                  "w-full p-4 rounded-lg border-2 transition-all duration-200",
                                  "bg-gradient-to-r from-red-50 to-red-100",
                                  mode === 'expense'
                                    ? "border-red-400 shadow-lg ring-2 ring-red-200 scale-105"
                                    : "border-red-200 hover:border-red-300 hover:scale-102"
                                )}
                              >
                                <div className="text-left">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">💸</span>
                                    <h4 className="text-lg font-bold text-red-700 handwriting">Record Expense</h4>
                                  </div>
                                  <p className="text-sm text-red-600 handwriting">Something you already spent money on</p>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setMode('plan')}
                                className={cn(
                                  "w-full p-4 rounded-lg border-2 transition-all duration-200",
                                  "bg-gradient-to-r from-blue-50 to-blue-100",
                                  mode === 'plan'
                                    ? "border-blue-400 shadow-lg ring-2 ring-blue-200 scale-105"
                                    : "border-blue-200 hover:border-blue-300 hover:scale-102"
                                )}
                              >
                                <div className="text-left">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">📋</span>
                                    <h4 className="text-lg font-bold text-blue-700 handwriting">Plan Ahead</h4>
                                  </div>
                                  <p className="text-sm text-blue-600 handwriting">Something you're planning to buy</p>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right page - Form */}
                        <div className="relative bg-gradient-to-br from-white via-amber-50 to-amber-100 rounded-r-lg shadow-inner p-4">
                          <div className="absolute right-3 top-0 bottom-0 flex flex-col justify-evenly">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-stone-300/40"></div>
                            ))}
                          </div>

                          <div className="mr-4">
                            <div className="text-center mb-6">
                              <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm handwriting",
                                mode === 'expense'
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : "bg-blue-50 border-blue-200 text-blue-700"
                              )}>
                                <span className="text-xl">
                                  {mode === 'expense' ? '💸' : '📋'}
                                </span>
                                <span className="text-sm font-medium">
                                  {mode === 'expense' ? 'New Expense' : 'New Plan'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className={dialogStyles.form.fieldContainer}>
                                <Label htmlFor="book-date" className={dialogStyles.form.label}>Date</Label>
                                <Input
                                  id="book-date"
                                  type="date"
                                  value={formDate}
                                  onChange={(e) => onFormDateChange(e.target.value)}
                                  className={cn("date-input-stable", dialogStyles.form.input)}
                                />
                              </div>
                              <div className={dialogStyles.form.fieldContainer}>
                                <Label htmlFor="book-amount" className={dialogStyles.form.label}>Amount</Label>
                                <Input
                                  id="book-amount"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={amount}
                                  onChange={(e) => onAmountChange(e.target.value)}
                                  className={dialogStyles.form.input}
                                />
                              </div>
                              <div className={dialogStyles.form.fieldContainer}>
                                <Label className={dialogStyles.form.label}>Category</Label>
                                <Select value={category} onValueChange={onCategoryChange}>
                                  <SelectTrigger className={cn("w-full", dialogStyles.form.input)}>
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
                              <div className={dialogStyles.form.fieldContainer}>
                                <Label htmlFor="book-note" className={dialogStyles.form.label}>
                                  Note (optional)
                                </Label>
                                <Input
                                  id="book-note"
                                  value={note}
                                  onChange={(e) => onNoteChange(e.target.value)}
                                  placeholder="Add a note..."
                                  className={dialogStyles.form.input}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Page 1: Today's entries */}
                    {currentPage === 1 && (
                      <div className={cn(
                        "grid grid-cols-2 gap-8 min-h-[450px] transition-all duration-300 transform",
                        isFlipping ? "rotateY-90 opacity-0" : "rotateY-0 opacity-100"
                      )}>
                        {/* Left page - Today's Expenses */}
                        <div className="relative bg-gradient-to-br from-red-50 via-white to-red-100 rounded-l-lg border-r border-stone-200/50 shadow-inner p-4">
                          <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-evenly">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-stone-300/40"></div>
                            ))}
                          </div>

                          <div className="ml-4">
                            <h3 className="text-xl font-bold text-red-700 handwriting mb-6 border-b border-red-300/50 pb-2 flex items-center gap-2">
                              💸 Today's Expenses
                            </h3>

                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 book-scroll book-scroll-red">
                              {dayExpenses && dayExpenses.length > 0 ? (
                                dayExpenses.map((expense, index) => (
                                  <div key={expense.id} className="relative">
                                    {/* Handwritten note style */}
                                    <div className="bg-white/80 p-3 rounded-sm shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-200"
                                         style={{transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (0.5 + Math.random() * 0.5)}deg)`}}>
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="handwriting text-red-600 text-base leading-relaxed">
                                            <span className="font-bold">${expense.amount.toFixed(2)}</span>
                                            {expense.category && (
                                              <span className="text-sm opacity-75"> • {expense.category}</span>
                                            )}
                                          </div>
                                          {expense.note && (
                                            <p className="handwriting text-stone-600 text-sm mt-1 leading-relaxed">{expense.note}</p>
                                          )}
                                        </div>
                                        {onRemoveExpense && (
                                          <div className="flex gap-1 ml-2 flex-shrink-0">
                                            <button
                                              onClick={() => onRemoveExpense(expense.id)}
                                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer handwriting"
                                              title="Delete expense"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-12 text-red-400">
                                  <div className="text-4xl mb-2">📝</div>
                                  <p className="handwriting text-lg">No expenses today</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right page - Today's Plans */}
                        <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-r-lg shadow-inner p-4">
                          <div className="absolute right-3 top-0 bottom-0 flex flex-col justify-evenly">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-stone-300/40"></div>
                            ))}
                          </div>

                          <div className="mr-4">
                            <h3 className="text-xl font-bold text-blue-700 handwriting mb-6 border-b border-blue-300/50 pb-2 flex items-center gap-2">
                              📋 Today's Plans
                            </h3>

                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 book-scroll book-scroll-blue">
                              {dayPlans && dayPlans.length > 0 ? (
                                dayPlans.map((plan, index) => (
                                  <div key={plan.id} className="relative">
                                    {/* Handwritten note style */}
                                    <div className="bg-white/80 p-3 rounded-sm shadow-sm transform hover:rotate-0 transition-transform duration-200"
                                         style={{transform: `rotate(${(index % 2 === 0 ? -1 : 1) * (0.5 + Math.random() * 0.5)}deg)`}}>
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="handwriting text-blue-600 text-base leading-relaxed">
                                            <span className="font-bold">${plan.amount.toFixed(2)}</span>
                                            {plan.category && (
                                              <span className="text-sm opacity-75"> • {plan.category}</span>
                                            )}
                                          </div>
                                          {plan.note && (
                                            <p className="handwriting text-stone-600 text-sm mt-1 leading-relaxed">{plan.note}</p>
                                          )}
                                        </div>
                                        {(onMarkPlanPaid || onRemovePlan) && (
                                          <div className="flex gap-1 ml-2 flex-shrink-0">
                                            {onMarkPlanPaid && (
                                              <button
                                                onClick={() => onMarkPlanPaid(plan)}
                                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors cursor-pointer handwriting"
                                                title="Mark as paid"
                                              >
                                                ✓ Paid
                                              </button>
                                            )}
                                            {onRemovePlan && (
                                              <button
                                                onClick={() => onRemovePlan(plan.id)}
                                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer handwriting"
                                                title="Delete plan"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-12 text-blue-400">
                                  <div className="text-4xl mb-2">📝</div>
                                  <p className="handwriting text-lg">No plans today</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page navigation - moved outside book area */}
                  <div className="flex justify-center gap-4 items-center mt-4 pt-4 border-t border-stone-200/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => flipPage(0)}
                      disabled={currentPage === 0 || isFlipping}
                      className={cn("handwriting text-xs cursor-pointer", currentPage === 0 && "bg-amber-100 border-amber-300")}
                    >
                      📝 Add Entry
                    </Button>
                    <div className="w-2 h-2 rounded-full bg-stone-300/50"></div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => flipPage(1)}
                      disabled={currentPage === 1 || isFlipping}
                      className={cn("handwriting text-xs cursor-pointer", currentPage === 1 && "bg-amber-100 border-amber-300")}
                    >
                      📖 View Entries
                    </Button>
                  </div>
                </div>

                {/* Book action buttons */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-200/50">
                  <Button
                    variant="outline"
                    onClick={closeBook}
                    className="handwriting text-stone-600 border-stone-300 hover:bg-stone-50 cursor-pointer"
                  >
                    ← Close Book
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className={dialogStyles.buttons.secondary}
                    >
                      Cancel
                    </Button>
                    {currentPage === 0 && (
                      <Button
                        onClick={handleSubmit}
                        className={cn("cursor-pointer handwriting", currentStyles.buttonColor)}
                      >
                        {mode === 'expense' ? 'Save Expense 💰' : 'Save Plan 📝'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}