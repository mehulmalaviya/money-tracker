import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { supabase } from 'src/boot/supabase';
import type { User } from 'src/types';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const initializing = ref(true); // Track initial auth check
  const role=ref(null)

  const isAuthenticated = computed(() => !!user.value);

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
console.log("data",data);

      if (error) throw error;

      user.value = data.user as User;

      Notify.create({
        type: 'positive',
        message: 'Login successful',
      });

      const { data: userData } = await supabase
          .from('users')
          .select('role, master_id')
          .eq('id', data.user.id)
          .single()

          console.log("userData",userData);
          role.value=userData?.role

      return { success: true , role:userData?.role };

    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Login failed',
      });
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      user.value = null;

      Notify.create({
        type: 'positive',
        message: 'Logout successful',
      });
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Logout failed',
      });
    } finally {
      loading.value = false;
    }
  }

  async function initAuth() {
    initializing.value = true;

    try {
      // Get the current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        user.value = null;
        return;
      }

      if (session?.user) {
        user.value = session.user as User;
        console.log('Session restored for user:', session.user.email);
      } else {
        user.value = null;
        console.log('No active session found');
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          user.value = session.user as User;
        } else if (event === 'SIGNED_OUT') {
          user.value = null;
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          user.value = session.user as User;
          console.log('Token refreshed for user:', session.user.email);
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      user.value = null;
    } finally {
      initializing.value = false;
    }
  }

  // Check if user session is valid
  async function checkSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check error:', error);
        return false;
      }

      return !!session?.user;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  // Refresh the session
  async function refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      if (data.session?.user) {
        user.value = data.session.user as User;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  return {
    user,
    loading,
    initializing,
    role,
    isAuthenticated,
    login,
    logout,
    initAuth,
    checkSession,
    refreshSession,
  };
});
