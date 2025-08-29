// Simple test to check support tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupportTables() {
  console.log('🧪 Testing support tables...');

  try {
    // Test support_conversation table
    console.log('\n1️⃣ Testing support_conversation table...');
    const { data: conversations, error: convError } = await supabase
      .from('support_conversation')
      .select('*')
      .limit(1);

    if (convError) {
      console.log('❌ support_conversation table does not exist or has permission issues:', convError.message);
    } else {
      console.log('✅ support_conversation table exists and accessible');
      console.log('Schema columns found:', Object.keys(conversations?.[0] || {}));
    }

    // Test support_messages table
    console.log('\n2️⃣ Testing support_messages table...');
    const { data: messages, error: msgError } = await supabase
      .from('support_messages')
      .select('*')
      .limit(1);

    if (msgError) {
      console.log('❌ support_messages table does not exist or has permission issues:', msgError.message);
    } else {
      console.log('✅ support_messages table exists and accessible');
      console.log('Schema columns found:', Object.keys(messages?.[0] || {}));
    }

    // Test creating a conversation
    console.log('\n3️⃣ Testing conversation creation...');
    const { data: newConv, error: createError } = await supabase
      .from('support_conversation')
      .insert([{
        customer_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
        activity_provider_id: 'test-provider',
        activity_id: 'test-activity',
        status: 'active'
      }])
      .select()
      .single();

    if (createError) {
      console.log('❌ Cannot create conversation:', createError.message);
    } else {
      console.log('✅ Conversation created successfully:', newConv.id);
      
      // Test creating a message
      console.log('\n4️⃣ Testing message creation...');
      const { data: newMsg, error: msgCreateError } = await supabase
        .from('support_messages')
        .insert([{
          conversation_id: newConv.id,
          sender_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
          message: 'Test message',
          sender_type: 'customer'
        }])
        .select()
        .single();

      if (msgCreateError) {
        console.log('❌ Cannot create message:', msgCreateError.message);
      } else {
        console.log('✅ Message created successfully:', newMsg.id);
        
        // Clean up
        await supabase.from('support_messages').delete().eq('id', newMsg.id);
        await supabase.from('support_conversation').delete().eq('id', newConv.id);
        console.log('🧹 Test data cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSupportTables();
