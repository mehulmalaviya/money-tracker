import { createClient } from '@supabase/supabase-js';
import { boot } from 'quasar/wrappers';

const supabaseUrl = process.env.SUPABASE_URL || 'https://dvlnbbncekktwstbnljv.supabase.co';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bG5iYm5jZWtrdHdzdGJubGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDcwODcsImV4cCI6MjA2ODk4MzA4N30.L9LACBCe0s9aal-0MJHWGkJi8OONJH5NoxF3CKwUEVY';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
  console.error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'expence-managment-system',
    storage: window.localStorage,
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$supabase = supabase;

  // Debug auth events in development
  if (process.env.NODE_ENV === 'development') {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase Auth Event:', event);
      console.log('Session:', session?.user?.email || 'No session');
    });
  }
});
