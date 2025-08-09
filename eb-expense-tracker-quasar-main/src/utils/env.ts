export function validateEnv() {
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

  const missing = requiredEnvVars.filter((varName) => {
    const value = process.env[varName];
    return !value || value === 'your-supabase-url' || value === 'your-supabase-anon-key';
  });

  if (missing.length > 0) {
    console.error('Missing or invalid environment variables:', missing);
    return false;
  }

  return true;
}
