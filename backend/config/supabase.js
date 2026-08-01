const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'dummy_supabase_key';

let supabase = null;

try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client Initialized');
} catch (error) {
  console.warn('⚠️ Supabase Initialization Notice:', error.message);
}

module.exports = supabase;
