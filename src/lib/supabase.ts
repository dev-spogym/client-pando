import { processLock } from '@supabase/auth-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수를 설정하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Avoid browser LockManager conflicts under Next.js dev/Strict-style remounts.
    lock: processLock,
  },
});
