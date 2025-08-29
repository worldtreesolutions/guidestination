import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkValidIds() {
  console.log('🔍 Checking valid IDs in the system...');

  // Check activities for provider IDs
  const { data: activities } = await supabase
    .from('activities')
    .select('id, provider_id, created_by')
    .limit(5);

  console.log('\n📋 Sample activity providers:');
  activities?.forEach(act => {
    console.log(`Activity ${act.id}: provider_id=${act.provider_id || 'null'}, created_by=${act.created_by || 'null'}`);
  });

  // Check existing messages for valid participant IDs
  const { data: existing } = await supabase
    .from('support_messages')
    .select('sender_id, receiver_id')
    .limit(3);

  console.log('\n💬 Existing message participants:');
  existing?.forEach(msg => {
    console.log(`Sender: ${msg.sender_id}, Receiver: ${msg.receiver_id}`);
  });

  // Let's try with one of the existing receiver IDs as provider
  if (existing && existing.length > 0) {
    const testProviderId = existing[0].receiver_id;
    console.log(`\n🧪 Testing with existing receiver ID as provider: ${testProviderId}`);
    
    const conversationId = crypto.randomUUID();
    const testMessage = {
      conversation_id: conversationId,
      sender_id: 'fdd6b827-b8b4-4068-b6c8-6a848e053903',
      receiver_id: testProviderId,
      sender_name: 'Test Customer',
      message: 'Testing with valid provider ID',
      sender_type: 'customer',
      is_read: false
    };

    const { data: result, error } = await supabase
      .from('support_messages')
      .insert([testMessage])
      .select()
      .single();

    if (error) {
      console.error('❌ Still failed:', error.message);
    } else {
      console.log('✅ Success! Message created:', result.id);
      
      // Clean up
      await supabase.from('support_messages').delete().eq('id', result.id);
      console.log('🧹 Test message cleaned up');
    }
  }
}

checkValidIds();
