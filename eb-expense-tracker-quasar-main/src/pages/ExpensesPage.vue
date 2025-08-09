<template>
  <q-page class="expenses-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <q-toolbar-title class="page-title">
            {{ $t('expenses.title') }}
          </q-toolbar-title>
          <q-btn
            :label="$t('expenses.addExpense')"
            color="primary"
            icon="add"
            @click="showExpenseDialog = true"
            class="add-button"
          />
        </div>

        <!-- Filters -->
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
              v-model="selectedCategory"
              :options="categoryOptions"
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

            <q-input
              v-model="fromDate"
              :label="$t('reports.fromDate')"
              type="date"
              outlined
              dense
              class="date-input"
            />

            <q-input
              v-model="toDate"
              :label="$t('reports.toDate')"
              type="date"
              outlined
              dense
              class="date-input"
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

      <!-- Expenses List -->
      <UiCard class="expenses-list-card">
        <div v-if="expensesStore.loading" class="loading-state">
          <q-spinner size="40px" color="primary" />
          <p>{{ $t('common.loading') }}</p>
        </div>

        <div v-else-if="filteredExpenses.length === 0" class="empty-state">
          <q-icon name="receipt_long" size="4rem" color="grey-4" />
          <h3>{{ $t('expenses.noExpenses') }}</h3>
          <q-btn
            :label="$t('expenses.addExpense')"
            color="primary"
            @click="showExpenseDialog = true"
          />
        </div>

        <q-table
          v-else
          dense
          flat
          :rows="filteredExpenses"
          :columns="columns"
          row-key="id"
          class="expenses-table"
        >
          <template #body-cell-category="props">
            <q-td :props="props">
              <div class="category-cell">
                <q-avatar
                  :color="props.row.category?.color || '#6b7280'"
                  text-color="white"
                  size="32px"
                  class="q-mr-sm"
                >
                  <q-icon color="black" :name="props.row.category?.icon || 'receipt'" />
                </q-avatar>
                <span>{{ props.row.category?.name || 'Uncategorized' }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td :props="props">
              <span class="amount negative">₹{{ formatAmount(props.row.amount) }}</span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round dense icon="edit" @click="editExpense(props.row)" />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </UiCard>
    </div>

    <!-- Add/Edit Expense Dialog -->
    <q-dialog v-model="showExpenseDialog" persistent>
      <q-card class="responsive-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            {{ editingExpense ? $t('expenses.editExpense') : $t('expenses.addExpense') }}
          </div>
        </q-card-section>

        <q-card-section>
          <ExpenseForm
            :expense="editingExpense"
            :loading="expensesStore.loading"
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
          <span class="q-ml-sm">{{ $t('expenses.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showDeleteDialog = false" />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="handleDelete"
            :loading="expensesStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import ExpenseForm from 'src/components/forms/ExpenseForm.vue';
import UiCard from 'src/components/ui/UiCard.vue';
import type { ExpenseForm as ExpenseFormType } from 'src/schemas';
import { useCategoriesStore } from 'src/stores/categories';
import { useExpensesStore } from 'src/stores/expenses';
import type { Expense } from 'src/types';
import { computed, onMounted, ref, watch } from 'vue';

import { format } from 'date-fns';

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const showExpenseDialog = ref(false);
const showDeleteDialog = ref(false);
const editingExpense = ref<Expense | null>(null);
const expenseToDelete = ref<Expense | null>(null);

const searchQuery = ref('');
const selectedCategory = ref('');
const fromDate = ref('');
const toDate = ref('');

const columns = [
  {
    name: 'date',
    label: 'Date',
    field: (row: Expense) => formatDate(row.date),
    align: 'left' as const,
    sortable: true,
    sortMethod: (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
  },
  {
    name: 'title',
    label: 'Title',
    field: 'title',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'amount',
    label: 'Amount (₹)',
    field: 'amount',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'right' as const,
  },
];

const categoryOptions = computed(() => [
  { label: 'All Categories', value: '' },
  ...categoriesStore.categories
    .filter(({ category_type }) => category_type === 'expense' || category_type === 'both')
    .map(({ id, name }) => ({
      label: name,
      value: id,
    })),
]);

const filteredExpenses = computed(() => {
  return expensesStore.expenses.filter((expense) => {
    if (
      searchQuery.value &&
      !expense.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) {
      return false;
    }
    if (selectedCategory.value && expense.category_id !== selectedCategory.value) {
      return false;
    }
    if (fromDate.value && expense.date < fromDate.value) {
      return false;
    }
    if (toDate.value && expense.date > toDate.value) {
      return false;
    }
    return true;
  });
});

function applyFilters() {
  expensesStore.setFilters({
    search: searchQuery.value,
    category_id: selectedCategory.value,
    fromDate: fromDate.value,
    toDate: toDate.value,
  });
}

function editExpense(expense: Expense) {
  editingExpense.value = expense;
  showExpenseDialog.value = true;
}

function confirmDelete(expense: Expense) {
  expenseToDelete.value = expense;
  showDeleteDialog.value = true;
}

async function handleSubmit(formData: ExpenseFormType) {
  let result;

  if (editingExpense.value) {
    result = await expensesStore.updateExpense(editingExpense.value.id, formData);
  } else {
    result = await expensesStore.createExpense(formData);
  }

  if (result.success) {
    closeDialog();
  }
}

async function handleDelete() {
  if (expenseToDelete.value) {
    const result = await expensesStore.deleteExpense(expenseToDelete.value.id);
    if (result.success) {
      showDeleteDialog.value = false;
      expenseToDelete.value = null;
    }
  }
}

function closeDialog() {
  showExpenseDialog.value = false;
  editingExpense.value = null;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM dd, yyyy');
}

onMounted(async () => {
  await Promise.all([expensesStore.fetchExpenses(), categoriesStore.fetchCategories()]);
});

watch([searchQuery, selectedCategory, fromDate, toDate], () => {
  applyFilters();
});
</script>

<style lang="scss" scoped>
.expenses-page {
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

.expenses-list-card {
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

.expenses-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.expense-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .expense-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .expense-category {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .category-name {
        font-weight: 500;
        color: #374151;
      }
    }

    .expense-actions {
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

  .expense-content {
    .expense-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .expense-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .expense-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .expense-date {
        color: #9ca3af;
        font-size: 0.875rem;
      }

      .expense-amount {
        font-size: 1.25rem;
        font-weight: 700;
        color: #059669;
      }
    }
  }
}

.dialog-header {
  border-bottom: 1px solid #e5e7eb;
}

.expenses-table {
  .category-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  td {
    vertical-align: middle;
  }

  .amount {
    font-weight: 600;

    &.negative {
      color: #d31225e3;
    }
  }
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
</style>
