<template>
  <q-page class="categories-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <!-- <q-toolbar-title>
            <h1 class="page-title">{{ $t('categories.title') }}</h1>
          </q-toolbar-title> -->
          <q-toolbar-title class="main-title">
            {{ $t('categories.title') }}
          </q-toolbar-title>
          <q-btn
            :label="$t('categories.addCategory')"
            color="primary"
            icon="add"
            @click="showCategoryDialog = true"
            class="add-button"
          />
        </div>

        <UiCard class="filters-card">
          <div class="filters-grid">
            <q-input
              v-model="searchQuery"
              :label="$t('common.search')"
              outlined
              dense
              clearable
              class="search-input"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              v-model="type"
              :options="typeOptions"
              :label="$t('expenses.category')"
              outlined
              dense
              clearable
              option-value="value"
              option-label="label"
              emit-value
              map-options
              class="category-filter"
            />

            <q-btn
              :label="$t('common.filter')"
              color="primary"
              outline
              @click="applyFilters"
              class="filter-button"
            />
          </div>
        </UiCard>
      </div>

      <UiCard class="income-list-card">
        <!-- Categories Grid -->
        <div v-if="categoriesStore.loading" class="loading-state">
          <q-spinner size="40px" color="primary" />
          <p>{{ $t('common.loading') }}</p>
        </div>

        <div v-else-if="categoriesStore.categories.length === 0" class="empty-state">
          <q-icon name="category" size="4rem" color="grey-4" />
          <h3>{{ $t('categories.noCategories') }}</h3>
          <q-btn
            :label="$t('categories.addCategory')"
            color="primary"
            @click="showCategoryDialog = true"
          />
        </div>
        <q-table
          v-else
          flat
          :rows="categoryRows"
          :columns="columns"
          row-key="id"
          dense
          :loading="categoriesStore.loading"
          class="q-mt-md"
        >
          <template #body-cell-display="props">
            <q-td :props="props">
              <div class="display-cell">
                <q-avatar
                  :color="props.row.display?.color || '#10b981'"
                  text-color="white"
                  size="32px"
                  class="q-mr-sm"
                >
                  <q-icon
                    color="black"
                    :name="props.row.display?.icon || 'account_balance_wallet'"
                  />
                </q-avatar>
                <span>{{ props.row.display?.name || 'Uncategorized' }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                dense
                round
                icon="edit"
                class="q-mr-xs"
                @click="editCategory(props.row.actions)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row.actions)"
              />
            </q-td>
          </template>
        </q-table>
      </UiCard>
    </div>

    <!-- Add/Edit Category Dialog -->
    <q-dialog v-model="showCategoryDialog" persistent>
      <q-card class="responsive-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            {{ editingCategory ? $t('categories.editCategory') : $t('categories.addCategory') }}
          </div>
        </q-card-section>

        <q-card-section>
          <CategoryForm
            :category="editingCategory"
            :loading="categoriesStore.loading"
            @submit="handleSubmit"
            @cancel="closeDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('categories.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showDeleteDialog = false" />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="handleDelete"
            :loading="categoriesStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import CategoryForm from 'src/components/forms/CategoryForm.vue';
import UiCard from 'src/components/ui/UiCard.vue';
import type { CategoryForm as CategoryFormType } from 'src/schemas';
import { useCategoriesStore } from 'src/stores/categories';
import { useExpensesStore } from 'src/stores/expenses';
import { useIncomeStore } from 'src/stores/income';
import type { Category } from 'src/types';
import { computed, onMounted, ref } from 'vue';

const categoriesStore = useCategoriesStore();
const expensesStore = useExpensesStore();
const incomeStore = useIncomeStore();

const showCategoryDialog = ref(false);
const showDeleteDialog = ref(false);
const editingCategory = ref<Category | null | undefined>(null);
const categoryToDelete = ref<Category | null>(null);

const searchQuery = ref('');
const type = ref('');
const typeOptions = ref(['expense', 'income', 'both']);

const columns = [
  {
    name: 'display',
    label: 'Category',
    field: 'display',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'category_type',
    label: 'Type',
    field: 'category_type',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'expenses',
    label: 'Expenses',
    field: 'expenseCount',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'income',
    label: 'Income',
    field: 'incomeCount',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'totalExpense',
    label: 'Total Expense (₹)',
    field: 'totalAmountOfExpense',
    align: 'right' as const,
    sortable: true,
    format: (val: number) => `₹${formatAmount(val)}`,
  },
  {
    name: 'totalIncome',
    label: 'Total Income (₹)',
    field: 'totalAmountOfIncome',
    align: 'right' as const,
    sortable: true,
    format: (val: number) => `₹${formatAmount(val)}`,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'right' as const,
    sortable: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format: (_: any, row: any) => row, // Pass row to slot
  },
];

const categoryRows = computed(() =>
  categoriesStore.filteredIncome.map((category: Category) => ({
    id: category.id,
    display: {
      name: category.name,
      icon: category.icon,
      color: category.color,
    },
    category_type: category.category_type,
    expenseCount: getCategoryExpenseCount(category.id),
    incomeCount: getCategoryIncomeCount(category.id),
    totalAmountOfExpense: getCategoryTotalExpanse(category.id),
    totalAmountOfIncome: getCategoryTotalIncome(category.id),
    actions: category,
  })),
);

function applyFilters() {
  categoriesStore.setFilters({
    search: searchQuery.value,
    type: type.value,
  });
}

function getCategoryExpenseCount(categoryId: string): number {
  return expensesStore.expenses.filter((expense) => expense.category_id === categoryId).length;
}
function getCategoryIncomeCount(categoryId: string): number {
  return incomeStore.income.filter((income) => income.category_id === categoryId).length;
}

function getCategoryTotalExpanse(categoryId: string): number {
  return expensesStore.expenses
    .filter((expense) => expense.category_id === categoryId)
    .reduce((total, expense) => total + expense.amount, 0);
}

function getCategoryTotalIncome(categoryId: string): number {
  return incomeStore.income
    .filter((income) => income.category_id === categoryId)
    .reduce((total, income) => total + income.amount, 0);
}

function editCategory(category: Category) {
  editingCategory.value = category;
  showCategoryDialog.value = true;
}

function confirmDelete(category: Category) {
  categoryToDelete.value = category;
  showDeleteDialog.value = true;
}

async function handleSubmit(formData: CategoryFormType) {
  let result;

  if (editingCategory.value) {
    result = await categoriesStore.updateCategory(editingCategory.value.id, formData);
  } else {
    result = await categoriesStore.createCategory(formData);
  }

  if (result.success) {
    closeDialog();
  }
}

async function handleDelete() {
  if (categoryToDelete.value) {
    const result = await categoriesStore.deleteCategory(categoryToDelete.value.id);
    if (result.success) {
      showDeleteDialog.value = false;
      categoryToDelete.value = null;
    }
  }
}

function closeDialog() {
  showCategoryDialog.value = false;
  editingCategory.value = null;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    expensesStore.fetchExpenses(),
    incomeStore.fetchIncome(),
  ]);
});
</script>

