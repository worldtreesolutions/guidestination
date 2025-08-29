// Test script to check customer in database
import { supabase } from './src/integrations/supabase/client';

async function testCustomerAndChat() {
  console.log('🔍 Testing customer and chat functionality...');
  
  const customerId = 'fdd6b827-b8b4-4068-b6c8-6a848e053903';
  
  try {
    // Check if customer exists in customers table
    const supabaseAny = supabase as any;
    const { data: customer, error: customerError } = await supabaseAny
      .from('customers')
      .select('*')
      .eq('cus_id', customerId)
      .single();

    if (customerError) {
      console.error('❌ Error fetching customer:', customerError);
      return;
    }

    if (customer) {
      console.log('✅ Customer found in customers table:', customer);
    } else {
      console.log('❌ Customer not found in customers table');
      return;
    }

    // Check if customer has any chat messages
    const { data: chatMessages, error: chatError } = await supabaseAny
      .from('chat_messages')
      .select('*')
      .eq('sender_id', customerId)
      .limit(5);

    if (chatError) {
      console.error('❌ Error fetching chat messages:', chatError);
    } else {
      console.log(`📨 Found ${chatMessages?.length || 0} chat messages from this customer`);
      if (chatMessages && chatMessages.length > 0) {
        console.log('💬 Sample messages:', chatMessages);
      }
    }

    // Test the customers table structure
    const { data: tableInfo, error: tableError } = await supabaseAny
      .from('customers')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing customers table:', tableError);
    } else {
      console.log('📋 Customers table accessible, sample structure:', tableInfo?.[0] || 'No data');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testCustomerAndChat();
