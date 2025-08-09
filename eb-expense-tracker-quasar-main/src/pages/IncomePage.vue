<template>
  <q-page class="income-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <q-toolbar-title class="page-title">
            {{ $t('income.title') }}
          </q-toolbar-title>
          <q-btn
            :label="$t('income.addIncome')"
            color="primary"
            icon="add"
            @click="showIncomeDialog = true"
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
              :label="$t('income.category')"
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

      <!-- Income List -->
      <UiCard class="income-list-card">
        <div v-if="incomeStore.loading" class="loading-state">
          <q-spinner size="40px" color="positive" />
          <p>{{ $t('common.loading') }}</p>
        </div>

        <div v-else-if="filteredIncome.length === 0" class="empty-state">
          <q-icon name="account_balance_wallet" size="4rem" color="grey-4" />
          <h3>{{ $t('income.noIncome') }}</h3>
          <q-btn :label="$t('income.addIncome')" color="primary" @click="showIncomeDialog = true" />
        </div>

        <q-table
          v-else
          dense
          flat
          :rows="filteredIncome"
          :columns="columns"
          row-key="id"
          class="income-table"
        >
          <template #body-cell-category="props">
            <q-td :props="props">
              <div class="category-cell">
                <q-avatar
                  :color="props.row.category?.color || '#10b981'"
                  text-color="white"
                  size="32px"
                  class="q-mr-sm"
                >
                  <q-icon
                    color="black"
                    :name="props.row.category?.icon || 'account_balance_wallet'"
                  />
                </q-avatar>
                <span>{{ props.row.category?.name || 'Uncategorized' }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td :props="props">
              <span class="amount positive">+₹{{ formatAmount(props.row.amount) }}</span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round dense icon="edit" @click="editIncome(props.row)" class="q-mr-xs" />
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

    <!-- Add/Edit Income Dialog -->
    <q-dialog v-model="showIncomeDialog" persistent>
      <q-card class="responsive-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            {{ editingIncome ? $t('income.editIncome') : $t('income.addIncome') }}
          </div>
        </q-card-section>

        <q-card-section>
          <IncomeForm
            :income="editingIncome"
            :loading="incomeStore.loading"
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
          <span class="q-ml-sm">{{ $t('income.deleteConfirm') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="showDeleteDialog = false" />
          <q-btn
            flat
            :label="$t('common.delete')"
            color="negative"
            @click="handleDelete"
            :loading="incomeStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import IncomeForm from 'src/components/forms/IncomeForm.vue';
import UiCard from 'src/components/ui/UiCard.vue';
import type { IncomeForm as IncomeFormType } from 'src/schemas';
import { useCategoriesStore } from 'src/stores/categories';
import { useIncomeStore } from 'src/stores/income';
import type { Income } from 'src/types';
import { computed, onMounted, ref, watch } from 'vue';

const incomeStore = useIncomeStore();
const categoriesStore = useCategoriesStore();

const showIncomeDialog = ref(false);
const showDeleteDialog = ref(false);
const editingIncome = ref<Income | null>(null);
const incomeToDelete = ref<Income | null>(null);

const searchQuery = ref('');
const selectedCategory = ref('');
const fromDate = ref('');
const toDate = ref('');

const columns = [
  {
    name: 'date',
    label: 'Date',
    field: (row: Income) => formatDate(row.date),
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
    label: 'Amount',
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
    .filter(({ category_type }) => category_type === 'income' || category_type === 'both')
    .map(({ id, name }) => ({
      label: name,
      value: id,
    })),
]);

const filteredIncome = computed(() => {
  return incomeStore.income.filter((incomeItem) => {
    if (
      searchQuery.value &&
      !incomeItem.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) {
      return false;
    }
    if (selectedCategory.value && incomeItem.category_id !== selectedCategory.value) {
      return false;
    }
    if (fromDate.value && incomeItem.date < fromDate.value) {
      return false;
    }
    if (toDate.value && incomeItem.date > toDate.value) {
      return false;
    }
    return true;
  });
});

function applyFilters() {
  incomeStore.setFilters({
    search: searchQuery.value,
    category_id: selectedCategory.value,
    fromDate: fromDate.value,
    toDate: toDate.value,
  });
}

function editIncome(incomeItem: Income) {
  editingIncome.value = incomeItem;
  showIncomeDialog.value = true;
}

function confirmDelete(incomeItem: Income) {
  incomeToDelete.value = incomeItem;
  showDeleteDialog.value = true;
}

async function handleSubmit(formData: IncomeFormType) {
  let result;

  if (editingIncome.value) {
    result = await incomeStore.updateIncome(editingIncome.value.id, formData);
  } else {
    result = await incomeStore.createIncome(formData);
  }

  if (result.success) {
    closeDialog();
  }
}

async function handleDelete() {
  if (incomeToDelete.value) {
    const result = await incomeStore.deleteIncome(incomeToDelete.value.id);
    if (result.success) {
      showDeleteDialog.value = false;
      incomeToDelete.value = null;
    }
  }
}

function closeDialog() {
  showIncomeDialog.value = false;
  editingIncome.value = null;
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
  await Promise.all([incomeStore.fetchIncome(), categoriesStore.fetchCategories()]);
});

watch([searchQuery, selectedCategory, fromDate, toDate], () => {
  applyFilters();
});
</script>

<style lang="scss" scoped>
.income-page {
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

.income-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.income-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  border-left: 4px solid #10b981;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .income-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .income-category {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .category-name {
        font-weight: 500;
        color: #374151;
      }
    }

    .income-actions {
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

  .income-content {
    .income-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .income-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .income-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .income-date {
        color: #9ca3af;
        font-size: 0.875rem;
      }

      .income-amount {
        font-size: 1.25rem;
        font-weight: 700;

        &.positive {
          color: #10b981;
        }
      }
    }
  }
}

.dialog-header {
  border-bottom: 1px solid #e5e7eb;
}

.income-table {
  .category-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .amount {
    font-weight: 600;

    &.positive {
      color: #10b981;
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
