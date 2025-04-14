const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

module.exports = supabase;