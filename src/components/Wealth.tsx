import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataService, type Account } from "@/lib/data-service";
import { paperTheme, dialogStyles } from "@/styles";
import { useAuth } from "@/contexts/AuthContext";

const accountTypeLabels = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit Card",
  investment: "Investment",
  cash: "Cash",
  asset: "Asset",
  property: "Property",
  vehicle: "Vehicle",
  other: "Other"
};

const accountTypeEmojis = {
  checking: "💳",
  savings: "🏦",
  credit: "💰",
  investment: "📈",
  cash: "💵",
  asset: "💎",
  property: "🏠",
  vehicle: "🚗",
  other: "📦"
};

const accountTypeColors = {
  checking: "border-blue-300/60 bg-blue-50/30",
  savings: "border-green-300/60 bg-green-50/30",
  credit: "border-red-300/60 bg-red-50/30",
  investment: "border-purple-300/60 bg-purple-50/30",
  cash: "border-amber-300/60 bg-amber-50/30",
  asset: "border-pink-300/60 bg-pink-50/30",
  property: "border-stone-300/60 bg-stone-50/30",
  vehicle: "border-cyan-300/60 bg-cyan-50/30",
  other: "border-gray-300/60 bg-gray-50/30"
};

export default function Wealth() {
  const { loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<Account['type']>("checking");
  const [formBalance, setFormBalance] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formNotes, setFormNotes] = useState("");

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await dataService.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadAccounts();
    }
  }, [authLoading]);

  // Calculate totals
  const { totalWealth, totalAssets } = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts.forEach(account => {
      if (account.type === 'credit') {
        totalLiabilities += Math.abs(account.balance);
      } else {
        totalAssets += account.balance;
      }
    });

    return {
      totalWealth: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
    };
  }, [accounts]);

  const activeAccounts = accounts.filter(acc => acc.isActive);

  // Add account
  const handleAddAccount = async () => {
    const balance = Number(formBalance);
    if (!formName || isNaN(balance)) return;

    try {
      const newAccount = await dataService.addAccount({
        name: formName,
        type: formType,
        balance,
        currency: formCurrency,
        notes: formNotes,
        isActive: true,
      });

      setAccounts([...accounts, newAccount]);
      resetForm();
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add account:', error);
    }
  };

  // Update account
  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;

    const balance = Number(formBalance);
    if (!formName || isNaN(balance)) return;

    try {
      const updatedAccount = await dataService.updateAccount(selectedAccount.id, {
        name: formName,
        type: formType,
        balance,
        currency: formCurrency,
        notes: formNotes,
      });

      setAccounts(accounts.map(acc =>
        acc.id === selectedAccount.id ? updatedAccount : acc
      ));
      resetForm();
      setEditDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  // Delete account
  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await dataService.deleteAccount(id);
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormType("checking");
    setFormBalance("");
    setFormCurrency("USD");
    setFormNotes("");
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setFormName(account.name);
    setFormType(account.type);
    setFormBalance(account.balance.toString());
    setFormCurrency(account.currency);
    setFormNotes(account.notes || "");
    setEditDialogOpen(true);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting} text-xl`}>
          Loading your wealth...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full bg-[${paperTheme.colors.background.paper}] py-20 px-4 relative overflow-hidden`}>
      {/* Background paper texture */}
      <div className={`absolute inset-0 opacity-5 ${paperTheme.effects.paperTexture} pointer-events-none`}></div>

      {/* Hand-drawn doodles scattered around */}
      <div className="absolute top-20 left-10 transform -rotate-12 opacity-30">
        <div className="text-6xl">✏️</div>
      </div>
      <div className="absolute top-40 right-20 transform rotate-45 opacity-30">
        <div className="text-5xl">📝</div>
      </div>
      <div className="absolute bottom-32 left-20 transform -rotate-45 opacity-30">
        <div className="text-4xl">✂️</div>
      </div>
      <div className="absolute bottom-20 right-16 transform rotate-12 opacity-30">
        <div className="text-5xl">📎</div>
      </div>

      {/* Decorative corner tape */}
      <div className="absolute top-4 left-4 transform -rotate-45">
        <div className={`w-3 h-16 ${paperTheme.effects.yellowTape}`}></div>
      </div>
      <div className="absolute bottom-4 right-4 transform rotate-12">
        <div className="w-2 h-12 bg-red-400/60 rounded-sm shadow-sm"></div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className={`relative ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} rounded-2xl p-6 ${paperTheme.effects.shadow.lg} overflow-hidden mb-6`}>
          {/* Paper texture overlay */}
          <div className={`absolute inset-0 opacity-15 ${paperTheme.effects.paperTexture} rounded-2xl pointer-events-none`}></div>

          {/* Yellow tape at top - crooked */}
          <div className={`absolute -top-1 left-20 w-16 h-5 ${paperTheme.effects.yellowTape} transform -rotate-6`}></div>
          <div className={`absolute -top-1 right-24 w-20 h-5 ${paperTheme.effects.yellowTape} transform rotate-3`}></div>

          {/* Hand-drawn border */}
          <div className="absolute inset-3 border-2 border-dashed border-amber-400/40 rounded-xl pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Small doodled title */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl transform -rotate-12">💰</span>
              <h1 className={`text-2xl font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>
                Wealth & Accounts
              </h1>
              <span className="text-3xl transform rotate-12">💸</span>
            </div>

            {/* Total wealth - doodled badge */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`relative ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amberStrong} rounded-2xl px-6 py-3 ${paperTheme.effects.shadow.md} transform -rotate-2`}>
                <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} rounded-2xl`}></div>
                {/* Doodle stars around */}
                <div className="absolute -top-2 -left-2 text-yellow-500 text-xl">★</div>
                <div className="absolute -top-2 -right-2 text-yellow-500 text-xl">★</div>
                <div className={`relative text-2xl font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>
                  ${totalWealth.toLocaleString()}
                </div>
              </div>

              {/* Add button */}
              <Button
                onClick={() => setAddDialogOpen(true)}
                className={`relative ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} rounded-xl px-4 py-2 ${paperTheme.effects.shadow.md} hover:shadow-lg transition-shadow ${paperTheme.colors.text.accent} cursor-pointer ${paperTheme.fonts.handwriting} font-bold transform rotate-1`}
              >
                <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} rounded-xl`}></div>
                <div className="relative flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Accounts Grid - Paper cards scattered */}
        {activeAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAccounts.map((account, index) => {
              const emoji = accountTypeEmojis[account.type as keyof typeof accountTypeEmojis];
              const typeColor = accountTypeColors[account.type as keyof typeof accountTypeColors];
              const rotation = index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-2';

              return (
                <div
                  key={account.id}
                  className={`relative ${paperTheme.colors.background.cardGradient} border-2 ${typeColor} rounded-2xl p-5 ${paperTheme.effects.shadow.lg} overflow-hidden transform ${rotation} transition-shadow duration-200 group`}
                >
                  {/* Paper texture */}
                  <div className={`absolute inset-0 opacity-15 ${paperTheme.effects.paperTexture} rounded-2xl pointer-events-none`}></div>

                  {/* Hand-drawn squiggly border */}
                  <div className="absolute inset-2 border border-dashed border-amber-300/50 rounded-xl pointer-events-none"></div>

                  {/* Tape decoration - crooked */}
                  <div className={`absolute -top-1 right-8 w-12 h-4 ${paperTheme.effects.yellowTape} transform -rotate-12`}></div>

                  {/* Doodle corner decoration */}
                  <div className="absolute top-2 left-2 text-xl opacity-60">{emoji}</div>

                  {/* Content */}
                  <div className="relative z-10 mt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className={`text-xs ${paperTheme.colors.text.muted} ${paperTheme.fonts.handwriting} uppercase tracking-wide`}>
                          {accountTypeLabels[account.type as keyof typeof accountTypeLabels]}
                        </div>
                        <h3 className={`text-lg font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting} mt-1`}>
                          {account.name}
                        </h3>
                      </div>

                      {/* Action buttons - appear on hover */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditDialog(account)}
                          className={`p-1.5 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} rounded-lg ${paperTheme.effects.shadow.sm} hover:shadow-md transition-shadow`}
                        >
                          <Edit className={`w-3.5 h-3.5 ${paperTheme.colors.text.accent}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className={`p-1.5 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} rounded-lg ${paperTheme.effects.shadow.sm} hover:shadow-md transition-shadow`}
                        >
                          <Trash2 className={`w-3.5 h-3.5 text-red-600`} />
                        </button>
                      </div>
                    </div>

                    {/* Balance - hand-drawn box */}
                    <div className={`mb-3 p-3 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm} relative overflow-hidden transform -rotate-1`}>
                      <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall}`}></div>
                      {/* Underline doodle */}
                      <div className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-400/30"></div>
                      <div className="relative">
                        <div className={`text-xl font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>
                          ${account.balance.toLocaleString()}
                        </div>
                        <div className={`text-xs ${paperTheme.colors.text.muted}`}>
                          {account.currency}
                        </div>
                      </div>
                    </div>

                    {/* Notes - handwritten */}
                    {account.notes && (
                      <div className={`text-xs ${paperTheme.colors.text.muted} ${paperTheme.fonts.handwriting} italic`}>
                        "{account.notes}"
                      </div>
                    )}
                  </div>

                  {/* Corner paper clip doodle */}
                  <div className="absolute -bottom-1 -right-1 text-2xl opacity-50 transform rotate-12">📎</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`relative ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} rounded-2xl p-12 ${paperTheme.effects.shadow.lg} overflow-hidden text-center transform rotate-1`}>
            <div className={`absolute inset-0 opacity-15 ${paperTheme.effects.paperTexture} rounded-2xl pointer-events-none`}></div>
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 ${paperTheme.effects.yellowTape}`}></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4">💰</div>
              <p className={`text-lg ${paperTheme.colors.text.muted} ${paperTheme.fonts.handwriting}`}>
                No accounts yet! Click "Add" to get started.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className={dialogStyles.paperDialog}>
            {/* Paper texture overlay */}
            <div className={dialogStyles.paperTexture}></div>

            {/* Yellow transparent tape */}
            <div className={dialogStyles.yellowTape}></div>

            {/* Torn edge effect */}
            <div className={dialogStyles.tornEdge}></div>

            <div className={dialogStyles.contentWrapper}>
              <DialogHeader className={dialogStyles.header.container}>
                <DialogTitle className={dialogStyles.header.title}>
                  💰 Add New Account
                </DialogTitle>
              </DialogHeader>

              <div className={dialogStyles.form.container}>
                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="name" className={dialogStyles.form.label}>
                    Account Name
                  </Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., My Piggy Bank"
                    className={dialogStyles.form.input}
                  />
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="type" className={dialogStyles.form.label}>
                    Type
                  </Label>
                  <Select value={formType} onValueChange={(value) => setFormType(value as Account['type'])}>
                    <SelectTrigger className={dialogStyles.form.input}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {accountTypeEmojis[value as keyof typeof accountTypeEmojis]} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="balance" className={dialogStyles.form.label}>
                    Balance
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    placeholder="0.00"
                    className={dialogStyles.form.input}
                  />
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="currency" className={dialogStyles.form.label}>
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    placeholder="USD"
                    className={dialogStyles.form.input}
                  />
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="notes" className={dialogStyles.form.label}>
                    Notes (optional)
                  </Label>
                  <Input
                    id="notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Any notes..."
                    className={dialogStyles.form.input}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  onClick={handleAddAccount}
                  className={dialogStyles.buttons.primary}
                >
                  Add Account
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className={dialogStyles.paperDialog}>
            {/* Paper texture overlay */}
            <div className={dialogStyles.paperTexture}></div>

            {/* Yellow transparent tape */}
            <div className={dialogStyles.yellowTape}></div>

            {/* Torn edge effect */}
            <div className={dialogStyles.tornEdge}></div>

            <div className={dialogStyles.contentWrapper}>
              <DialogHeader className={dialogStyles.header.container}>
                <DialogTitle className={dialogStyles.header.title}>
                  ✏️ Edit Account
                </DialogTitle>
              </DialogHeader>

              <div className={dialogStyles.form.container}>
                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="edit-name" className={dialogStyles.form.label}>
                    Account Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={dialogStyles.form.input}
                  />
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="edit-type" className={dialogStyles.form.label}>
                    Type
                  </Label>
                  <Select value={formType} onValueChange={(value) => setFormType(value as Account['type'])}>
                    <SelectTrigger className={dialogStyles.form.input}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {accountTypeEmojis[value as keyof typeof accountTypeEmojis]} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="edit-balance" className={dialogStyles.form.label}>
                    Balance
                  </Label>
                  <Input
                    id="edit-balance"
                    type="number"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    className={dialogStyles.form.input}
                  />
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="edit-currency" className={dialogStyles.form.label}>
                    Currency
                  </Label>
                  <Input
                    id="edit-currency"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className={dialogStyles.form.input}
                  />
                </div>

                <div className={dialogStyles.form.fieldContainer}>
                  <Label htmlFor="edit-notes" className={dialogStyles.form.label}>
                    Notes (optional)
                  </Label>
                  <Input
                    id="edit-notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className={dialogStyles.form.input}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  onClick={handleUpdateAccount}
                  className={dialogStyles.buttons.primary}
                >
                  Update Account
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
