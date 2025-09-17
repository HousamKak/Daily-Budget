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

export type Store = {
  budgets: Record<string, number>
  expenses: Record<string, Expense[]>
  plans: Record<string, PlanItem[]>
}

// LocalStorage fallback
const STORAGE_KEY = "paper-budget-cartoon-v1"

const defaultStore: Store = { budgets: {}, expenses: {}, plans: {} }

function loadStoreFromLocalStorage(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultStore }
    const parsed = JSON.parse(raw) as Store
    return {
      budgets: parsed.budgets ?? {},
      expenses: parsed.expenses ?? {},
      plans: parsed.plans ?? {},
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

        if (error && error.code !== 'PGRST116') throw error
        return data?.amount || 0
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
            .upsert({ month_key: monthKey, amount, user_id: user.id })

          if (error) throw error
          return
        }
      } catch (error) {
        console.warn('Supabase error, falling back to localStorage:', error)
        this.useSupabase = false
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

        if (error) throw error
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

          if (error) throw error
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
}

// Export singleton instance
export const dataService = new DataService()