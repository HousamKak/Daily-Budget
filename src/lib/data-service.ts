import { supabase } from './supabase'

// Data types
export type Expense = {
  id: string
  date: string // YYYY-MM-DD
  amount: number
  category?: string
  note?: string
}

export type PlanItem = {
  id: string
  monthKey: string
  weekIndex: number
  amount: number
  category?: string
  note?: string
  targetDate?: string
}

export type DraftItem = {
  id: string
  note: string
  amount?: number
  category?: string
  date?: string
}

export type Account = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'asset' | 'property' | 'vehicle' | 'other'
  balance: number
  currency: string
  icon?: string
  color?: string
  isActive: boolean
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type AccountTransaction = {
  id: string
  accountId: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'adjustment'
  amount: number
  date: string
  note?: string
  category?: string
  expenseId?: string
  transferToAccountId?: string
  createdAt?: string
  updatedAt?: string
}

export type Store = {
  budgets: Record<string, number>
  expenses: Record<string, Expense[]>
  plans: Record<string, PlanItem[]>
  drafts: DraftItem[]
  accounts: Account[]
  accountTransactions: AccountTransaction[]
}

// LocalStorage fallback
const STORAGE_KEY = "paper-budget-cartoon-v1"

const defaultStore: Store = { budgets: {}, expenses: {}, plans: {}, drafts: [], accounts: [], accountTransactions: [] }

function loadStoreFromLocalStorage(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultStore }
    const parsed = JSON.parse(raw) as Store
    return {
      budgets: parsed.budgets ?? {},
      expenses: parsed.expenses ?? {},
      plans: parsed.plans ?? {},
      drafts: parsed.drafts ?? [],
      accounts: parsed.accounts ?? [],
      accountTransactions: parsed.accountTransactions ?? [],
    }
  } catch {
    return { ...defaultStore }
  }
}

