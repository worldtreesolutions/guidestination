import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import chatService, { ChatMessage } from "@/services/chatService";
import { ActivityWithDetails } from "@/types/activity";

// Helper function to generate deterministic UUID from activity data (same as chatService)
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
  
  console.log(`🔍 ActivityChat - Generated UUID for ${baseString}: ${uuid}`);
  return uuid;
}

interface ActivityChatProps {
  activity: ActivityWithDetails;
}

export function ActivityChat({ activity }: ActivityChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log("ActivityChat - User:", user);
  console.log("ActivityChat - Activity:", activity);
  console.log("ActivityChat - Provider ID:", activity?.provider_id || activity?.created_by);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    if (!activity?.id || !user) return;
    try {
      setLoading(true);
      console.log("Loading messages for user:", user.id, "and activity:", activity.id);
      
      // Create activity-specific conversation UUID - MUST match chatService format
      const providerId = activity.provider_id || activity.created_by;
      const activityConversationId = generateActivityConversationId(
        String(activity.id),
        user.id,
        providerId
      );
      
      console.log("🔍 ActivityChat - Generated conversation UUID:", activityConversationId);
      console.log("🔍 ActivityChat - Activity ID:", activity.id);
      console.log("🔍 ActivityChat - Customer ID:", user.id);
      console.log("🔍 ActivityChat - Provider ID:", providerId);
      
      // Load messages from support_messages table filtered by this activity conversation
      const supabaseAny = supabase as any;
      const { data: messages, error } = await supabaseAny
        .from('support_messages')
        .select('*')
        .eq('conversation_id', activityConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
        return;
      }

      // Convert to ChatMessage format
      const formattedMessages: ChatMessage[] = messages?.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender_name: msg.sender_name,
        message: msg.message,
        sender_type: msg.sender_type,
        is_read: msg.is_read,
        created_at: msg.created_at
      })) || [];

      console.log("Loaded activity-specific messages:", formattedMessages);
      console.log("Activity conversation UUID:", activityConversationId);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [activity?.id, activity?.provider_id, activity?.created_by, user]);

  useEffect(() => {
    if (isOpen && activity && user) {
      loadMessages();
    }
  }, [isOpen, activity, user, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    // Use created_by as the provider_id if provider_id is not available
    const providerId = activity.provider_id || activity.created_by;
    if (!providerId) {
      console.error("No provider ID found for this activity");
      alert("Unable to identify activity provider. Please contact support.");
      return;
    }

    try {
      const messageData = {
        customer_id: user.id,
        activity_provider_id: providerId,
        activity_id: String(activity.id),
        message: newMessage.trim(),
        sender_type: "customer" as const,
        sender_name: user.email || "Customer", // Use email or fallback to "Customer"
        sender_email: user.email || "customer@example.com"
      };

      console.log("Sending message with updated data:", messageData);
      
      const sentMessage = await chatService.sendMessage(messageData);
      setNewMessage("");
      
      console.log("Message sent successfully:", sentMessage);
      
      // Reload messages to show the new message
      await loadMessages();
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Show user-friendly error message
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Please log in to chat with the activity provider
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isOpen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full"
            variant="outline"
          >
            Start Conversation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Provider
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 p-4">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_id === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender_id !== user.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      message.sender_id === user.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {message.sender_id === user.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
