import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "./Icons";
import { CATEGORIES } from "./constants";
import { dialogStyles, cn } from "@/styles";

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
  onSubmit
}: ExpenseDialogProps) {

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
            <span className="hidden sm:inline">Add expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
        <div className={dialogStyles.paperDialog}>
          {/* Paper texture overlay */}
          <div className={dialogStyles.paperTexture}></div>

          {/* Yellow transparent tape */}
          <div className={dialogStyles.yellowTape}></div>

          {/* Torn edge effect */}
          <div className={dialogStyles.tornEdge}></div>

          <div className={dialogStyles.contentWrapper}>
            <DialogHeader>
              <DialogTitle className={dialogStyles.header.title}>
                Add an expense 💰
              </DialogTitle>
            </DialogHeader>
            <div className={dialogStyles.formSection}>
              <div className={dialogStyles.form.container}>
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
                  <Label htmlFor="note" className={dialogStyles.form.label}>Note (optional)</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="e.g., market, taxi, dinner"
                    className={dialogStyles.form.input}
                  />
                </div>
              </div>
            </div>

            <div className={dialogStyles.buttons.container}>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={dialogStyles.buttons.secondary}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                className={dialogStyles.buttons.primary}
              >
                Save 💫
              </Button>
            </div>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}