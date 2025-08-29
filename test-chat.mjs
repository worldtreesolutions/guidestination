import { supabase } from './src/integrations/supabase/client.ts';

async function testSupportTables() {
  console.log('🧪 Testing support conversation and messages tables...');
  
  try {
    // Test 1: Check if support_conversation table exists
    console.log('\n1️⃣ Testing read access to support_conversation table...');
    const { data: conversations, error: convReadError } = await supabase
      .from('support_conversation')
      .select('*')
      .limit(5);
    
    if (convReadError) {
      console.error('❌ support_conversation read error:', convReadError);
    } else {
      console.log('✅ support_conversation read successful, found', conversations?.length || 0, 'conversations');
      if (conversations && conversations.length > 0) {
        console.log('📄 Sample conversation structure:', conversations[0]);
      }
    }

    // Test 2: Check if support_messages table exists
    console.log('\n2️⃣ Testing read access to support_messages table...');
    const { data: existingMessages, error: readError } = await supabase
      .from('support_messages')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.error('❌ support_messages read error:', readError);
    } else {
      console.log('✅ support_messages read successful, found', existingMessages?.length || 0, 'messages');
      if (existingMessages && existingMessages.length > 0) {
        console.log('📄 Sample message structure:', existingMessages[0]);
      }
    }
    
    // Test 3: Try to create a conversation first
    console.log('\n3️⃣ Testing conversation creation...');
    const testConversation = {
      customer_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903', // Your customer ID
      activity_provider_id: 'test-provider-id',
      activity_id: 'test-activity-id',
      status: 'active'
    };
    
    console.log('📝 Attempting to create conversation:', testConversation);
    
    const { data: conversationResult, error: convInsertError } = await supabase
      .from('support_conversation')
      .insert([testConversation])
      .select()
      .single();
    
    if (convInsertError) {
      console.error('❌ Conversation creation error:', convInsertError);
    } else {
      console.log('✅ Conversation created:', conversationResult);
      
      // Test 4: Try to insert a test message
      console.log('\n4️⃣ Testing message insertion...');
      const testMessage = {
        conversation_id: conversationResult.id,
        sender_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
        message: 'Test message from customer',
        sender_type: 'customer'
      };
      
      console.log('📝 Attempting to insert message:', testMessage);
      
      const { data: messageResult, error: messageError } = await supabase
        .from('support_messages')
        .insert([testMessage])
        .select()
        .single();
      
      if (messageError) {
        console.error('❌ Message insert error:', messageError);
        console.error('Error details:', {
          code: messageError.code,
          message: messageError.message,
          details: messageError.details,
          hint: messageError.hint
        });
      } else {
        console.log('✅ Message insert successful:', messageResult);
        
        // Clean up
        await supabase.from('support_messages').delete().eq('id', messageResult.id);
        console.log('🧹 Test message cleaned up');
      }
      
      // Clean up conversation
      await supabase.from('support_conversation').delete().eq('id', conversationResult.id);
      console.log('🧹 Test conversation cleaned up');
    }
    
    // Test 5: Check table schemas
    console.log('\n5️⃣ Testing table schemas...');
    
    // Check support_conversation schema
    const { error: convSchemaError } = await supabase
      .from('support_conversation')
      .select('id, customer_id, activity_provider_id, activity_id, status, created_at, updated_at')
      .limit(1);
    
    if (convSchemaError) {
      console.error('❌ support_conversation schema error:', convSchemaError);
    } else {
      console.log('✅ support_conversation schema test passed');
    }
    
    // Check support_messages schema
    const { error: msgSchemaError } = await supabase
      .from('support_messages')
      .select('id, conversation_id, sender_id, message, sender_type, created_at, read_at')
      .limit(1);
    
    if (msgSchemaError) {
      console.error('❌ support_messages schema error:', msgSchemaError);
    } else {
      console.log('✅ support_messages schema test passed');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSupportTables();