<style lang="scss" scoped>
.income-list-card {
  .loading-state,
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;

    h3 {
      margin: 1rem 0;
      color: #374151;
    }
  }
}

.categories-page {
  background: #f8fafc;
  min-height: 100vh;
}

.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .add-button {
      border-radius: 8px;
      text-transform: none;
      font-weight: 600;
    }
  }
}

.filters-card {
  .filters-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    gap: 1rem;
    align-items: end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .filter-button {
      height: 100%;
    }
  }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;

  h3 {
    margin: 1rem 0;
    color: #374151;
  }
}

.categories-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.category-card {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .category-content {
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .category-actions {
        display: flex;
        gap: 0.25rem;

        .action-btn {
          width: 32px;
          height: 32px;

          &.delete-btn {
            color: #ef4444;

            &:hover {
              background: #fef2f2;
            }
          }
        }
      }
    }

    .category-info {
      .category-name {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 0.75rem 0;
      }

      .category-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .expense-count {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .total-amount {
          font-weight: 600;
          color: #059669;
          font-size: 1.1rem;
        }
      }
    }
  }

  .income-table {
    .category-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}

.dialog-header {
  border-bottom: 1px solid #e5e7eb;
}

.responsive-card {
  min-width: 200px;
}

@media (min-width: 400px) {
  .responsive-card {
    min-width: 320px;
  }
}

@media (min-width: 600px) {
  .responsive-card {
    min-width: 500px;
  }
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
</style>
