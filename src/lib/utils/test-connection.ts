import { supabase } from '../supabase.js';

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('conferences').select('count').single();
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.error('Check your environment variables:');
      console.error('PUBLIC_SUPABASE_URL:', process.env.PUBLIC_SUPABASE_URL);
      console.error('PUBLIC_SUPABASE_ANON_KEY:', process.env.PUBLIC_SUPABASE_ANON_KEY ? '****' : 'missing');
      return false;
    }

    console.log('✅ Successfully connected to Supabase!');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection();