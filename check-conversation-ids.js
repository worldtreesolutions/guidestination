const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lngdmhevckdxmzftjqbu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ2RtaGV2Y2tkeG16ZnRqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NDIyMDUsImV4cCI6MjA0ODMxODIwNX0.EpNWnYNGFCE7DhPaXkcv46xECnHYWHHUovr0wOTOUqs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConversationIDs() {
  try {
    console.log('🔍 Checking all conversation IDs in support_messages...')
    
    const { data: messages, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    console.log('📊 Found', messages.length, 'messages')
    
    // Group by conversation_id
    const conversationGroups = {}
    messages.forEach(msg => {
      if (!conversationGroups[msg.conversation_id]) {
        conversationGroups[msg.conversation_id] = []
      }
      conversationGroups[msg.conversation_id].push(msg)
    })
    
    console.log('📋 Conversation IDs found:')
    Object.keys(conversationGroups).forEach(convId => {
      const msgs = conversationGroups[convId]
      console.log(`  - ${convId} (${msgs.length} messages)`)
      
      // Check if this follows our activity pattern
      if (convId.startsWith('activity-')) {
        const parts = convId.split('-')
        console.log(`    Format: ${parts.length} parts - ${parts.join(' | ')}`)
      }
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkConversationIDs()
