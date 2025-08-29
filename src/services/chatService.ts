
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/activity";

const supabaseAny = supabase as any;

// Helper function to generate deterministic UUID from activity data
function generateActivityConversationId(activityId: string, customerId: string, providerId: string): string {
  // Create a deterministic string
  const baseString = `activity-${activityId}-${customerId}-${providerId}`;
  
  // Simple hash function for browser compatibility
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and pad with zeros
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    hashStr.substring(0, 8),
    hashStr.substring(0, 4),
    '4' + hashStr.substring(1, 4), // Version 4 UUID
    '8' + hashStr.substring(1, 4), // Variant bits
    hashStr.repeat(3).substring(0, 12)
  ].join('-');
  
  console.log(`🔍 Generated UUID for ${baseString}: ${uuid}`);
  return uuid;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender_type: string;
}

export interface SendMessageData {
  conversation_id?: string;
  customer_id: string;
  activity_provider_id: string;
  activity_id: string;
  message: string;
  sender_type: string;
  sender_name?: string;
  sender_email?: string;
}

export type NewMessage = Omit<Message, "id" | "created_at" | "sender">;

const chatService = {
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    try {
      const queryResult = await supabaseAny
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (queryResult.error) {
        console.error("Error fetching messages:", queryResult.error)
        throw queryResult.error
      }

      return queryResult.data || [];
    } catch (error) {
      console.error("Error in getMessages:", error);
      throw error;
    }
  },

  async sendMessage(messageData: SendMessageData): Promise<ChatMessage> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    console.log("Sending message with data:", messageData);

    try {
      // Create activity-specific conversation UUID using deterministic generation
      const conversationId = generateActivityConversationId(
        messageData.activity_id,
        messageData.customer_id,
        messageData.activity_provider_id
      );
      
      console.log("🔍 ChatService - Using activity-specific conversation UUID:", conversationId);
      
      // First, ensure the conversation exists in support_conversations table
      await this.ensureConversationExists(conversationId, messageData);
      
      // Prepare message data for support_messages table
      const messageToInsert = {
        conversation_id: conversationId,
        sender_id: messageData.sender_type === 'customer' ? messageData.customer_id : messageData.activity_provider_id,
        receiver_id: messageData.sender_type === 'customer' ? messageData.activity_provider_id : messageData.customer_id,
        sender_name: messageData.sender_name || 'Customer',
        message: messageData.message,
        sender_type: messageData.sender_type,
        is_read: false
      };

      console.log("🔍 Debug - messageToInsert:", messageToInsert);

      const result = await supabaseAny
        .from("support_messages")
        .insert([messageToInsert])
        .select()
        .single();

      if (result.error) {
        console.error("Database error when sending message:", result.error);
        throw result.error;
      }

      console.log("Message sent successfully:", result.data);
      return result.data as ChatMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  },

  async ensureConversationExists(conversationId: string, messageData: SendMessageData): Promise<void> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    try {
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabaseAny
        .from("support_conversations")
        .select("id")
        .eq("id", conversationId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error checking conversation existence:", checkError);
        throw checkError;
      }

      if (existingConversation) {
        console.log("🔍 Conversation already exists:", conversationId);
        return; // Conversation already exists
      }

      // Create new conversation record
      const conversationRecord = {
        id: conversationId,
        subject: `Activity #${messageData.activity_id} Discussion`,
        participant_type: 'customer', // Use valid enum value
        participant_name: messageData.sender_name || 'Customer',
        participant_email: messageData.sender_email || 'customer@example.com',
        status: 'open',
        priority: 'medium',
        activity_id: messageData.activity_id || null
      };

      console.log("🔍 Creating new conversation:", conversationRecord);

      const { data: newConversation, error: createError } = await supabaseAny
        .from("support_conversations")
        .insert([conversationRecord])
        .select()
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        throw createError;
      }

      console.log("✅ Conversation created successfully:", newConversation);
    } catch (error) {
      console.error("Error in ensureConversationExists:", error);
      throw error;
    }
  },

  async markAsRead(messageId: string): Promise<void> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabaseAny
      .from("support_messages")
      .update({ is_read: true })
      .eq("id", messageId)

    if (error) {
      console.error("Error marking message as read:", error)
      throw error
    }
  },

  async getUnreadMessages(userId: string): Promise<{ id: string }[]> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }
    const { data, error } = await supabaseAny
      .from("support_messages")
      .select("id")
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread messages:", error);
      return [];
    }
    return data || [];
  },

  async subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: ChatMessage) => void
  ) {
    if (!supabaseAny) return null;

    const channel = supabaseAny
      .channel(`messages_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          onNewMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return channel;
  },

  async createMessage(message: NewMessage) {
    const { data, error } = await supabaseAny
      .from("support_messages")
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default chatService
  