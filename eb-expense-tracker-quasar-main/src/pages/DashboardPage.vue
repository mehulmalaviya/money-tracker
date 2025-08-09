<template>
  <q-page class="dashboard-page">
    <div class="dashboard-container">
      <div class="page-header">
        <h1 class="page-title">{{ $t('dashboard.title') }}</h1>
        <p class="page-subtitle">{{ $t('dashboard.financialOverview') }}</p>
      </div>

      <div class="dashboard-grid">
        <!-- Financial Overview Cards -->
        <div class="stats-grid">
          <UiCard class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total-income">
                <q-icon name="trending_up" size="2rem" />
              </div>
              <div class="stat-info">
                <h3 class="stat-value positive">+₹{{ formatAmount(incomeStore.totalIncome) }}</h3>
                <p class="stat-label">{{ $t('dashboard.totalIncome') }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total-expenses">
                <q-icon name="trending_down" size="2rem" />
              </div>
              <div class="stat-info">
                <h3 class="stat-value negative">
                  -₹{{ formatAmount(expensesStore.totalExpenses) }}
                </h3>
                <p class="stat-label">{{ $t('dashboard.totalExpenses') }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="stat-card">
            <div class="stat-content">
              <div class="stat-icon net-income">
                <q-icon name="account_balance_wallet" size="2rem" />
              </div>
              <div class="stat-info">
                <h3 class="stat-value" :class="netIncomeClass">
                  {{ netIncomeFormatted }}
                </h3>
                <p class="stat-label">{{ $t('dashboard.netIncome') }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="stat-card">
            <div class="stat-content">
              <div class="stat-icon monthly-summary">
                <q-icon name="calendar_month" size="2rem" />
              </div>
              <div class="stat-info">
                <h3 class="stat-value" :class="monthlyNetClass">
                  {{ monthlyNetFormatted }}
                </h3>
                <p class="stat-label">{{ $t('dashboard.thisMonth') }}</p>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Recent Transactions -->
        <UiCard class="recent-transactions">
          <template #header>
            <h2 class="card-title">{{ $t('dashboard.recentTransactions') }}</h2>
          </template>

          <div v-if="recentTransactions.length === 0" class="no-data">
            <q-icon name="receipt" size="3rem" color="grey-4" />
            <p>No recent transactions</p>
          </div>

          <q-table
            v-else
            dense
            flat
            :rows="recentTransactions"
            :columns="transactionColumns"
            row-key="id"
            class="transactions-table"
          >
            <template #body-cell-category="props">
              <q-td :props="props">
                <div class="category-cell">
                  <q-avatar
                    :color="
                      props.row.category?.color ||
                      (props.row.type === 'income' ? '#10b981' : '#ef4444')
                    "
                    text-color="white"
                    size="32px"
                    class="q-mr-sm"
                  >
                    <q-icon
                      color="black"
                      :name="
                        props.row.category?.icon ||
                        (props.row.type === 'income' ? 'trending_up' : 'trending_down')
                      "
                    />
                  </q-avatar>
                  <span>
                    {{ props.row.category?.name || 'Uncategorized' }}
                  </span>
                </div>
              </q-td>
            </template>

            <template #body-cell-amount="props">
              <q-td :props="props">
                <span :class="`amount ${props.row.type === 'income' ? 'positive' : 'negative'}`">
                  {{ props.row.type === 'income' ? '+' : '-' }}₹{{ formatAmount(props.row.amount) }}
                </span>
              </q-td>
            </template>
          </q-table>
        </UiCard>

        <!-- Top Categories -->
        <UiCard class="top-categories">
          <template #header>
            <h2 class="card-title">{{ $t('dashboard.topCategories') }}</h2>
          </template>

          <q-tabs v-model="activeTab" dense class="category-tabs">
            <q-tab name="expenses" label="Expenses" />
            <q-tab name="income" label="Income" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated class="panel">
            <q-tab-panel name="expenses">
              <div class="category-list">
                <div
                  v-for="(category, index) in topExpenseCategories"
                  :key="index"
                  class="category-item"
                >
                  <div class="category-icon">
                    <q-avatar :color="category.color" text-color="white" size="32px">
                      <q-icon color="black" :name="category.icon || 'category'" size="18px" />
                    </q-avatar>
                  </div>
                  <div class="category-info">
                    <h4 class="category-name">{{ category.name }}</h4>
                    <div class="category-progress">
                      <q-linear-progress
                        :value="category.percentage / 100"
                        color="negative"
                        size="4px"
                        rounded
                      />
                    </div>
                  </div>
                  <div class="category-amount">
                    <span class="amount negative">-₹{{ formatAmount(category.total) }}</span>
                    <span class="percentage">{{ category.percentage.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="income">
              <div class="category-list">
                <div
                  v-for="(category, index) in topIncomeCategories"
                  :key="index"
                  class="category-item"
                >
                  <div class="category-icon">
                    <q-avatar :color="category.color" text-color="white" size="32px">
                      <q-icon :name="category.icon || 'category'" size="18px" />
                    </q-avatar>
                  </div>
                  <div class="category-info">
                    <h4 class="category-name">{{ category.name }}</h4>
                    <div class="category-progress">
                      <q-linear-progress
                        :value="category.percentage / 100"
                        color="positive"
                        size="4px"
                        rounded
                      />
                    </div>
                  </div>
                  <div class="category-amount">
                    <span class="amount positive">+₹{{ formatAmount(category.total) }}</span>
                    <span class="percentage">{{ category.percentage.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </UiCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import UiCard from 'src/components/ui/UiCard.vue';
import { useCategoriesStore } from 'src/stores/categories';
import { useExpensesStore } from 'src/stores/expenses';
import { useIncomeStore } from 'src/stores/income';
import { computed, onMounted, ref } from 'vue';

const expensesStore = useExpensesStore();
const incomeStore = useIncomeStore();
const categoriesStore = useCategoriesStore();
const activeTab = ref('expenses');

const transactionColumns = [
  {
    name: 'date',
    label: 'Date',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: (row: any) => formatDate(row.date),
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
    sortable: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right' as const,
    sortable: true,
  },
];

const netIncome = computed(() => {
  return incomeStore.totalIncome - expensesStore.totalExpenses;
});

const monthlyNet = computed(() => {
  return incomeStore.monthlyTotal - expensesStore.monthlyTotal;
});

const netIncomeClass = computed(() => {
  return netIncome.value >= 0 ? 'positive' : 'negative';
});

const monthlyNetClass = computed(() => {
  return monthlyNet.value >= 0 ? 'positive' : 'negative';
});

const netIncomeFormatted = computed(() => {
  const value = netIncome.value;
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}₹${formatAmount(Math.abs(value))}`;
});

const monthlyNetFormatted = computed(() => {
  const value = monthlyNet.value;
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}₹${formatAmount(Math.abs(value))}`;
});

const recentTransactions = computed(() => {
  const expenses = expensesStore.recentExpenses.map((expense) => ({
    ...expense,
    type: 'expense' as const,
  }));

  const income = incomeStore.recentIncome.map((incomeItem) => ({
    ...incomeItem,
    type: 'income' as const,
  }));

  return [...expenses, ...income]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
});

const topExpenseCategories = computed(() => {
  const categoryTotals = new Map();

  expensesStore.expenses.forEach((expense) => {
    if (expense.category_id) {
      const current = categoryTotals.get(expense.category_id) || 0;
      categoryTotals.set(expense.category_id, current + expense.amount);
    }
  });

  const total = expensesStore.totalExpenses;

  return Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => {
      const category = categoriesStore.categories.find((c) => c.id === categoryId);
      return {
        ...category,
        total: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});

const topIncomeCategories = computed(() => {
  const categoryTotals = new Map();

  incomeStore.income.forEach((incomeItem) => {
    if (incomeItem.category_id) {
      const current = categoryTotals.get(incomeItem.category_id) || 0;
      categoryTotals.set(incomeItem.category_id, current + incomeItem.amount);
    }
  });

  const total = incomeStore.totalIncome;

  return Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => {
      const category = categoriesStore.categories.find((c) => c.id === categoryId);
      return {
        ...category,
        total: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});

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
  await Promise.all([
    expensesStore.fetchExpenses(),
    incomeStore.fetchIncome(),
    categoriesStore.fetchCategories(),
  ]);
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .page-subtitle {
    color: #6b7280;
    font-size: 1.1rem;
    margin: 0;
  }
}

.dashboard-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
}

.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-column: 1 / -1;
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    &.total-income {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    &.total-expenses {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    &.net-income {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    &.monthly-summary {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;

      &.positive {
        color: #059669;
      }

      &.negative {
        color: #dc2626;
      }
    }

    .stat-label {
      color: #6b7280;
      margin: 0;
    }
  }
}

.recent-transactions {
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .no-data {
    text-align: center;
    padding: 2rem;
    color: #9ca3af;
  }

  .transaction-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    background: #f9fafb;
    transition: background-color 0.2s;

    &:hover {
      background: #f3f4f6;
    }
  }

  .transaction-info {
    flex: 1;

    .transaction-title {
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }

    .transaction-category {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0 0 0.25rem 0;
    }

    .transaction-date {
      color: #9ca3af;
      font-size: 0.75rem;
      margin: 0;
    }
  }

  .transaction-amount {
    .amount {
      font-weight: 600;

      &.positive {
        color: #059669;
      }

      &.negative {
        color: #dc2626;
      }
    }
  }
}

.top-categories {
  .q-tab-panel {
    padding: 0;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .category-tabs {
    margin-bottom: 1rem;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .category-info {
    flex: 1;

    .category-name {
      font-weight: 500;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
    }

    .category-progress {
      width: 100%;
    }
  }

  .category-amount {
    text-align: right;

    .amount {
      display: block;
      font-weight: 600;
      font-size: 0.875rem;

      &.positive {
        color: #059669;
      }

      &.negative {
        color: #dc2626;
      }
    }

    .percentage {
      display: block;
      color: #6b7280;
      font-size: 0.75rem;
    }
  }
}

.transactions-table {
  .q-td .amount.positive {
    color: #059669;
    font-weight: 600;
  }

  .q-td .amount.negative {
    color: #dc2626;
    font-weight: 600;
  }

  .q-table__bottom {
    display: none; // Hide pagination if not needed
  }
}
</style>
