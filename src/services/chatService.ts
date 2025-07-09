import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"]
export type SendMessageData = Database["public"]["Tables"]["chat_messages"]["Insert"]

const chatService = {
  async getMessages(customerId: string, ownerId: string, activityId: number): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("activity_id", activityId)
      .or(`and(sender_id.eq.${customerId},receiver_id.eq.${ownerId}),and(sender_id.eq.${ownerId},receiver_id.eq.${customerId})`)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      throw error
    }

    return data || []
  },

  async sendMessage(messageData: SendMessageData): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert(messageData)
      .select()
      .single()

    if (error) {
      console.error("Error sending message:", error)
      throw error
    }

    return data
  },

  async markAsRead(messageId: string): Promise<void> {
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
