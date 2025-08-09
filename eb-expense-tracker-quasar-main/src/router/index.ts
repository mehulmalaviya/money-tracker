import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

import routes from './routes';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Wait for auth initialization to complete
    if (authStore.initializing) {
      // Create a promise that resolves when initialization is complete
      await new Promise<void>((resolve) => {
        const unwatch = authStore.$subscribe(() => {
          if (!authStore.initializing) {
            unwatch();
            resolve();
          }
        });
      });
    }


    const requiresAuth = to.meta.requiresAuth;
    const isAuthenticated = authStore.isAuthenticated;

    if (requiresAuth && !isAuthenticated) {
      // Check if session is still valid before redirecting
      const sessionValid = await authStore.checkSession();

      if (!sessionValid) {
        console.log('Redirecting to login - no valid session');
        next('/login');
        return;
      }
    }

    if (to.path === '/login' && isAuthenticated) {
      console.log('Redirecting to dashboard - already authenticated');
      next('/dashboard');
      return;
    }

    // Restrict "/admin" route to only 'master' users
    if (to.path === '/admin' && authStore.role !== 'master') {
      console.log('Access denied: Only master can access /admin');
      next('/not-authorized'); // or redirect to dashboard or another route
      return;
    }
    console.log("authStore", authStore.role);

    // if(authStore?.role=='master')

    next();
  });

  return Router;
});
