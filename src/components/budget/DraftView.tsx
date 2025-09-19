import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

          {draftItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-stone-200 bg-white p-2.5 text-sm">
              {/* First line: Amount, Category, Action buttons */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-stone-900">
                    {item.amount ? `$${item.amount.toFixed(2)}` : "--"}
                  </div>
                  <div className="text-stone-600">{item.category || "uncategorized"}</div>
                  {item.note && <div className="text-xs text-stone-500 truncate max-w-24">• {item.note}</div>}
                </div>
                <div className="flex items-center gap-1">
                  {(!item.amount || item.amount <= 0) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Quick edit: prompt for amount
                        const amount = prompt("Enter amount:");
                        if (amount && Number(amount) > 0) {
                          onUpdateDraftItem(item.id, { amount: Number(amount) });
                        }
                      }}
                      className="h-6 px-2 text-xs cursor-pointer"
                    >
                      Set Amount
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToPlanner(item)}
                      disabled={!item.date}
                      className="h-6 px-2 text-xs cursor-pointer disabled:cursor-not-allowed"
                      title={!item.date ? "Specify a day first" : "Mark as paid"}
                    >
                      Mark paid
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-red-50 cursor-pointer"
                    onClick={() => onRemoveDraftItem(item.id)}
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
                  value={item.date || ""}
                  onChange={(e) => onUpdateDraftItem(item.id, { date: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}