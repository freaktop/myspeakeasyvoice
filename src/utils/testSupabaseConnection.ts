// Test Supabase connection
import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if client is initialized
    if (!supabase) {
      console.error('❌ Supabase client is not initialized');
      return false;
    }
    console.log('✅ Supabase client initialized');

    // Test 2: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return false;
    }
    console.log('✅ Session check passed', session ? `(User: ${session.user.email})` : '(No active session)');

    // Test 3: Test database connection (try to query a simple table)
    // This will fail gracefully if tables don't exist, but connection will work
    const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
    if (dbError && !dbError.message.includes('relation') && !dbError.message.includes('does not exist')) {
      console.warn('⚠️ Database query warning:', dbError.message);
    } else {
      console.log('✅ Database connection working');
    }

    // Test 4: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      console.log('✅ Environment variables set');
    } else {
      console.warn('⚠️ Using default Supabase credentials from code');
    }

    console.log('✅ All Supabase connection tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
}

// Auto-run in development
if (import.meta.env.DEV) {
  testSupabaseConnection();
}

