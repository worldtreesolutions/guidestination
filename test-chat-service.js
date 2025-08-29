// Test the updated chat service
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

async function testChatService() {
  console.log('🧪 Testing chat service with support_messages table...');

  try {
    // Test data
    const customerId = 'fdd6b827-b8b4-4068-b6c8-6a848e053903';
    const providerId = 'test-provider-123';
    const activityId = 'test-activity-456';
    const conversationId = `${customerId}_${providerId}_${activityId}`;
    
    console.log('📝 Test data:');
    console.log('- Customer ID:', customerId);
    console.log('- Provider ID:', providerId);
    console.log('- Activity ID:', activityId);
    console.log('- Conversation ID:', conversationId);

    // Test message creation
    console.log('\n1️⃣ Testing message creation...');
    const messageData = {
      conversation_id: conversationId,
      sender_id: customerId,
      receiver_id: providerId,
      sender_name: 'Test Customer',
      message: 'Hello, I would like to know more about this activity!',
      sender_type: 'customer',
      is_read: false
    };

    console.log('📤 Inserting message:', messageData);
    
    const { data: newMessage, error: insertError } = await supabase
      .from('support_messages')
      .insert([messageData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Message creation failed:', insertError);
      return;
    }

    console.log('✅ Message created successfully:', newMessage.id);

    // Test message retrieval
    console.log('\n2️⃣ Testing message retrieval...');
    const { data: messages, error: fetchError } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Message retrieval failed:', fetchError);
    } else {
      console.log('✅ Messages retrieved successfully:', messages.length, 'messages found');
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.sender_type}] ${msg.sender_name}: ${msg.message}`);
      });
    }

    // Test marking as read
    console.log('\n3️⃣ Testing mark as read...');
    const { error: readError } = await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('id', newMessage.id);

    if (readError) {
      console.error('❌ Mark as read failed:', readError);
    } else {
      console.log('✅ Message marked as read successfully');
    }

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('support_messages')
      .delete()
      .eq('conversation_id', conversationId);
    
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testChatService();
