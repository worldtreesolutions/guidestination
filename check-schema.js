import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Checking support_conversations table schema...');
  
  try {
    // Try to get some data with all fields to see what's available
    const { data, error } = await supabase
      .from('support_conversations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying table:', error.message);
      
      // Try a simple insert to see what fields are required
      console.log('🔍 Trying a simple insert to see required fields...');
      const testData = {
        id: 'test-schema-check',
        subject: 'Test Subject'
      };
      
      const { error: insertError } = await supabase
        .from('support_conversations')
        .insert([testData]);
      
      if (insertError) {
        console.error('❌ Insert error (reveals required fields):', insertError.message);
        console.error('❌ Insert error details:', insertError.details);
        console.error('❌ Insert error hint:', insertError.hint);
      }
      
      return;
    }
    
    console.log('✅ Query successful!');
    console.log('📊 Sample data structure:', data);
    
    if (data && data.length > 0) {
      console.log('🔧 Available fields:', Object.keys(data[0]));
    } else {
      console.log('ℹ️ No existing data in table');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkSchema().catch(console.error);
