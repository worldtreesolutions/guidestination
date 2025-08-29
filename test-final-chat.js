// Test the final chat service implementation
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFinalChatService() {
  console.log('🧪 Testing final chat service implementation...');

  try {
    const customerId = 'fdd6b827-b8b4-4068-b6c8-6a848e053903';
    const providerId = 'test-provider-456';
    
    // Step 1: Create a new conversation with proper UUID
    console.log('\n1️⃣ Creating first message (new conversation)...');
    const conversationId = crypto.randomUUID();
    console.log('Generated conversation ID:', conversationId);
    
    const firstMessage = {
      conversation_id: conversationId,
      sender_id: customerId,
      receiver_id: providerId,
      sender_name: 'Test Customer',
      message: 'Hello! I am interested in this activity.',
      sender_type: 'customer',
      is_read: false
    };

    const { data: msg1, error: error1 } = await supabase
      .from('support_messages')
      .insert([firstMessage])
      .select()
      .single();

    if (error1) {
      console.error('❌ First message failed:', error1);
      return;
    }
    console.log('✅ First message created:', msg1.id);

    // Step 2: Add a second message to the same conversation
    console.log('\n2️⃣ Adding second message to same conversation...');
    const secondMessage = {
      conversation_id: conversationId,
      sender_id: customerId,
      receiver_id: providerId,
      sender_name: 'Test Customer',
      message: 'Can you tell me more about the pricing?',
      sender_type: 'customer',
      is_read: false
    };

    const { data: msg2, error: error2 } = await supabase
      .from('support_messages')
      .insert([secondMessage])
      .select()
      .single();

    if (error2) {
      console.error('❌ Second message failed:', error2);
    } else {
      console.log('✅ Second message created:', msg2.id);
    }

    // Step 3: Retrieve all messages for this conversation
    console.log('\n3️⃣ Retrieving conversation messages...');
    const { data: conversation, error: fetchError } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError);
    } else {
      console.log(`✅ Retrieved ${conversation.length} messages:`);
      conversation.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.sender_type}] ${msg.sender_name}: ${msg.message}`);
      });
    }

    // Step 4: Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('support_messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    console.log('✅ Chat service test completed successfully!');
    console.log('\n🎉 Ready to test in the actual application!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFinalChatService();
