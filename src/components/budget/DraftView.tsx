import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, CalendarIcon } from "./Icons";
import { CATEGORIES } from "./constants";
import type { PlanItem } from "@/lib/data-service";

interface DraftItem {
  id: string;
  note: string;
  amount?: number;
  category?: string;
  date?: string;
}

interface DraftViewProps {
  onAddToPlan: (item: Omit<PlanItem, "id" | "monthKey" | "weekIndex">) => void;
  draftItems: DraftItem[];
  onAddDraftItem: (item: Omit<DraftItem, "id">) => void;
  onUpdateDraftItem: (id: string, updates: Partial<DraftItem>) => void;
  onRemoveDraftItem: (id: string) => void;
}

export function DraftView({
  onAddToPlan,
  draftItems,
  onAddDraftItem,
  onUpdateDraftItem,
  onRemoveDraftItem
}: DraftViewProps) {
  const [newItemNote, setNewItemNote] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCategory, setQuickCategory] = useState("");
  const [quickDate, setQuickDate] = useState("");

  function addDraftItem() {
    if (!newItemNote.trim()) return;

    // If we have amount, add directly to planner
    const amount = quickAmount ? Number(quickAmount) : undefined;
    if (amount && amount > 0) {
      onAddToPlan({
        note: newItemNote.trim(),
        amount: amount,
        category: quickCategory || "misc",
        targetDate: quickDate || undefined,
      });
      // Clear form
      setNewItemNote("");
      setQuickAmount("");
      setQuickCategory("");
      setQuickDate("");
      return;
    }

    // Otherwise add to draft
    onAddDraftItem({
      note: newItemNote.trim(),
      amount: amount,
      category: quickCategory || undefined,
      date: quickDate || undefined,
    });

    // Clear form
    setNewItemNote("");
    setQuickAmount("");
    setQuickCategory("");
    setQuickDate("");
  }

  function addToPlanner(item: DraftItem) {
    if (!item.amount || item.amount <= 0) return;

    onAddToPlan({
      amount: item.amount,
      category: item.category || "misc",
      note: item.note,
      targetDate: item.date || undefined,
    });

    onRemoveDraftItem(item.id);
  }

  // Auto-convert draft to plan when all required fields are present
  function checkAutoConvert(item: DraftItem) {
    // Removed auto-conversion - user must manually click Plan button
    return;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDraftItem();
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Quick Add Section */}
      <div className="flex items-center gap-2" style={{ height: '40px', flexWrap: 'nowrap' }}>
        <Input
          value={newItemNote}
          onChange={(e) => setNewItemNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Plan a new expense..."
          className="text-sm bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300/70 rounded-xl shadow-sm handwriting placeholder:handwriting placeholder:opacity-60"
          style={{
            fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
            height: '40px',
            flex: '1 1 0',
            minWidth: '0'
          }}
        />

        <Input
          type="number"
          step="0.01"
          min="0"
          value={quickAmount}
          onChange={(e) => setQuickAmount(e.target.value)}
          placeholder="0.00"
          className="text-xs text-right bg-white/80 border-2 border-amber-200 rounded-xl shadow-sm"
          style={{ width: '70px', height: '40px', flexShrink: 0 }}
        />

        <Select value={quickCategory} onValueChange={setQuickCategory}>
          <SelectTrigger
            className="bg-white/80 border-2 border-amber-200 rounded-xl shadow-sm text-xs"
            style={{ width: '70px', height: '40px', flexShrink: 0 }}
          >
            <SelectValue placeholder="Cat" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className="relative bg-white/80 hover:bg-white border-2 border-amber-200 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md"
          style={{
            width: '40px',
            height: '40px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <input
            type="date"
            value={quickDate}
            onChange={(e) => setQuickDate(e.target.value)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 10
            }}
          />
          <CalendarIcon className="w-4 h-4 text-stone-600 pointer-events-none" />
        </div>

        <Button
          onClick={addDraftItem}
          className="p-0 bg-white/80 hover:bg-white text-stone-700 border-2 border-amber-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          style={{ height: '40px', width: '40px', flexShrink: 0 }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Draft Items List */}
      {draftItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-700 handwriting" style={{ fontFamily: '"Patrick Hand", "Comic Sans MS", cursive' }}>
              Draft Items ({draftItems.length})
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {draftItems.map((item) => (
            <div key={item.id} className="group flex items-center gap-2 p-2 rounded-lg border border-stone-200 bg-white hover:shadow-sm transition-shadow">

              {/* Note */}
              <div className="flex-1 min-w-0 text-xs leading-normal text-stone-900 break-words line-clamp-2">
                {item.note}
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 w-16">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    const updatedItem = { ...item, amount: value };
                    onUpdateDraftItem(item.id, { amount: value });
                    if (value) checkAutoConvert(updatedItem);
                  }}
                  placeholder="0.00"
                  className="w-full h-7 text-xs text-right text-blue-600 font-bold border-stone-300 hover:border-stone-400 focus:border-amber-400 transition-colors placeholder:text-stone-400 placeholder:font-normal cursor-pointer"
                />
              </div>

              {/* Category */}
              <Select
                value={item.category || ""}
                onValueChange={(value) => {
                  const updatedItem = { ...item, category: value };
                  onUpdateDraftItem(item.id, { category: value });
                  checkAutoConvert(updatedItem);
                }}
              >
                <SelectTrigger className="w-20 h-7 text-xs border-stone-300 hover:border-stone-400 transition-colors flex-shrink-0">
                  <SelectValue placeholder="Cat" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date */}
              <div className="relative flex-shrink-0">
                <input
                  type="date"
                  value={item.date || ""}
                  onChange={(e) => {
                    const updatedItem = { ...item, date: e.target.value };
                    onUpdateDraftItem(item.id, { date: e.target.value });
                    checkAutoConvert(updatedItem);
                  }}
                  className="w-20 h-7 text-xs border border-stone-300 hover:border-stone-400 focus:border-amber-400 transition-colors rounded-md px-2 pr-6 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  style={{ colorScheme: 'light' }}
                  autoComplete="off"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2">
                  <span className="text-xs text-stone-900">
                    {item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : ''}
                  </span>
                  <CalendarIcon className="w-3 h-3 text-stone-400 ml-1" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => addToPlanner(item)}
                  disabled={!item.amount || !item.date}
                  className="h-7 px-2 text-xs bg-white hover:bg-amber-50 text-stone-700 border-2 border-amber-200 hover:border-amber-300 disabled:bg-stone-50 disabled:text-stone-400 disabled:border-stone-200 disabled:hover:bg-stone-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Plan
                </Button>

                <button
                  onClick={() => onRemoveDraftItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash className="w-3 h-3 text-red-400" />
                </button>
              </div>

            </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}