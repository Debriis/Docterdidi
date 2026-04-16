require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSchema() {
  const tables = ['doctors', 'patients', 'prescriptions', 'medicationLogs'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`\nTable: ${table}`);
    if (error) console.log('Error:', error.message);
    else if (data && data.length > 0) console.log('Columns:', Object.keys(data[0]));
    else console.log('No data, but table exists.');
  }
}
checkSchema();
