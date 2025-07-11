import { supabase } from "@/integrations/supabase/client"

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  activity_id: number;
  message: string;
  created_at: string;
  read_at?: string;
}

export interface SendMessageData {
  sender_id: string;
  receiver_id: string;
  activity_id: number;
  message: string;
}

const chatService = {
  async getMessages(customerId: string, ownerId: string, activityId: number): Promise<ChatMessage[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
      .from("chat_messages")
      .select("*")
      .eq("activity_id", activityId)
      .or(`and(sender_id.eq.${customerId},receiver_id.eq.${ownerId}),and(sender_id.eq.${ownerId},receiver_id.eq.${customerId})`)
      .order("created_at", { ascending: true })

    if (result.error) {
      console.error("Error fetching messages:", result.error)
      throw result.error
    }

    return (result.data || []).map((item: any) => ({
      id: item.id,
      sender_id: item.sender_id,
      receiver_id: item.receiver_id,
      activity_id: activityId,
      message: item.message,
      created_at: item.created_at,
      read_at: item.read_at
    }));
  },

  async sendMessage(messageData: SendMessageData): Promise<ChatMessage> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
      .from("chat_messages")
      .insert(messageData)
      .select()
      .single()

    if (result.error) {
      console.error("Error sending message:", result.error)
      throw result.error
    }

    return {
      id: result.data.id,
      sender_id: result.data.sender_id,
      receiver_id: result.data.receiver_id,
      activity_id: messageData.activity_id,
      message: result.data.message,
      created_at: result.data.created_at,
      read_at: result.data.read_at
    };
  },

  async markAsRead(messageId: string): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId)

    if (error) {
      console.error("Error marking message as read:", error)
      throw error
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { count, error } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .is("read_at", null)

    if (error) {
      console.error("Error getting unread count:", error)
      throw error
    }

    return count || 0
  }
}

export default chatService
