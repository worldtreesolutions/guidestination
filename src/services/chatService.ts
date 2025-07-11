
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/activity";

const supabaseAny = supabase as any;

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  activity_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export interface SendMessageData {
  sender_id: string;
  receiver_id: string;
  activity_id: string;
  message: string;
}

export type NewMessage = Omit<Message, "id" | "created_at" | "sender">;

const chatService = {
  async getMessages(bookingId: string): Promise<ChatMessage[]> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    try {
      const queryResult = await supabaseAny
        .from("chat_messages")
        .select("*")
        .eq("activity_id", bookingId)
        .order("created_at", { ascending: true })

      if (queryResult.error) {
        console.error("Error fetching messages:", queryResult.error)
        throw queryResult.error
      }

      return (queryResult.data || []).map((item: any) => ({
        id: item.id,
        sender_id: item.sender_id,
        receiver_id: item.receiver_id,
        activity_id: bookingId,
        message: item.message,
        created_at: item.created_at,
        read_at: item.read_at
      }));
    } catch (error) {
      console.error("Error in getMessages:", error);
      throw error;
    }
  },

  async sendMessage(messageData: SendMessageData): Promise<ChatMessage> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabaseAny
      .from("chat_messages")
      .insert([messageData])
      .select()
      .single();

    if (result.error) {
      throw result.error;
    }

    return result.data as ChatMessage;
  },

  async markAsRead(messageId: string): Promise<void> {
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabaseAny
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
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
      .from("chat_messages")
      .select("id")
      .eq("receiver_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Error fetching unread messages:", error);
      return [];
    }
    return data || [];
  },

  async subscribeToMessages(
    userId: string,
    onNewMessage: (message: ChatMessage) => void
  ) {
    if (!supabaseAny) return null;

    const channel = supabaseAny
      .channel(`messages_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${userId}`,
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
      .from("chat_messages")
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default chatService
  