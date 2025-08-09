import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import type { Expense } from 'src/types';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { supabase } from 'src/boot/supabase';
import type { ExpenseForm } from 'src/schemas';

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref<Expense[]>([]);
  const loading = ref(false);
  const filters = ref({
    category_id: '',
    fromDate: '',
    toDate: '',
    search: '',
  });

  const filteredExpenses = computed(() => {
    return expenses.value.filter((expense) => {
      if (filters.value.category_id && expense.category_id !== filters.value.category_id) {
        return false;
      }
      if (filters.value.fromDate && expense.date < filters.value.fromDate) {
        return false;
      }
      if (filters.value.toDate && expense.date > filters.value.toDate) {
        return false;
      }
      if (
        filters.value.search &&
        !expense.title.toLowerCase().includes(filters.value.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  });

  const monthlyTotal = computed(() => {
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

    return expenses.value
      .filter((expense) => expense.date >= monthStart && expense.date <= monthEnd)
      .reduce((total, expense) => total + expense.amount, 0);
  });

  const totalExpenses = computed(() => {
    return expenses.value.reduce((total, expense) => total + expense.amount, 0);
  });

  const recentExpenses = computed(() => {
    return expenses.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  });

  async function fetchExpenses() {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .order('date', { ascending: false });

      if (error) throw error;
      expenses.value = data || [];
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to fetch expenses',
      });
    } finally {
      loading.value = false;
    }
  }

  async function createExpense(expenseData: ExpenseForm) {
    loading.value = true;
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not found');
      }

      const payload = {
        ...expenseData,
        user_id: user.data.user.id,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([payload])
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .single();

      if (error) throw error;

      expenses.value.unshift(data);

      Notify.create({
        type: 'positive',
        message: 'Expense added successfully',
      });

      return { success: true, data };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to create expense',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function updateExpense(id: string, expenseData: ExpenseForm) {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .single();

      if (error) throw error;

      const index = expenses.value.findIndex((e) => e.id === id);
      if (index !== -1) {
        expenses.value[index] = data;
      }

      Notify.create({
        type: 'positive',
        message: 'Expense updated successfully',
      });

      return { success: true, data };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to update expense',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function deleteExpense(id: string) {
    loading.value = true;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;

      expenses.value = expenses.value.filter((e) => e.id !== id);

      Notify.create({
        type: 'positive',
        message: 'Expense deleted successfully',
      });

      return { success: true };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to delete expense',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters() {
    filters.value = {
      category_id: '',
      fromDate: '',
      toDate: '',
      search: '',
    };
  }

  return {
    expenses,
    loading,
    filters,
    filteredExpenses,
    monthlyTotal,
    totalExpenses,
    recentExpenses,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    setFilters,
    clearFilters,
  };
});
