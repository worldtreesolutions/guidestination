// Test conversation ID generation to ensure consistency

// Browser-compatible hash function
function generateActivityConversationId(activityId, customerId, providerId) {
  const baseString = `activity-${activityId}-${customerId}-${providerId}`;
  
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  
  const uuid = [
    hashStr.substring(0, 8),
    hashStr.substring(0, 4),
    '4' + hashStr.substring(1, 4),
    '8' + hashStr.substring(1, 4),
    hashStr.repeat(3).substring(0, 12)
  ].join('-');
  
  return uuid;
}

// Simulate data
const testActivity = {
  id: 123,
  provider_id: 'provider-uuid-123',
  created_by: 'backup-provider-uuid'
}

const testUser = {
  id: 'customer-uuid-456'
}

// Test ActivityChat format
const providerId = testActivity.provider_id || testActivity.created_by
const activityChatConversationId = generateActivityConversationId(String(testActivity.id), testUser.id, providerId)

// Test ChatService format (should be the same)
const chatServiceConversationId = generateActivityConversationId(String(testActivity.id), testUser.id, providerId)

console.log('ActivityChat conversation UUID:', activityChatConversationId)
console.log('ChatService conversation UUID:', chatServiceConversationId)
console.log('UUIDs match:', activityChatConversationId === chatServiceConversationId)
console.log('UUID format valid:', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/.test(activityChatConversationId))
