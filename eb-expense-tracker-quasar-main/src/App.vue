<template>
  <div id="q-app">
    <div v-if="authStore.initializing" class="auth-loading">
      <div class="loading-container">
        <q-spinner-cube size="50px" color="primary" />
        <p class="loading-text">Initializing...</p>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  // Initialize authentication state
  await authStore.initAuth();

  // Redirect to login if not authenticated and not already on login page
  if (!authStore.isAuthenticated && router.currentRoute.value.path !== '/login') {
    void router.push('/login');
  }
});

// Watch for auth state changes
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated && router.currentRoute.value.path !== '/login') {
      void router.push('/login');
    }
  },
);
</script>

<style>
.auth-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
}
</style>
