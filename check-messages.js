// Check existing data structure in support_messages
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExistingData() {
  console.log('🔍 Checking existing support_messages data...');

  try {
    // Check existing messages to understand the structure
    const { data: messages, error } = await supabase
      .from('support_messages')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }

    console.log(`📊 Found ${messages.length} existing messages`);
    
    if (messages.length > 0) {
      console.log('\n📄 Sample message structure:');
      console.log(JSON.stringify(messages[0], null, 2));
      
      // Check unique conversation_ids
      const conversationIds = [...new Set(messages.map(m => m.conversation_id))];
      console.log('\n🔗 Unique conversation IDs found:');
      conversationIds.forEach((id, index) => {
        console.log(`   ${index + 1}. ${id}`);
      });
    } else {
      console.log('📝 No existing messages found. Let\'s try to create one with a proper UUID...');
      
      // Generate a proper UUID for conversation_id
      const conversationId = crypto.randomUUID();
      console.log('Generated UUID:', conversationId);
      
      const messageData = {
        conversation_id: conversationId,
        sender_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
        receiver_id: 'test-provider-123',
        sender_name: 'Test Customer',
        message: 'Hello, this is a test message!',
        sender_type: 'customer',
        is_read: false
      };

      const { data: newMessage, error: insertError } = await supabase
        .from('support_messages')
        .insert([messageData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
      } else {
        console.log('✅ Message created with UUID:', newMessage.id);
        
        // Clean up
        await supabase.from('support_messages').delete().eq('id', newMessage.id);
        console.log('🧹 Test message cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkExistingData();
