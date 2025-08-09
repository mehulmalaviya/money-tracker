import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { supabase } from 'src/boot/supabase';
import type { CategoryForm } from 'src/schemas';
import type { Category } from 'src/types';
import { computed, ref } from 'vue';

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const filters = ref({
    type: '',
    search: '',
  });

  const filteredIncome = computed(() => {
    return categories.value.filter((category) => {
      if (filters.value.type && category.category_type !== filters.value.type) {
        return false;
      }

      if (
        filters.value.search &&
        !category.name.toLowerCase().includes(filters.value.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  });

  async function fetchCategories() {
    loading.value = true;
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
 
      if (error) throw error;
      categories.value = data || [];
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to fetch categories',
      });
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(categoryData: CategoryForm) {
    loading.value = true;
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not found');
      }

      const payload = {
        ...categoryData,
        user_id: user.data.user.id,
      };

      const { data, error } = await supabase.from('categories').insert([payload]).select().single();

      if (error) throw error;

      categories.value.push(data);

      Notify.create({
        type: 'positive',
        message: 'Category added successfully',
      });

      return { success: true, data };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to create category',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function updateCategory(id: string, categoryData: CategoryForm) {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = data;
      }

      Notify.create({
        type: 'positive',
        message: 'Category updated successfully',
      });

      return { success: true, data };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to update category',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function deleteCategory(id: string) {
    loading.value = true;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;

      categories.value = categories.value.filter((c) => c.id !== id);

      Notify.create({
        type: 'positive',
        message: 'Category deleted successfully',
      });

      return { success: true };
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Failed to delete category',
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
      type: '',
      search: '',
    };
  }

  return {
    filteredIncome,
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearFilters,
    setFilters,
  };
});