function saveStoreToLocalStorage(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// Data service class
export class DataService {
  private useSupabase: boolean
  private localStore: Store

  constructor() {
    this.useSupabase = !!supabase
    this.localStore = loadStoreFromLocalStorage()
  }

  // Check if user is authenticated for Supabase operations
  private async getCurrentUser() {
    if (!supabase) return null

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return null
      }
      return user
    } catch (error) {
      console.warn('Error checking authentication:', error)
      return null
    }
  }

  // Get authentication status
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  // Budget operations
  async getBudget(monthKey: string): Promise<number> {
    if (this.useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('amount')
          .eq('month_key', monthKey)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase budget fetch error:', error)
          throw error
        }

        const budget = data?.amount ? Number(data.amount) : 0
        console.log('Budget loaded from Supabase:', monthKey, budget)

        // Update local store to stay in sync
        this.localStore.budgets[monthKey] = budget
        saveStoreToLocalStorage(this.localStore)

        return budget
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
        return this.localStore.budgets[monthKey] ?? 0
      }
    }
    return this.localStore.budgets[monthKey] ?? 0
  }

  async setBudget(monthKey: string, amount: number): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const user = await this.getCurrentUser()
        if (!user) {
          console.warn('User not authenticated, falling back to localStorage')
          this.useSupabase = false
        } else {
          const { error } = await supabase
            .from('budgets')
            .upsert({
              month_key: monthKey,
              amount,
              user_id: user.id
            }, {
              onConflict: 'user_id,month_key'
            })

          if (error) {
            console.error('Supabase budget upsert error:', error)
            throw error
          }
          console.log('Budget successfully saved to Supabase:', monthKey, amount)

          // Update local store to stay in sync with Supabase
          this.localStore.budgets[monthKey] = amount
          saveStoreToLocalStorage(this.localStore)
          return
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        // Don't disable Supabase for budget conflicts, might be temporary
        if ((error as any)?.code !== '23505') {
          this.useSupabase = false
        }
      }
    }

    this.localStore.budgets[monthKey] = amount
    saveStoreToLocalStorage(this.localStore)
  }

  // Expense operations
  async getExpenses(monthKey: string): Promise<Expense[]> {
    if (this.useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('month_key', monthKey)
          .order('date', { ascending: true })

        if (error) throw error
        return data?.map(row => ({
          id: row.id,
          date: row.date,
          amount: Number(row.amount),
          category: row.category || undefined,
          note: row.note || undefined,
        })) || []
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
        return (this.localStore.expenses[monthKey] ?? [])
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
      }
    }

    return (this.localStore.expenses[monthKey] ?? [])
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  async addExpense(monthKey: string, expense: Expense): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const user = await this.getCurrentUser()
        if (!user) {
          console.warn('User not authenticated, falling back to localStorage')
          this.useSupabase = false
        } else {
          const { error } = await supabase
            .from('expenses')
            .insert({
              id: expense.id,
              user_id: user.id,
              month_key: monthKey,
              date: expense.date,
              amount: expense.amount,
              category: expense.category,
              note: expense.note,
            })

          if (error) throw error
          return
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = this.localStore.expenses[monthKey] ? [...this.localStore.expenses[monthKey]] : []
    list.push(expense)
    this.localStore.expenses[monthKey] = list
    saveStoreToLocalStorage(this.localStore)
  }

  async removeExpense(monthKey: string, id: string): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = (this.localStore.expenses[monthKey] ?? []).filter((x) => x.id !== id)
    this.localStore.expenses[monthKey] = list
    saveStoreToLocalStorage(this.localStore)
  }

  // Plan operations
  async getPlans(monthKey: string): Promise<PlanItem[]> {
    if (this.useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('month_key', monthKey)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Supabase plans fetch error:', error)
          throw error
        }
        console.log('Plans loaded from Supabase:', data?.length || 0, 'items')
        return data?.map(row => ({
          id: row.id,
          monthKey: row.month_key,
          weekIndex: row.week_index,
          amount: Number(row.amount),
          category: row.category || undefined,
          note: row.note || undefined,
          targetDate: row.target_date || undefined,
        })) || []
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
        return this.localStore.plans[monthKey] ?? []
      }
    }

    return this.localStore.plans[monthKey] ?? []
  }

  async addPlan(monthKey: string, plan: PlanItem): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const user = await this.getCurrentUser()
        if (!user) {
          console.warn('User not authenticated, falling back to localStorage')
          this.useSupabase = false
        } else {
          const { error } = await supabase
            .from('plans')
            .insert({
              id: plan.id,
              user_id: user.id,
              month_key: monthKey,
              week_index: plan.weekIndex,
              amount: plan.amount,
              category: plan.category,
              note: plan.note,
              target_date: plan.targetDate,
            })

          if (error) {
            console.error('Supabase plans insert error:', error)
            throw error
          }
          console.log('Plan successfully saved to Supabase:', plan.id)
          return
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = this.localStore.plans[monthKey] ? [...this.localStore.plans[monthKey]] : []
    list.push(plan)
    this.localStore.plans[monthKey] = list
    saveStoreToLocalStorage(this.localStore)
  }

  async updatePlan(monthKey: string, id: string, updates: Partial<PlanItem>): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const dbUpdates: any = {}
        if (updates.weekIndex !== undefined) dbUpdates.week_index = updates.weekIndex
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.note !== undefined) dbUpdates.note = updates.note
        if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate

        const { error } = await supabase
          .from('plans')
          .update(dbUpdates)
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = (this.localStore.plans[monthKey] ?? []).map((x) =>
      x.id === id ? { ...x, ...updates } : x
    )
    this.localStore.plans[monthKey] = list
    saveStoreToLocalStorage(this.localStore)
  }

  async removePlan(monthKey: string, id: string): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('plans')
          .delete()
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = (this.localStore.plans[monthKey] ?? []).filter((x) => x.id !== id)
    this.localStore.plans[monthKey] = list
    saveStoreToLocalStorage(this.localStore)
  }

  async clearMonth(monthKey: string): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        await Promise.all([
          supabase.from('budgets').delete().eq('month_key', monthKey),
          supabase.from('expenses').delete().eq('month_key', monthKey),
          supabase.from('plans').delete().eq('month_key', monthKey),
        ])
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    this.localStore.budgets[monthKey] = 0
    this.localStore.expenses[monthKey] = []
    this.localStore.plans[monthKey] = []
    saveStoreToLocalStorage(this.localStore)
  }

  // Draft operations
  async getDrafts(): Promise<DraftItem[]> {
    if (this.useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Supabase drafts fetch error:', error)
          throw error
        }
        console.log('Drafts loaded from Supabase:', data?.length || 0, 'items')
        return data?.map(row => ({
          id: row.id,
          note: row.note,
          amount: row.amount ? Number(row.amount) : undefined,
          category: row.category || undefined,
          date: row.date || undefined,
        })) || []
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
        return this.localStore.drafts ?? []
      }
    }

    return this.localStore.drafts ?? []
  }

  async addDraft(draft: DraftItem): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const user = await this.getCurrentUser()
        if (!user) {
          console.warn('User not authenticated, falling back to localStorage')
          this.useSupabase = false
        } else {
          const { error } = await supabase
            .from('drafts')
            .insert({
              id: draft.id,
              user_id: user.id,
              note: draft.note,
              amount: draft.amount,
              category: draft.category,
              date: draft.date,
            })

          if (error) {
            console.error('Supabase drafts insert error:', error)
            throw error
          }
          console.log('Draft successfully saved to Supabase:', draft.id)
          return
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = [...this.localStore.drafts]
    list.push(draft)
    this.localStore.drafts = list
    saveStoreToLocalStorage(this.localStore)
  }

  async updateDraft(id: string, updates: Partial<DraftItem>): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const dbUpdates: any = {}
        if (updates.note !== undefined) dbUpdates.note = updates.note
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.date !== undefined) dbUpdates.date = updates.date

        const { error } = await supabase
          .from('drafts')
          .update(dbUpdates)
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = this.localStore.drafts.map((x) =>
      x.id === id ? { ...x, ...updates } : x
    )
    this.localStore.drafts = list
    saveStoreToLocalStorage(this.localStore)
  }

  async removeDraft(id: string): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('drafts')
          .delete()
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const list = this.localStore.drafts.filter((x) => x.id !== id)
    this.localStore.drafts = list
    saveStoreToLocalStorage(this.localStore)
  }

  async clearAllDrafts(): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('drafts')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    this.localStore.drafts = []
    saveStoreToLocalStorage(this.localStore)
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    if (this.useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (error) throw error
        return data?.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type as Account['type'],
          balance: Number(row.balance),
          currency: row.currency,
          icon: row.icon || undefined,
          color: row.color || undefined,
          isActive: row.is_active ?? true,
          notes: row.notes || undefined,
          createdAt: row.created_at || undefined,
          updatedAt: row.updated_at || undefined,
        })) || []
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
        return this.localStore.accounts.filter(a => a.isActive)
      }
    }

    return this.localStore.accounts.filter(a => a.isActive)
  }

  async addAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const newAccount: Account = {
      ...account,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (this.useSupabase && supabase) {
      try {
        const user = await this.getCurrentUser()
        if (!user) {
          console.warn('User not authenticated, falling back to localStorage')
          this.useSupabase = false
        } else {
          const { error } = await supabase
            .from('accounts')
            .insert({
              id: newAccount.id,
              user_id: user.id,
              name: newAccount.name,
              type: newAccount.type,
              balance: newAccount.balance,
              currency: newAccount.currency,
              icon: newAccount.icon,
              color: newAccount.color,
              is_active: newAccount.isActive,
              notes: newAccount.notes,
            })

          if (error) throw error
          return newAccount
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    this.localStore.accounts.push(newAccount)
    saveStoreToLocalStorage(this.localStore)
    return newAccount
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const dbUpdates: any = {}
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.type !== undefined) dbUpdates.type = updates.type
        if (updates.balance !== undefined) dbUpdates.balance = updates.balance
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon
        if (updates.color !== undefined) dbUpdates.color = updates.color
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes

        const { error } = await supabase
          .from('accounts')
          .update(dbUpdates)
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const index = this.localStore.accounts.findIndex(a => a.id === id)
    if (index !== -1) {
      this.localStore.accounts[index] = { ...this.localStore.accounts[index], ...updates }
      saveStoreToLocalStorage(this.localStore)
    }
  }

  async deleteAccount(id: string): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('accounts')
          .update({ is_active: false })
          .eq('id', id)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const account = this.localStore.accounts.find(a => a.id === id)
    if (account) {
      account.isActive = false
      saveStoreToLocalStorage(this.localStore)
    }
  }

  async getAccountTransactions(accountId?: string): Promise<AccountTransaction[]> {
    if (this.useSupabase && supabase) {
      try {
        let query = supabase
          .from('account_transactions')
          .select('*')
          .order('date', { ascending: false })

        if (accountId) {
          query = query.eq('account_id', accountId)
        }

        const { data, error } = await query

        if (error) throw error
        return data?.map(row => ({
          id: row.id,
          accountId: row.account_id,
          type: row.type as AccountTransaction['type'],
          amount: Number(row.amount),
          date: row.date,
          note: row.note || undefined,
          category: row.category || undefined,
          expenseId: row.expense_id || undefined,
          transferToAccountId: row.transfer_to_account_id || undefined,
          createdAt: row.created_at || undefined,
          updatedAt: row.updated_at || undefined,
        })) || []
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
        return accountId
          ? this.localStore.accountTransactions.filter(t => t.accountId === accountId)
          : this.localStore.accountTransactions
      }
    }

    return accountId
      ? this.localStore.accountTransactions.filter(t => t.accountId === accountId)
      : this.localStore.accountTransactions
  }

  async addAccountTransaction(transaction: Omit<AccountTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newTransaction: AccountTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (this.useSupabase && supabase) {
      try {
        const user = await this.getCurrentUser()
        if (!user) {
          console.warn('User not authenticated, falling back to localStorage')
          this.useSupabase = false
        } else {
          const { error } = await supabase
            .from('account_transactions')
            .insert({
              id: newTransaction.id,
              user_id: user.id,
              account_id: newTransaction.accountId,
              type: newTransaction.type,
              amount: newTransaction.amount,
              date: newTransaction.date,
              note: newTransaction.note,
              category: newTransaction.category,
              expense_id: newTransaction.expenseId,
              transfer_to_account_id: newTransaction.transferToAccountId,
            })

          if (error) throw error

          // Update account balance
          const balanceChange = transaction.type === 'withdrawal' ? -transaction.amount : transaction.amount
          await this.updateAccountBalance(transaction.accountId, balanceChange)

          return
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    this.localStore.accountTransactions.push(newTransaction)

    // Update account balance in localStorage
    const account = this.localStore.accounts.find(a => a.id === transaction.accountId)
    if (account) {
      const balanceChange = transaction.type === 'withdrawal' ? -transaction.amount : transaction.amount
      account.balance += balanceChange
    }

    saveStoreToLocalStorage(this.localStore)
  }

  async updateAccountBalance(accountId: string, change: number): Promise<void> {
    if (this.useSupabase && supabase) {
      try {
        const { data: account, error: fetchError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', accountId)
          .single()

        if (fetchError) throw fetchError

        const newBalance = Number(account.balance) + change

        const { error: updateError } = await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', accountId)

        if (updateError) throw updateError
        return
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
      }
    }

    const account = this.localStore.accounts.find(a => a.id === accountId)
    if (account) {
      account.balance += change
      saveStoreToLocalStorage(this.localStore)
    }
  }
}

// Export singleton instance
export const dataService = new DataService()