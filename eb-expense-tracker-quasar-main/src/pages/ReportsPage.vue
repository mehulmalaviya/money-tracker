<template>
  <q-page class="reports-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ $t('reports.title') }}</h1>
        <p class="page-subtitle">Comprehensive Financial Analysis</p>
      </div>

      <!-- Enhanced Report Filters -->
      <UiCard class="report-filters">
        <template #header>
          <div class="filter-header">
            <h2 class="section-title">{{ $t('reports.generateReport') }}</h2>
            <div class="quick-ranges">
              <q-btn
                v-for="range in quickRanges"
                :key="range.key"
                :label="range.label"
                size="sm"
                outline
                color="primary"
                @click="setQuickRange(range)"
                class="range-btn"
              />
            </div>
          </div>
        </template>

        <q-form @submit="generateReport" class="filter-form">
          <div class="filters-grid">
            <q-input
              v-model="reportForm.fromDate"
              :label="$t('reports.fromDate')"
              type="date"
              outlined
              dense
              :rules="[(val) => !!val || $t('validation.required')]"
            />

            <q-input
              v-model="reportForm.toDate"
              :label="$t('reports.toDate')"
              type="date"
              outlined
              dense
              :rules="[(val) => !!val || $t('validation.required')]"
            />

            <q-select
              v-model="reportForm.comparison"
              :options="comparisonOptions"
              label="Compare With"
              outlined
              dense
              clearable
              option-value="value"
              option-label="label"
              emit-value
              map-options
            />

            <q-btn
              type="submit"
              :label="$t('reports.generateReport')"
              color="primary"
              :loading="generating"
              class="generate-btn"
            />
          </div>
        </q-form>
      </UiCard>

      <!-- Report Results -->
      <div v-if="reportData" class="report-results">
        <!-- Key Financial Metrics -->

        <div class="metrics-grid">
          <UiCard class="metric-card savings-rate">
            <div class="metric-content">
              <div class="metric-icon">
                <q-icon name="savings" size="2.5rem" />
              </div>
              <div class="metric-info">
                <h3 class="metric-value" :class="savingsRateClass">{{ savingsRate }}%</h3>
                <p class="metric-label">Savings Rate</p>
                <p class="metric-subtitle">{{ savingsRateDescription }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="metric-card daily-average">
            <div class="metric-content">
              <div class="metric-icon">
                <q-icon name="today" size="2.5rem" />
              </div>
              <div class="metric-info">
                <h3 class="metric-value">₹{{ formatAmount(dailyAverage) }}</h3>
                <p class="metric-label">Daily Average</p>
                <p class="metric-subtitle">{{ dailyType }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="metric-card largest-expense">
            <div class="metric-content">
              <div class="metric-icon">
                <q-icon name="trending_down" size="2.5rem" />
              </div>
              <div class="metric-info">
                <h3 class="metric-value negative">₹{{ formatAmount(largestExpense.amount) }}</h3>
                <p class="metric-label">Largest Expense</p>
                <p class="metric-subtitle">{{ largestExpense.title }}</p>
              </div>
            </div>
          </UiCard>

          <UiCard class="metric-card largest-income">
            <div class="metric-content">
              <div class="metric-icon">
                <q-icon name="trending_up" size="2.5rem" />
              </div>
              <div class="metric-info">
                <h3 class="metric-value positive">₹{{ formatAmount(largestIncome.amount) }}</h3>
                <p class="metric-label">Largest Income</p>
                <p class="metric-subtitle">{{ largestIncome.title }}</p>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Financial Summary Cards -->
        <div class="summary-grid">
          <UiCard class="summary-card income-card">
            <div class="summary-content">
              <div class="summary-icon total-income">
                <q-icon name="trending_up" size="2rem" />
              </div>
              <div class="summary-info">
                <h3 class="summary-value positive">+₹{{ formatAmount(reportData.totalIncome) }}</h3>
                <p class="summary-label">{{ $t('reports.totalIncome') }}</p>
                <div class="summary-details">
                  <span class="detail-item">{{ reportData.incomeCount }} entries</span>
                  <span class="detail-item">₹{{ formatAmount(reportData.avgIncome) }} avg</span>
                </div>
                <div v-if="comparisonData" class="comparison">
                  <span :class="incomeComparisonClass">
                    <q-icon :name="incomeComparisonIcon" size="sm" />
                    {{ incomeComparisonText }}
                  </span>
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard class="summary-card expense-card">
            <div class="summary-content">
              <div class="summary-icon total-expenses">
                <q-icon name="trending_down" size="2rem" />
              </div>
              <div class="summary-info">
                <h3 class="summary-value negative">
                  -₹{{ formatAmount(reportData.totalExpenses) }}
                </h3>
                <p class="summary-label">{{ $t('reports.totalExpenses') }}</p>
                <div class="summary-details">
                  <span class="detail-item">{{ reportData.expenseCount }} entries</span>
                  <span class="detail-item">₹{{ formatAmount(reportData.avgExpense) }} avg</span>
                </div>
                <div v-if="comparisonData" class="comparison">
                  <span :class="expenseComparisonClass">
                    <q-icon :name="expenseComparisonIcon" size="sm" />
                    {{ expenseComparisonText }}
                  </span>
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard class="summary-card net-card">
            <div class="summary-content">
              <div class="summary-icon net-income">
                <q-icon name="account_balance_wallet" size="2rem" />
              </div>
              <div class="summary-info">
                <h3 class="summary-value" :class="netIncomeClass">
                  {{ netIncomeFormatted }}
                </h3>
                <p class="summary-label">{{ $t('reports.netIncome') }}</p>
                <div class="summary-details">
                  <span class="detail-item">{{ reportData.totalTransactions }} total</span>
                  <span class="detail-item">{{ reportData.dayCount }} days</span>
                </div>
                <div v-if="comparisonData" class="comparison">
                  <span :class="netComparisonClass">
                    <q-icon :name="netComparisonIcon" size="sm" />
                    {{ netComparisonText }}
                  </span>
                </div>
              </div>
            </div>
          </UiCard>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Income vs Expenses Chart -->
          <UiCard class="chart-card">
            <template #header>
              <h2 class="section-title">Income vs Expenses Trend</h2>
            </template>
            <div class="chart-container">
              <canvas ref="trendChart" class="trend-chart"></canvas>
            </div>
          </UiCard>

          <!-- Category Distribution -->
          <UiCard class="chart-card">
            <template #header>
              <div class="chart-header">
                <h2 class="section-title">Category Distribution</h2>
                <q-tabs v-model="chartTab" dense>
                  <q-tab name="expenses" label="Expenses" />
                  <q-tab name="income" label="Income" />
                </q-tabs>
              </div>
            </template>
            <div class="chart-container">
              <canvas ref="distributionChart" class="distribution-chart"></canvas>
            </div>
          </UiCard>
        </div>

        <!-- Enhanced Category Breakdown -->
        <UiCard class="category-breakdown">
          <template #header>
            <div class="breakdown-header">
              <h2 class="section-title">{{ $t('reports.categoryBreakdown') }}</h2>
              <div class="breakdown-actions">
                <q-btn
                  label="Export Excel"
                  color="positive"
                  icon="table_chart"
                  @click="exportToExcel"
                  :loading="exporting"
                  outline
                  size="sm"
                />
                <q-btn
                  :label="$t('reports.exportPDF')"
                  color="secondary"
                  icon="picture_as_pdf"
                  @click="exportToPDF"
                  :loading="exporting"
                  outline
                  size="sm"
                />
              </div>
            </div>
          </template>

          <q-tabs v-model="activeTab" dense class="breakdown-tabs">
            <q-tab name="expenses" label="Expense Categories" />
            <q-tab name="income" label="Income Categories" />
            <q-tab name="comparison" label="Category Comparison" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="expenses">
              <div v-if="reportData.expenseBreakdown.length === 0" class="no-data">
                <q-icon name="trending_down" size="3rem" color="grey-4" />
                <p>No expenses found for the selected date range</p>
              </div>

              <div v-else class="breakdown-list">
                <div
                  v-for="(category, index) in reportData.expenseBreakdown"
                  :key="category.id || 'uncategorized'"
                  class="breakdown-item expense-item"
                >
                  <div class="item-rank">#{{ index + 1 }}</div>
                  <div class="category-warper">
                    <div class="category-amount">
                      <span class="amount negative">-₹{{ formatAmount(category.total) }}</span>
                      <span class="percentage">{{ category.percentage.toFixed(1) }}%</span>
                    </div>

                    <div class="category-info">
                      <q-avatar :color="category.color || '#ef4444'" text-color="white" size="40px">
                        <q-icon color="black" :name="category.icon || 'category'" size="20px" />
                      </q-avatar>
                      <div class="category-details">
                        <h4 class="category-name">{{ category.name || 'Uncategorized' }}</h4>
                        <p class="expense-count">
                          {{ category.count }} expenses • ₹{{ formatAmount(category.average) }} avg
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="category-progress">
                    <q-linear-progress
                      :value="category.percentage / 100"
                      color="negative"
                      size="6px"
                      rounded
                    />
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="income">
              <div v-if="reportData.incomeBreakdown.length === 0" class="no-data">
                <q-icon name="trending_up" size="3rem" color="grey-4" />
                <p>No income found for the selected date range</p>
              </div>

              <div v-else class="breakdown-list">
                <div
                  v-for="(category, index) in reportData.incomeBreakdown"
                  :key="category.id || 'uncategorized'"
                  class="breakdown-item income-item"
                >
                  <div class="item-rank">#{{ index + 1 }}</div>
                  <div class="category-warper">
                    <div class="category-amount">
                      <span class="amount positive">+₹{{ formatAmount(category.total) }}</span>
                      <span class="percentage">{{ category.percentage.toFixed(1) }}%</span>
                    </div>
                    <div class="category-info">
                      <q-avatar :color="category.color || '#10b981'" text-color="white" size="40px">
                        <q-icon :name="category.icon || 'category'" size="20px" />
                      </q-avatar>
                      <div class="category-details">
                        <h4 class="category-name">{{ category.name || 'Uncategorized' }}</h4>
                        <p class="expense-count">
                          {{ category.count }} entries • ₹{{ formatAmount(category.average) }} avg
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="category-progress">
                    <q-linear-progress
                      :value="category.percentage / 100"
                      color="positive"
                      size="6px"
                      rounded
                    />
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="comparison">
              <div class="comparison-view">
                <div class="comparison-stats">
                  <div class="stat-box">
                    <h4>Most Expensive Category</h4>
                    <p>{{ mostExpensiveCategory.name }}</p>
                    <span class="negative">-₹{{ formatAmount(mostExpensiveCategory.total) }}</span>
                  </div>
                  <div class="stat-box">
                    <h4>Highest Income Category</h4>
                    <p>{{ highestIncomeCategory.name }}</p>
                    <span class="positive">+₹{{ formatAmount(highestIncomeCategory.total) }}</span>
                  </div>
                  <div class="stat-box">
                    <h4>Most Frequent</h4>
                    <p>{{ mostFrequentCategory.name }}</p>
                    <span>{{ mostFrequentCategory.count }} transactions</span>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </UiCard>

        <!-- Detailed Transactions with Better Filtering -->
        <UiCard class="detailed-transactions">
          <template #header>
            <div class="transactions-header">
              <h2 class="section-title">Transaction Details</h2>
              <div class="transaction-filters">
                <q-select
                  v-model="transactionFilter"
                  :options="transactionFilterOptions"
                  label="Filter"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  dense
                  style="min-width: 120px"
                />
                <q-input
                  v-model="transactionSearch"
                  placeholder="Search transactions..."
                  outlined
                  dense
                  clearable
                  style="min-width: 200px"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>
          </template>

          <q-table
            flat
            :rows="filteredTransactions"
            :columns="transactionColumns"
            row-key="id"
            :pagination="transactionPagination"
            class="transactions-table"
            :loading="generating"
          >
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.type === 'income' ? 'positive' : 'negative'"
                  text-color="white"
                  :label="props.row.type"
                  size="sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-category="props">
              <q-td :props="props">
                <div class="category-cell">
                  <q-avatar
                    :color="
                      props.row.category?.color ||
                      (props.row.type === 'income' ? '#10b981' : '#ef4444')
                    "
                    text-color="white"
                    size="24px"
                  >
                    <q-icon :name="props.row.category?.icon || 'category'" size="14px" />
                  </q-avatar>
                  <span>{{ props.row.category?.name || 'Uncategorized' }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-amount="props">
              <q-td :props="props">
                <span
                  :class="`amount-cell ${props.row.type === 'income' ? 'positive' : 'negative'}`"
                >
                  {{ props.row.type === 'income' ? '+' : '-' }}₹{{ formatAmount(props.row.amount) }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-date="props">
              <q-td :props="props">
                {{ formatDate(props.row.date) }}
              </q-td>
            </template>
          </q-table>
        </UiCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import Chart from 'chart.js/auto';
import { differenceInDays, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import UiCard from 'src/components/ui/UiCard.vue';
import { useCategoriesStore } from 'src/stores/categories';
import { useExpensesStore } from 'src/stores/expenses';
import { useIncomeStore } from 'src/stores/income';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';

const expensesStore = useExpensesStore();
const incomeStore = useIncomeStore();
const categoriesStore = useCategoriesStore();

const generating = ref(false);
const exporting = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reportData = ref<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const comparisonData = ref<any>(null);
const activeTab = ref('expenses');
const chartTab = ref('expenses');
const transactionFilter = ref('all');
const transactionSearch = ref('');

// Chart refs
const trendChart = ref<HTMLCanvasElement>();
const distributionChart = ref<HTMLCanvasElement>();
let trendChartInstance: Chart | null = null;
let distributionChartInstance: Chart | null = null;

const reportForm = reactive({
  fromDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  toDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  comparison: '',
});

const quickRanges = [
  { key: 'thisMonth', label: 'This Month', days: 0 },
  { key: 'lastMonth', label: 'Last Month', days: -1 },
  { key: 'last3Months', label: 'Last 3 Months', days: -3 },
  { key: 'last6Months', label: 'Last 6 Months', days: -6 },
  { key: 'thisYear', label: 'This Year', days: -12 },
];

const comparisonOptions = [
  { label: 'Previous Period', value: 'previous' },
  { label: 'Same Period Last Year', value: 'lastYear' },
  { label: 'Last Month', value: 'lastMonth' },
];

const transactionFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Income Only', value: 'income' },
  { label: 'Expenses Only', value: 'expense' },
];

const transactionPagination = ref({
  rowsPerPage: 20,
  sortBy: 'date',
  descending: true,
});

const transactionColumns = [
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'left' as const,
    sortable: true,
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
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'center' as const,
    sortable: true,
  },
];

// Computed properties
const netIncomeClass = computed(() => {
  if (!reportData.value) return '';
  const netIncome = reportData.value.totalIncome - reportData.value.totalExpenses;
  return netIncome >= 0 ? 'positive' : 'negative';
});

const netIncomeFormatted = computed(() => {
  if (!reportData.value) return '₹0';
  const netIncome = reportData.value.totalIncome - reportData.value.totalExpenses;
  const prefix = netIncome >= 0 ? '+' : '';
  return `${prefix}₹${formatAmount(Math.abs(netIncome))}`;
});

const savingsRate = computed(() => {
  if (!reportData.value || reportData.value.totalIncome === 0) return 0;
  const netIncome = reportData.value.totalIncome - reportData.value.totalExpenses;
  return Math.round((netIncome / reportData.value.totalIncome) * 100);
});

const savingsRateClass = computed(() => {
  const rate = savingsRate.value;
  if (rate >= 20) return 'positive';
  if (rate >= 10) return 'warning';
  return 'negative';
});

const savingsRateDescription = computed(() => {
  const rate = savingsRate.value;
  if (rate >= 30) return 'Excellent!';
  if (rate >= 20) return 'Great savings';
  if (rate >= 10) return 'Good progress';
  if (rate >= 0) return 'Consider saving more';
  return 'Spending exceeds income';
});

const dailyAverage = computed(() => {
  if (!reportData.value || reportData.value.dayCount === 0) return 0;
  const netIncome = reportData.value.totalIncome - reportData.value.totalExpenses;
  return Math.abs(netIncome) / reportData.value.dayCount;
});

const dailyType = computed(() => {
  if (!reportData.value) return '';
  const netIncome = reportData.value.totalIncome - reportData.value.totalExpenses;
  return netIncome >= 0 ? 'net income' : 'net spending';
});

const largestExpense = computed(() => {
  if (!reportData.value || !reportData.value.allTransactions) return { amount: 0, title: 'None' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expenses = reportData.value.allTransactions.filter((t: any) => t.type === 'expense');
  if (expenses.length === 0) return { amount: 0, title: 'None' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return expenses.reduce((max: any, expense: any) => (expense.amount > max.amount ? expense : max));
});

const largestIncome = computed(() => {
  if (!reportData.value || !reportData.value.allTransactions) return { amount: 0, title: 'None' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const income = reportData.value.allTransactions.filter((t: any) => t.type === 'income');
  if (income.length === 0) return { amount: 0, title: 'None' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return income.reduce((max: any, incomeItem: any) =>
    incomeItem.amount > max.amount ? incomeItem : max,
  );
});

const mostExpensiveCategory = computed(() => {
  if (!reportData.value?.expenseBreakdown?.length) return { name: 'None', total: 0 };
  return reportData.value.expenseBreakdown[0];
});

const highestIncomeCategory = computed(() => {
  if (!reportData.value?.incomeBreakdown?.length) return { name: 'None', total: 0 };
  return reportData.value.incomeBreakdown[0];
});

const mostFrequentCategory = computed(() => {
  if (!reportData.value) return { name: 'None', count: 0 };

  const allCategories = [
    ...(reportData.value.expenseBreakdown || []),
    ...(reportData.value.incomeBreakdown || []),
  ];

  if (allCategories.length === 0) return { name: 'None', count: 0 };

  return allCategories.reduce((max, category) => (category.count > max.count ? category : max));
});

const filteredTransactions = computed(() => {
  if (!reportData.value?.allTransactions) return [];

  let filtered = reportData.value.allTransactions;

  if (transactionFilter.value !== 'all') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filtered = filtered.filter((t: any) => t.type === transactionFilter.value);
  }

  if (transactionSearch.value) {
    const search = transactionSearch.value.toLowerCase();
    filtered = filtered.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) =>
        t.title.toLowerCase().includes(search) ||
        t.category?.name?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search),
    );
  }

  return filtered;
});

// Comparison computed properties
const incomeComparisonClass = computed(() => {
  if (!comparisonData.value) return '';
  const change = reportData.value.totalIncome - comparisonData.value.totalIncome;
  return change >= 0 ? 'positive' : 'negative';
});

const incomeComparisonIcon = computed(() => {
  if (!comparisonData.value) return '';
  const change = reportData.value.totalIncome - comparisonData.value.totalIncome;
  return change >= 0 ? 'trending_up' : 'trending_down';
});

const incomeComparisonText = computed(() => {
  if (!comparisonData.value) return '';
  const change = reportData.value.totalIncome - comparisonData.value.totalIncome;
  const percentage =
    comparisonData.value.totalIncome > 0
      ? Math.abs((change / comparisonData.value.totalIncome) * 100)
      : 0;
  return `${Math.abs(percentage).toFixed(1)}% vs previous`;
});

const expenseComparisonClass = computed(() => {
  if (!comparisonData.value) return '';
  const change = reportData.value.totalExpenses - comparisonData.value.totalExpenses;
  return change <= 0 ? 'positive' : 'negative'; // Less expenses is good
});

const expenseComparisonIcon = computed(() => {
  if (!comparisonData.value) return '';
  const change = reportData.value.totalExpenses - comparisonData.value.totalExpenses;
  return change <= 0 ? 'trending_down' : 'trending_up';
});

const expenseComparisonText = computed(() => {
  if (!comparisonData.value) return '';
  const change = reportData.value.totalExpenses - comparisonData.value.totalExpenses;
  const percentage =
    comparisonData.value.totalExpenses > 0
      ? Math.abs((change / comparisonData.value.totalExpenses) * 100)
      : 0;
  return `${Math.abs(percentage).toFixed(1)}% vs previous`;
});

const netComparisonClass = computed(() => {
  if (!comparisonData.value) return '';
  const currentNet = reportData.value.totalIncome - reportData.value.totalExpenses;
  const previousNet = comparisonData.value.totalIncome - comparisonData.value.totalExpenses;
  return currentNet >= previousNet ? 'positive' : 'negative';
});

const netComparisonIcon = computed(() => {
  if (!comparisonData.value) return '';
  const currentNet = reportData.value.totalIncome - reportData.value.totalExpenses;
  const previousNet = comparisonData.value.totalIncome - comparisonData.value.totalExpenses;
  return currentNet >= previousNet ? 'trending_up' : 'trending_down';
});

const netComparisonText = computed(() => {
  if (!comparisonData.value) return '';
  const currentNet = reportData.value.totalIncome - reportData.value.totalExpenses;
  const previousNet = comparisonData.value.totalIncome - comparisonData.value.totalExpenses;
  const change = currentNet - previousNet;
  return `₹${formatAmount(Math.abs(change))} vs previous`;
});

// Methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setQuickRange(range: any) {
  const now = new Date();

  switch (range.key) {
    case 'thisMonth':
      reportForm.fromDate = format(startOfMonth(now), 'yyyy-MM-dd');
      reportForm.toDate = format(endOfMonth(now), 'yyyy-MM-dd');
      break;
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      reportForm.fromDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      reportForm.toDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
      break;
    }
    case 'last3Months':
      reportForm.fromDate = format(subMonths(now, 3), 'yyyy-MM-dd');
      reportForm.toDate = format(now, 'yyyy-MM-dd');
      break;
    case 'last6Months':
      reportForm.fromDate = format(subMonths(now, 6), 'yyyy-MM-dd');
      reportForm.toDate = format(now, 'yyyy-MM-dd');
      break;
    case 'thisYear':
      reportForm.fromDate = format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd');
      reportForm.toDate = format(now, 'yyyy-MM-dd');
      break;
  }

  void generateReport();
}

async function generateReport() {
  generating.value = true;

  try {
    const filteredExpenses = expensesStore.expenses.filter(
      (expense) => expense.date >= reportForm.fromDate && expense.date <= reportForm.toDate,
    );

    const filteredIncome = incomeStore.income.filter(
      (income) => income.date >= reportForm.fromDate && income.date <= reportForm.toDate,
    );

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = filteredIncome.reduce((sum, income) => sum + income.amount, 0);
    const expenseCount = filteredExpenses.length;
    const incomeCount = filteredIncome.length;
    const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;

    const fromDate = new Date(reportForm.fromDate);
    const toDate = new Date(reportForm.toDate);
    const dayCount = differenceInDays(toDate, fromDate) + 1;

    // Enhanced category breakdowns with averages
    const expenseCategoryTotals = new Map();
    filteredExpenses.forEach((expense) => {
      const categoryId = expense.category_id || 'uncategorized';
      const current = expenseCategoryTotals.get(categoryId) || { total: 0, count: 0 };
      expenseCategoryTotals.set(categoryId, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    });

    const expenseBreakdown = Array.from(expenseCategoryTotals.entries())
      .map(([categoryId, data]) => {
        const category =
          categoryId === 'uncategorized'
            ? { name: 'Uncategorized', color: '#ef4444', icon: 'category' }
            : categoriesStore.categories.find((c) => c.id === categoryId);

        return {
          ...category,
          total: data.total,
          count: data.count,
          average: data.count > 0 ? data.total / data.count : 0,
          percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    const incomeCategoryTotals = new Map();
    filteredIncome.forEach((income) => {
      const categoryId = income.category_id || 'uncategorized';
      const current = incomeCategoryTotals.get(categoryId) || { total: 0, count: 0 };
      incomeCategoryTotals.set(categoryId, {
        total: current.total + income.amount,
        count: current.count + 1,
      });
    });

    const incomeBreakdown = Array.from(incomeCategoryTotals.entries())
      .map(([categoryId, data]) => {
        const category =
          categoryId === 'uncategorized'
            ? { name: 'Uncategorized', color: '#10b981', icon: 'account_balance_wallet' }
            : categoriesStore.categories.find((c) => c.id === categoryId);

        return {
          ...category,
          total: data.total,
          count: data.count,
          average: data.count > 0 ? data.total / data.count : 0,
          percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    const allTransactions = [
      ...filteredExpenses.map((expense) => ({ ...expense, type: 'expense' })),
      ...filteredIncome.map((income) => ({ ...income, type: 'income' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    reportData.value = {
      totalExpenses,
      totalIncome,
      expenseCount,
      incomeCount,
      avgExpense,
      avgIncome,
      dayCount,
      totalTransactions: expenseCount + incomeCount,
      expenseBreakdown,
      incomeBreakdown,
      allTransactions,
      dateRange: {
        from: reportForm.fromDate,
        to: reportForm.toDate,
      },
    };

    // Generate comparison data if requested
    if (reportForm.comparison) {
      generateComparisonData();
    }

    // Update charts
    await nextTick();
    updateCharts();
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    generating.value = false;
  }
}

function generateComparisonData() {
  if (!reportForm.comparison) return;

  const daysDiff = differenceInDays(new Date(reportForm.toDate), new Date(reportForm.fromDate));
  let comparisonFromDate: string;
  let comparisonToDate: string;

  switch (reportForm.comparison) {
    case 'previous':
      comparisonToDate = format(
        new Date(new Date(reportForm.fromDate).getTime() - 86400000),
        'yyyy-MM-dd',
      );
      comparisonFromDate = format(
        new Date(new Date(comparisonToDate).getTime() - daysDiff * 86400000),
        'yyyy-MM-dd',
      );
      break;
    case 'lastYear': {
      const lastYearFrom = new Date(reportForm.fromDate);
      lastYearFrom.setFullYear(lastYearFrom.getFullYear() - 1);
      const lastYearTo = new Date(reportForm.toDate);
      lastYearTo.setFullYear(lastYearTo.getFullYear() - 1);
      comparisonFromDate = format(lastYearFrom, 'yyyy-MM-dd');
      comparisonToDate = format(lastYearTo, 'yyyy-MM-dd');
      break;
    }
    case 'lastMonth': {
      const lastMonth = subMonths(new Date(), 1);
      comparisonFromDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      comparisonToDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
      break;
    }
    default:
      return;
  }

  const comparisonExpenses = expensesStore.expenses.filter(
    (expense) => expense.date >= comparisonFromDate && expense.date <= comparisonToDate,
  );

  const comparisonIncome = incomeStore.income.filter(
    (income) => income.date >= comparisonFromDate && income.date <= comparisonToDate,
  );

  comparisonData.value = {
    totalExpenses: comparisonExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    totalIncome: comparisonIncome.reduce((sum, income) => sum + income.amount, 0),
    expenseCount: comparisonExpenses.length,
    incomeCount: comparisonIncome.length,
  };
}

function updateCharts() {
  updateTrendChart();
  updateDistributionChart();
}

function updateTrendChart() {
  if (!trendChart.value || !reportData.value) return;

  // Destroy existing chart
  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  // Group transactions by date
  const dailyData = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportData.value.allTransactions.forEach((transaction: any) => {
    const date = transaction.date;
    if (!dailyData.has(date)) {
      dailyData.set(date, { income: 0, expenses: 0 });
    }

    const dayData = dailyData.get(date);
    if (transaction.type === 'income') {
      dayData.income += transaction.amount;
    } else {
      dayData.expenses += transaction.amount;
    }
  });

  const sortedDates = Array.from(dailyData.keys()).sort();
  const incomeData = sortedDates.map((date) => dailyData.get(date).income);
  const expenseData = sortedDates.map((date) => dailyData.get(date).expenses);

  trendChartInstance = new Chart(trendChart.value, {
    type: 'line',
    data: {
      labels: sortedDates.map((date) => format(new Date(date), 'MMM dd')),
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '₹' + value;
            },
          },
        },
      },
    },
  });
}

function updateDistributionChart() {
  if (!distributionChart.value || !reportData.value) return;

  if (distributionChartInstance) {
    distributionChartInstance.destroy();
  }

  const data =
    chartTab.value === 'expenses'
      ? reportData.value.expenseBreakdown
      : reportData.value.incomeBreakdown;

  if (data.length === 0) return;

  distributionChartInstance = new Chart(distributionChart.value, {
    type: 'doughnut',
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      labels: data.map((item: any) => item.name || 'Uncategorized'),
      datasets: [
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data.map((item: any) => item.total),
          backgroundColor: data.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item.color || (chartTab.value === 'expenses' ? '#ef4444' : '#10b981'),
          ),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed;
              const percentage = data[context.dataIndex].percentage.toFixed(1);
              return `${label}: ₹${formatAmount(value)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function exportToPDF() {
  if (!reportData.value) return;

  exporting.value = true;

  try {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Comprehensive Financial Report', 20, yPos);
    yPos += 10;

    // Date Range
    doc.setFontSize(12);
    doc.text(
      `Period: ${formatDate(reportData.value.dateRange.from)} - ${formatDate(reportData.value.dateRange.to)}`,
      20,
      yPos,
    );
    yPos += 10;

    // Summary Table
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        [
          'Total Income',
          `+${formatAmount(reportData.value.totalIncome)} (${reportData.value.incomeCount} entries)`,
        ],
        [
          'Total Expenses',
          `-${formatAmount(reportData.value.totalExpenses)} (${reportData.value.expenseCount} entries)`,
        ],
        [
          'Net Income',
          `${reportData.value.totalIncome - reportData.value.totalExpenses >= 0 ? '+' : '-'}${formatAmount(Math.abs(reportData.value.totalIncome - reportData.value.totalExpenses))}`,
        ],
        ['Savings Rate', `${savingsRate.value}%`],
        ['Daily Average', `${formatAmount(dailyAverage.value)} (${dailyType.value})`],
      ],
    });

    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 10;

    // Income Categories Table
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Amount', 'Percentage', 'Entries']],
      body: reportData.value.incomeBreakdown
        .slice(0, 5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((cat: any) => [
          cat.name,
          `+${formatAmount(cat.total)}`,
          `${cat.percentage.toFixed(1)}%`,
          cat.count,
        ]),
      theme: 'striped',
      headStyles: { fillColor: [0, 128, 0] },
      didDrawPage: () => {
        doc.setFontSize(14).text('Top Income Categories', 20, yPos - 5);
      },
    });

    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 10;

    // Expense Categories Table
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Amount', 'Percentage', 'Entries']],
      body: reportData.value.expenseBreakdown
        .slice(0, 5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((cat: any) => [
          cat.name,
          `-${formatAmount(cat.total)}`,
          `${cat.percentage.toFixed(1)}%`,
          cat.count,
        ]),
      theme: 'striped',
      headStyles: { fillColor: [200, 0, 0] },
      didDrawPage: () => {
        doc.setFontSize(14).text('Top Expense Categories', 20, yPos - 5);
      },
    });

    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 10;

    // Detailed Income Entries (if needed)
    if (reportData.value.incomeList && reportData.value.incomeList.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Title', 'Amount (₹)', 'Date', 'Category']],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: reportData.value.incomeList.map((entry: any) => [
          entry.title,
          `+${formatAmount(entry.amount)}`,
          formatDate(entry.date),
          entry.category,
        ]),
        theme: 'grid',
        didDrawPage: () => {
          doc.setFontSize(14).text('Detailed Income Entries', 20, yPos - 5);
        },
      });

      yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 10;
    }

    // Detailed Expense Entries (if needed)
    if (reportData.value.expenseList && reportData.value.expenseList.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Title', 'Amount (₹)', 'Date', 'Category']],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: reportData.value.expenseList.map((entry: any) => [
          entry.title,
          `-${formatAmount(entry.amount)}`,
          formatDate(entry.date),
          entry.category,
        ]),
        theme: 'grid',
        didDrawPage: () => {
          doc.setFontSize(14).text('Detailed Expense Entries', 20, yPos - 5);
        },
      });

      yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 10;
    }

    // Key Insights
    autoTable(doc, {
      startY: yPos,
      head: [['Insight', 'Detail']],
      body: [
        [
          'Largest Expense',
          `${largestExpense.value.title} (-${formatAmount(largestExpense.value.amount)})`,
        ],
        [
          'Largest Income',
          `${largestIncome.value.title} (+${formatAmount(largestIncome.value.amount)})`,
        ],
        [
          'Most Expensive Category',
          `${mostExpensiveCategory.value.name} (-${formatAmount(mostExpensiveCategory.value.total)})`,
        ],
        [
          'Highest Income Category',
          `${highestIncomeCategory.value.name} (+${formatAmount(highestIncomeCategory.value.total)})`,
        ],
      ],
      theme: 'striped',
      didDrawPage: () => {
        doc.setFontSize(14).text('Key Insights', 20, yPos - 5);
      },
    });

    // Save PDF
    doc.save(
      `financial-report-${reportData.value.dateRange.from}-to-${reportData.value.dateRange.to}.pdf`,
    );
  } catch (error) {
    console.error('Error exporting PDF:', error);
  } finally {
    exporting.value = false;
  }
}

function exportToExcel() {
  if (!reportData.value) return;

  exporting.value = true;

  try {
    // Create CSV content
    let csvContent = 'Financial Report\n';
    csvContent += `Period: ${formatDate(reportData.value.dateRange.from)} - ${formatDate(reportData.value.dateRange.to)}\n\n`;

    csvContent += 'Summary\n';
    csvContent += `Total Income,${reportData.value.totalIncome}\n`;
    csvContent += `Total Expenses,${reportData.value.totalExpenses}\n`;
    csvContent += `Net Income,${reportData.value.totalIncome - reportData.value.totalExpenses}\n`;
    csvContent += `Savings Rate,${savingsRate.value}%\n\n`;

    csvContent += 'All Transactions\n';
    csvContent += 'Date,Type,Title,Category,Amount,Description\n';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reportData.value.allTransactions.forEach((transaction: any) => {
      csvContent += `${transaction.date},${transaction.type},${transaction.title},"${transaction.category?.name || 'Uncategorized'}",${transaction.amount},"${transaction.description || ''}"\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${reportData.value.dateRange.from}-to-${reportData.value.dateRange.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting Excel:', error);
  } finally {
    exporting.value = false;
  }
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

// Watch for chart tab changes
watch(chartTab, () => {
  updateDistributionChart();
});

onMounted(async () => {
  await Promise.all([
    expensesStore.fetchExpenses(),
    incomeStore.fetchIncome(),
    categoriesStore.fetchCategories(),
  ]);

  void generateReport();
});
</script>

<style lang="scss" scoped>
.reports-page {
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

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
}

.report-filters {
  margin-bottom: 2rem;

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .filter-form {
    .filters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .generate-btn {
        border-radius: 6px;
        text-transform: none;
        font-weight: 600;
        height: 40px;
      }
    }
  }
}

.summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 2rem;
}

.summary-card {
  &.income-card {
    border-left: 4px solid #10b981;
  }

  &.expense-card {
    border-left: 4px solid #ef4444;
  }

  &.net-card {
    border-left: 4px solid #3b82f6;
  }

  .summary-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .summary-icon {
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
  }

  .summary-info {
    flex: 1;

    .summary-value {
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

    .summary-label {
      color: #6b7280;
      margin: 0 0 0.25rem 0;
      font-weight: 500;
    }

    .summary-count {
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0;
    }
  }
}

.financial-overview {
  margin-bottom: 2rem;

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .overview-chart {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .chart-item {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      .chart-title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;

        &.positive {
          color: #059669;
        }

        &.negative {
          color: #dc2626;
        }
      }

      .chart-amount {
        font-weight: 700;

        &.positive {
          color: #059669;
        }

        &.negative {
          color: #dc2626;
        }
      }
    }

    .chart-bar {
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;

      .chart-fill {
        height: 100%;
        transition: width 0.3s ease;

        &.positive {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        &.negative {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }
      }
    }
  }
}

.category-breakdown {
  margin-bottom: 2rem;

  .breakdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .breakdown-actions {
      display: flex;
      gap: 16px;
    }
    @media (max-width: 555px) {
      align-items: start;
      flex-direction: column;
    }
  }

  .breakdown-tabs {
    margin-bottom: 1rem;
  }

  .no-data {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .breakdown-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    // align-items: center;
    padding: 1rem;
    border-radius: 8px;
    background: #f9fafb;

    &.income-item {
      border-left: 4px solid #10b981;
    }

    &.expense-item {
      border-left: 4px solid #ef4444;
    }

    .category-warper {
      display: flex;
      align-items: center;
      gap: 20px;
      .category-info {
        display: flex;
        align-items: start;
        gap: 0.75rem;

        .category-details {
          .category-name {
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.25rem 0;
          }

          .expense-count {
            color: #6b7280;
            font-size: 0.875rem;
            margin: 0;
          }
        }
      }

      .category-amount {
        text-align: right;

        .amount {
          display: block;
          font-weight: 700;
          color: #1f2937;
          font-size: 1.1rem;

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
          font-size: 0.875rem;
        }
        // @media (max-width: 555px) {
        //   display: none;
        // }
      }
    }

    .category-progress {
      grid-column: 1 / -1;
      margin-top: 0.5rem;
    }
  }
}

.detailed-transactions {
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .transactions-table {
    .category-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .amount-cell {
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
</style>
