<template>
  <q-page class="settings-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ $t('settings.title') }}</h1>
      </div>

      <div class="settings-grid">
        <!-- User Profile -->
        <UiCard class="settings-card profile-card">
          <template #header>
            <h2 class="card-title">User Profile</h2>
          </template>

          <div class="profile-content">
            <div class="profile-avatar">
              <q-avatar size="80px" color="primary" text-color="white">
                <q-icon name="person" size="40px" />
              </q-avatar>
            </div>

            <div class="profile-info">
              <h3 class="user-email">{{ authStore.user?.email }}</h3>
              <p class="user-id">ID: {{ authStore.user?.id?.slice(0, 8) }}...</p>
              <p class="member-since">Member since: {{ formatDate(authStore.user?.created_at) }}</p>
            </div>
          </div>

          <!-- <div class="profile-actions">
            <q-btn
              :label="$t('auth.logout')"
              color="negative"
              outline
              @click="handleLogout"
              class="logout-btn"
            />
          </div> -->
        </UiCard>

        <!-- Language Settings -->
        <UiCard class="settings-card">
          <template #header>
            <h2 class="card-title">{{ $t('settings.language') }}</h2>
          </template>

          <div class="setting-item">
            <q-select
              v-model="selectedLanguage"
              :options="languageOptions"
              :label="$t('settings.language')"
              outlined
              dense
              option-value="value"
              option-label="label"
              emit-value
              map-options
              @update:model-value="updateLanguage"
            />
          </div>
        </UiCard>

        <!-- Theme Settings -->
        <!-- <UiCard class="settings-card">
          <template #header>
            <h2 class="card-title">{{ $t('settings.theme') }}</h2>
          </template>

          <div class="setting-item">
            <q-select
              v-model="selectedTheme"
              :options="themeOptions"
              :label="$t('settings.theme')"
              outlined
              dense
              option-value="value"
              option-label="label"
              emit-value
              map-options
            />
          </div>
        </UiCard> -->

        <!-- Currency Settings -->
        <!-- <UiCard class="settings-card">
          <template #header>
            <h2 class="card-title">{{ $t('settings.currency') }}</h2>
          </template>

          <div class="setting-item">
            <q-select
              v-model="selectedCurrency"
              :options="currencyOptions"
              :label="$t('settings.currency')"
              outlined
              dense
              option-value="value"
              option-label="label"
              emit-value
              map-options
            />
          </div>
        </UiCard> -->

        <!-- App Information -->
        <UiCard class="settings-card">
          <template #header>
            <h2 class="card-title">App Information</h2>
          </template>

          <div class="app-info">
            <div class="info-item">
              <span class="info-label">Version:</span>
              <span class="info-value">1.0.0</span>
            </div>

            <div class="info-item">
              <span class="info-label">Platform:</span>
              <span class="info-value">{{ platformInfo }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Build:</span>
              <span class="info-value">{{ buildInfo }}</span>
            </div>
          </div>
        </UiCard>

        <!-- Data Management -->
        <UiCard class="settings-card">
          <template #header>
            <h2 class="card-title">Data Management</h2>
          </template>

          <div class="data-actions">
            <q-btn
              label="Export Data"
              color="secondary"
              outline
              icon="download"
              @click="exportData"
              class="data-btn"
            />

            <!-- <q-btn
              disable
              label="Clear Cache"
              color="warning"
              outline
              icon="cached"
              @click="clearCache"
              class="data-btn"
            /> -->
          </div>

          <div class="data-stats">
            <div class="stat-item">
              <span class="stat-label">Total Expenses:</span>
              <span class="stat-value">{{ expensesStore.expenses.length }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Total Income:</span>
              <span class="stat-value">{{ incomeStore.income.length }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Categories:</span>
              <span class="stat-value">{{ categoriesStore.categories.length }}</span>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Save Button -->
      <div class="save-section">
        <q-btn
          :label="$t('common.save')"
          color="primary"
          size="md"
          @click="saveSettings"
          :loading="saving"
          class="save-btn"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import { Notify, Platform } from 'quasar';
import UiCard from 'src/components/ui/UiCard.vue';
import { useAuthStore } from 'src/stores/auth';
import { useCategoriesStore } from 'src/stores/categories';
import { useExpensesStore } from 'src/stores/expenses';
import { useIncomeStore } from 'src/stores/income';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
// import { useRouter } from 'vue-router';

// const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();
const expensesStore = useExpensesStore();
const incomeStore = useIncomeStore();
const categoriesStore = useCategoriesStore();

const saving = ref(false);
const selectedLanguage = ref(locale.value);
// const selectedTheme = ref('light');
// const selectedCurrency = ref('INR');

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'ગુજરાતી', value: 'gu' },
];

// const themeOptions = [
//   { label: 'Light', value: 'light' },
//   { label: 'Dark', value: 'dark' },
//   { label: 'Auto', value: 'auto' },
// ];

// const currencyOptions = [
//   { label: 'Indian Rupee (₹)', value: 'INR' },
//   { label: 'US Dollar ($)', value: 'USD' },
//   { label: 'Euro (€)', value: 'EUR' },
//   { label: 'British Pound (£)', value: 'GBP' },
// ];

const platformInfo = computed(() => {
  if (Platform.is.mobile) return 'Mobile';
  if (Platform.is.desktop) return 'Desktop';
  if (Platform.is.electron) return 'Electron';
  return 'Web';
});

const buildInfo = computed(() => {
  if (process.env.NODE_ENV === 'development') return 'Development';
  return 'Production';
});

function updateLanguage(newLanguage: string) {
  locale.value = newLanguage;
  selectedLanguage.value = newLanguage;
}

async function saveSettings() {
  saving.value = true;

  try {
    // Here you would save settings to Supabase user_preferences table
    // For now, we'll just show a success message

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

    Notify.create({
      type: 'positive',
      message: 'Settings saved successfully',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Failed to save settings',
    });
    console.log(error);
  } finally {
    saving.value = false;
  }
}

// async function handleLogout() {
//   await authStore.logout();
//   void router.push('/login');
// }

function exportData() {
  try {
    const data = {
      expenses: expensesStore.expenses,
      categories: categoriesStore.categories,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    Notify.create({
      type: 'positive',
      message: 'Data exported successfully',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Failed to export data',
    });
    console.log(error);
  }
}

// function clearCache() {
//   try {
//     localStorage.clear();
//     sessionStorage.clear();

//     Notify.create({
//       type: 'positive',
//       message: 'Cache cleared successfully',
//     });
//   } catch (error) {
//     Notify.create({
//       type: 'negative',
//       message: 'Failed to clear cache',
//     });
//     console.log(error);
//   }
// }

function formatDate(dateString?: string): string {
  if (!dateString) return 'Unknown';
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
.settings-page {
  background: #f8fafc;
  min-height: 100vh;
}

.page-container {
  padding: 2rem;
  max-width: 1000px;
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

.settings-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 2rem;
}

.settings-card {
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .setting-item {
    margin-top: 1rem;
  }

  &.profile-card {
    grid-column: 1 / -1;

    .profile-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;

      @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
      }

      .profile-info {
        flex: 1;

        .user-email {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .user-id {
          color: #6b7280;
          margin: 0 0 0.25rem 0;
          font-family: monospace;
        }

        .member-since {
          color: #9ca3af;
          margin: 0;
          font-size: 0.875rem;
        }
      }
    }

    .profile-actions {
      .logout-btn {
        border-radius: 6px;
        text-transform: none;
        font-weight: 600;
      }
    }
  }
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      color: #6b7280;
      font-weight: 500;
    }

    .info-value {
      color: #1f2937;
      font-weight: 600;
    }
  }
}

.data-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  .data-btn {
    border-radius: 6px;
    text-transform: none;
    font-weight: 500;
  }
}

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-label {
      color: #6b7280;
    }

    .stat-value {
      color: #1f2937;
      font-weight: 600;
    }
  }
}

.save-section {
  text-align: center;

  .save-btn {
    border-radius: 8px;
    text-transform: none;
    font-weight: 600;
    padding: 0.75rem 2rem;
  }
}
</style>
