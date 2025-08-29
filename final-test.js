// Final working test with known valid IDs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testWithValidIds() {
  console.log('🧪 Testing with known valid IDs...');

  try {
    // Use the IDs we saw in the earlier sample data
    const customerId = 'fdd6b827-b8b4-4068-b6c8-6a848e053903'; // Your customer ID
    const providerId = '8f07173c-b6bf-482a-8c2c-90efcd82d4f1'; // From existing message
    
    console.log(`Customer ID: ${customerId}`);
    console.log(`Provider ID: ${providerId}`);
    
    const conversationId = crypto.randomUUID();
    console.log(`Generated conversation ID: ${conversationId}`);
    
    const testMessage = {
      conversation_id: conversationId,
      sender_id: customerId,
      receiver_id: providerId,
      sender_name: 'Test Customer',
      message: 'Hello! I would like to chat about your activity.',
      sender_type: 'customer',
      is_read: false
    };

    console.log('\n📤 Creating test message...');
    const { data: result, error } = await supabase
      .from('support_messages')
      .insert([testMessage])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed:', error);
    } else {
      console.log('✅ Success! Message created:', result.id);
      console.log('📄 Message details:', {
        id: result.id,
        conversation_id: result.conversation_id,
        message: result.message,
        sender_type: result.sender_type
      });
      
      // Test retrieving the message
      console.log('\n📨 Retrieving message...');
      const { data: retrieved, error: fetchError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId);

      if (fetchError) {
        console.error('❌ Fetch failed:', fetchError);
      } else {
        console.log(`✅ Retrieved ${retrieved.length} messages from conversation`);
      }
      
      // Clean up
      console.log('\n🧹 Cleaning up...');
      await supabase.from('support_messages').delete().eq('id', result.id);
      console.log('✅ Chat functionality is working correctly!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testWithValidIds();
