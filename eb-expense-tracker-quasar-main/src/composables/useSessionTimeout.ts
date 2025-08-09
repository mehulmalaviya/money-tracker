import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';

export function useSessionTimeout(timeoutMinutes = 60) {
  const authStore = useAuthStore();
  const router = useRouter();
  const lastActivity = ref(Date.now());
  const timeoutId = ref<NodeJS.Timeout | null>(null);

  function updateActivity() {
    lastActivity.value = Date.now();
    resetTimeout();
  }

  function resetTimeout() {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }

    timeoutId.value = setTimeout(
      () => {
        void handleTimeout();
      },
      timeoutMinutes * 60 * 1000,
    );
  }

  async function handleTimeout() {
    if (authStore.isAuthenticated) {
      await authStore.logout();

      Notify.create({
        type: 'warning',
        message: 'Session expired due to inactivity. Please login again.',
        timeout: 5000,
      });

      void router.push('/login');
    }
  }

  function startTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    resetTimeout();
  }

  function stopTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.removeEventListener(event, updateActivity, true);
    });

    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }
  }

  onMounted(() => {
    if (authStore.isAuthenticated) {
      startTracking();
    }
  });

  onUnmounted(() => {
    stopTracking();
  });

  return {
    startTracking,
    stopTracking,
    updateActivity,
  };
}
