import { endOfMonth, format, startOfMonth } from 'date-fns';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { supabase } from 'src/boot/supabase';
import type { IncomeForm } from 'src/schemas';
import type { Income } from 'src/types';
import { computed, ref } from 'vue';

export const useIncomeStore = defineStore('income', () => {
  const income = ref<Income[]>([]);
  const loading = ref(false);
  const filters = ref({
    category_id: '',
    fromDate: '',
    toDate: '',
    search: '',
  });

  const filteredIncome = computed(() => {
    return income.value.filter((incomeItem) => {
      if (filters.value.category_id && incomeItem.category_id !== filters.value.category_id) {
        return false;
      }
      if (filters.value.fromDate && incomeItem.date < filters.value.fromDate) {
        return false;
      }
      if (filters.value.toDate && incomeItem.date > filters.value.toDate) {
        return false;
      }
      if (
        filters.value.search &&
        !incomeItem.title.toLowerCase().includes(filters.value.search.toLowerCase())
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

    return income.value
      .filter((incomeItem) => incomeItem.date >= monthStart && incomeItem.date <= monthEnd)
      .reduce((total, incomeItem) => total + incomeItem.amount, 0);
  });

  const totalIncome = computed(() => {
    return income.value.reduce((total, incomeItem) => total + incomeItem.amount, 0);
  });

  const recentIncome = computed(() => {
    return income.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  });

  async function fetchIncome() {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('income')
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .order('date', { ascending: false });

      if (error) throw error;
      income.value = data || [];
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to fetch income',
      });
    } finally {
      loading.value = false;
    }
  }

  async function createIncome(incomeData: IncomeForm) {
    loading.value = true;
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not found');
      }

      const payload = {
        ...incomeData,
        user_id: user.data.user.id,
      };

      const { data, error } = await supabase
        .from('income')
        .insert([payload])
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .single();

      if (error) throw error;

      income.value.unshift(data);

      Notify.create({
        type: 'positive',
        message: 'Income added successfully',
      });

      return { success: true, data };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to create income',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function updateIncome(id: string, incomeData: IncomeForm) {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('income')
        .update(incomeData)
        .eq('id', id)
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .single();

      if (error) throw error;

      const index = income.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        income.value[index] = data;
      }

      Notify.create({
        type: 'positive',
        message: 'Income updated successfully',
      });

      return { success: true, data };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to update income',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function deleteIncome(id: string) {
    loading.value = true;
    try {
      const { error } = await supabase.from('income').delete().eq('id', id);

      if (error) throw error;

      income.value = income.value.filter((i) => i.id !== id);

      Notify.create({
        type: 'positive',
        message: 'Income deleted successfully',
      });

      return { success: true };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to delete income',
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
    income,
    loading,
    filters,
    filteredIncome,
    monthlyTotal,
    totalIncome,
    recentIncome,
    fetchIncome,
    createIncome,
    updateIncome,
    deleteIncome,
    setFilters,
    clearFilters,
  };
});
