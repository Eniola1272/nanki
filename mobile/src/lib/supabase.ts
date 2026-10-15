import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xgjlnlvychtrurgqkojw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamxubHZ5Y2h0cnVyZ3Frb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDAwNjAsImV4cCI6MjA5NDc3NjA2MH0._tsECyfCfLbGLNCF-VoXwoZpEXDOKX1bO6EFnYV8a0s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
