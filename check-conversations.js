// Check for support_conversations table (plural)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSupportConversations() {
  console.log('🔍 Checking support_conversations table (plural)...');

  try {
    // Test support_conversations (plural)
    const { data: conversations, error: convError } = await supabase
      .from('support_conversations')
      .select('*')
      .limit(5);

    if (convError) {
      console.log('❌ support_conversations table does not exist:', convError.message);
    } else {
      console.log('✅ support_conversations table exists!');
      console.log(`📊 Found ${conversations.length} conversations`);
      if (conversations.length > 0) {
        console.log('📄 Sample conversation:', conversations[0]);
        console.log('🔗 Available conversation IDs:', conversations.map(c => c.id));
      }
    }

    // Also check what foreign key constraints exist
    console.log('\n🔗 Let\'s try to create a conversation first...');
    
    const newConversation = {
      customer_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
      provider_id: '8f07173c-b6bf-482a-8c2c-90efcd82d4f1', // Using an existing provider ID
      activity_id: 1, // Assuming some activity ID
      status: 'active'
    };      const { data: createdConv, error: createError } = await supabase
        .from('support_conversations')
        .insert([newConversation])
        .select()
        .single();

    if (createError) {
      console.log('❌ Cannot create conversation:', createError.message);
      console.log('💡 Trying different field names...');
      
      // Try different field structure
      const altConversation = {
        customer_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
        activity_provider_id: '8f07173c-b6bf-482a-8c2c-90efcd82d4f1',
        activity_id: '1'
      };

      const { data: altCreated, error: altError } = await supabase
        .from('support_conversations')
        .insert([altConversation])
        .select()
        .single();

      if (altError) {
        console.log('❌ Alternative structure failed:', altError.message);
      } else {
        console.log('✅ Conversation created with alt structure:', altCreated.id);
        
        // Now try to add a message
        await testMessageWithConversation(altCreated.id);
        
        // Clean up
        await supabase.from('support_conversations').delete().eq('id', altCreated.id);
      }
    } else {
      console.log('✅ Conversation created:', createdConv.id);
      
      // Now try to add a message
      await testMessageWithConversation(createdConv.id);
      
      // Clean up
      await supabase.from('support_conversations').delete().eq('id', createdConv.id);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function testMessageWithConversation(conversationId) {
  console.log(`\n📤 Testing message with conversation ID: ${conversationId}`);
  
  const testMessage = {
    conversation_id: conversationId,
    sender_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
    receiver_id: '8f07173c-b6bf-482a-8c2c-90efcd82d4f1',
    sender_name: 'Test Customer',
    message: 'Test message with proper conversation_id',
    sender_type: 'customer',
    is_read: false
  };

  const { data: msgResult, error: msgError } = await supabase
    .from('support_messages')
    .insert([testMessage])
    .select()
    .single();

  if (msgError) {
    console.error('❌ Message failed:', msgError.message);
  } else {
    console.log('✅ Message created successfully:', msgResult.id);
    // Clean up message
    await supabase.from('support_messages').delete().eq('id', msgResult.id);
  }
}

checkSupportConversations();
