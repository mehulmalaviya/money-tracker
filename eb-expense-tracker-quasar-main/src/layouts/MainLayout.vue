<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-dark main-header no-shadow">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title class="main-title">
          {{ currentPageTitle }}
        </q-toolbar-title>

        <q-space />

        <q-btn-dropdown
          flat
          dense
          :label="languageStore.getLanguageLabel(languageStore.currentLanguage)"
          icon="language"
          class="q-mr-sm"
        >
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="setLanguageEnglish"
              :class="{ 'bg-blue-1': languageStore.currentLanguage === 'en' }"
            >
              <q-item-section>English</q-item-section>
              <q-item-section side v-if="languageStore.currentLanguage === 'en'">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="setLanguageGujrati"
              :class="{ 'bg-blue-1': languageStore.currentLanguage === 'gu' }"
            >
              <q-item-section>ગુજરાતી</q-item-section>
              <q-item-section side v-if="languageStore.currentLanguage === 'gu'">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat dense round icon="logout" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="main-drawer">
      <q-list>
        <q-item-label header class="navigation-header"> Expense Tracking </q-item-label>

        <NavigationItem
          v-for="item in navigationItems"
          :key="item.name"
          :item="item"
          @navigate="handleNavigation"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { Dialog } from 'quasar';
import NavigationItem from 'src/components/NavigationItem.vue';
import { useSessionTimeout } from 'src/composables/useSessionTimeout';
import { useAuthStore } from 'src/stores/auth';
import { useLanguageStore } from 'src/stores/language';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

// Add this line in the script setup:
const { startTracking, stopTracking } = useSessionTimeout(60);

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();
const languageStore = useLanguageStore();

const leftDrawerOpen = ref(false);


const currentPageTitle = computed(() => {
  const routeName = route.path.split('/')[1];
  switch (routeName) {
    case 'dashboard':
      return t('navigation.dashboard');
    case 'income':
      return t('navigation.income');
    case 'expenses':
      return t('navigation.expenses');
    case 'categories':
      return t('navigation.categories');
    case 'reports':
      return t('navigation.reports');
    case 'settings':
      return t('navigation.settings');
    default:
      return t('navigation.dashboard');
  }
});

const navigationItems = computed(() => [
  {
    name: 'dashboard',
    label: t('navigation.dashboard'),
    icon: 'dashboard',
    route: '/dashboard',
  },
  {
    name: 'income',
    label: t('navigation.income'),
    icon: 'trending_up',
    route: '/income',
  },
  {
    name: 'expenses',
    label: t('navigation.expenses'),
    icon: 'trending_down',
    route: '/expenses',
  },
  {
    name: 'categories',
    label: t('navigation.categories'),
    icon: 'category',
    route: '/categories',
  },
  {
    name: 'reports',
    label: t('navigation.reports'),
    icon: 'assessment',
    route: '/reports',
  },
  {
    name: 'settings',
    label: t('navigation.settings'),
    icon: 'settings',
    route: '/settings',
  },
]);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleNavigation(route: string) {
  void router.push(route);
}

const setLanguageEnglish =()=>{
  languageStore.setLanguage('en')
  location.reload()
}
const setLanguageGujrati =()=>{
  languageStore.setLanguage('gu')
  location.reload()
}

// async function handleLogout() {
//   await authStore.logout();
//   void router.push('/login');
// }

// Updated logout handler with confirmation
async function handleLogout() {
  const confirm = await new Promise((resolve) => {
    Dialog.create({
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      cancel: true,
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });

  if (confirm) {
    stopTracking();
    await authStore.logout();
    void router.push('/login');
  }
}

// 60 minutes timeout

// Add watchers for auth state:
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      startTracking();
    } else {
      stopTracking();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.main-header {
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.1);

  .main-title {
    font-weight: 600;
    font-size: 1.25rem;
  }
}

.main-drawer {
  background: #fafafa;
  border-right: 1px solid #e2e8f0;

  .navigation-header {
    font-weight: 600;
    color: #374151;
    padding: 1rem;
  }
}
</style>
