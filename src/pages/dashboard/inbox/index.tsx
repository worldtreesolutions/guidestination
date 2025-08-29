import { useState, useEffect } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, User, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  sender_name: string
  message: string
  sender_type: string
  is_read: boolean
  created_at: string
}

interface Conversation {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  activity_id?: string
  activity_title?: string
}

export default function InboxPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConversationList, setShowConversationList] = useState(true)
  const [windowWidth, setWindowWidth] = useState(0)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // On larger screens, always show both panels
      if (window.innerWidth >= 768) {
        setShowConversationList(true)
      }
    }
    
    // Set initial values
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
      handleResize()
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // When selecting a conversation on mobile, hide the conversation list
  useEffect(() => {
    if (activeConversation && windowWidth < 768) {
      setShowConversationList(false)
    }
  }, [activeConversation, windowWidth])

  // Fetch conversations
  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      setLoading(true)
      
      try {
        // Fetch real conversations from support_messages table
        const supabaseAny = supabase as any
        const { data: messages, error } = await supabaseAny
          .from('support_messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching conversations:', error)
          setConversations([])
          setLoading(false)
          return
        }

        // Group messages by conversation_id and extract activity info
        const conversationMap = new Map<string, Conversation>()
        
        // First, try to get conversation metadata from support_conversations table
        const { data: conversationRecords, error: convError } = await supabaseAny
          .from('support_conversations')
          .select('id, subject, participant_type, participant_name')
        
        const conversationMetadata = new Map<string, any>()
        if (!convError && conversationRecords) {
          conversationRecords.forEach((conv: any) => {
            conversationMetadata.set(conv.id, conv)
          })
        }
        
        messages?.forEach((msg: any) => {
          const conversationId = msg.conversation_id
          
          if (!conversationMap.has(conversationId)) {
            // Get activity info from conversation metadata if available
            const metadata = conversationMetadata.get(conversationId)
            let activityId = null
            let activityTitle = null
            
            if (metadata?.subject) {
              // Extract activity ID from subject like "Activity #123 Discussion"
              const activityMatch = metadata.subject.match(/Activity #(\d+)/)
              if (activityMatch) {
                activityId = activityMatch[1]
                activityTitle = `Activity #${activityId}`
              } else {
                activityTitle = metadata.subject
              }
            } else {
              // Fallback: Check if we can extract activity info from message content
              const messageContent = msg.message || ''
              if (messageContent.includes('activity') || messageContent.includes('booking')) {
                activityTitle = 'Activity Conversation'
              }
            }
            
            // Determine the other participant (not the current user)
            const isUserSender = msg.sender_id === user.id
            const otherUserId = isUserSender ? msg.receiver_id : msg.sender_id
            const otherUserName = isUserSender ? 
              (msg.sender_type === 'customer' ? 'Provider' : msg.sender_name || 'Customer') :
              msg.sender_name || (msg.sender_type === 'customer' ? 'Customer' : 'Provider')
            
            conversationMap.set(conversationId, {
              id: conversationId,
              user_id: otherUserId,
              user_name: otherUserName,
              last_message: msg.message,
              last_message_time: msg.created_at,
              unread_count: 0, // We'll calculate this below
              activity_id: activityId,
              activity_title: activityTitle
            })
          } else {
            // Update last message if this message is newer
            const existing = conversationMap.get(conversationId)!
            if (new Date(msg.created_at) > new Date(existing.last_message_time!)) {
              existing.last_message = msg.message
              existing.last_message_time = msg.created_at
            }
          }
          
          // Count unread messages for this user
          if (msg.receiver_id === user.id && !msg.is_read) {
            const conversation = conversationMap.get(conversationId)!
            conversation.unread_count++
          }
        })

        const conversationsList = Array.from(conversationMap.values())
        setConversations(conversationsList)
        
        if (conversationsList.length > 0 && !activeConversation) {
          setActiveConversation(conversationsList[0].id)
        }
        
        console.log('Loaded conversations:', conversationsList)
      } catch (error) {
        console.error('Error in fetchConversations:', error)
        setConversations([])
      }
      
      setLoading(false)
    }

    fetchConversations()
  }, [user, activeConversation])

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation || !user) return

    const fetchMessages = async () => {
      try {
        // Load real messages from support_messages table for this specific conversation
        const supabaseAny = supabase as any
        const { data: realMessages, error } = await supabaseAny
          .from('support_messages')
          .select('*')
          .eq('conversation_id', activeConversation)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching messages:', error)
          setMessages([])
          return
        }

        // Convert to the expected format
        const formattedMessages: Message[] = realMessages?.map((msg: any) => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          sender_name: msg.sender_name,
          message: msg.message,
          sender_type: msg.sender_type,
          is_read: msg.is_read,
          created_at: msg.created_at
        })) || []

        setMessages(formattedMessages)
        console.log('Loaded real messages for conversation:', activeConversation, formattedMessages)
      } catch (error) {
        console.error('Error in fetchMessages:', error)
        setMessages([])
      }
    }

    fetchMessages()
  }, [activeConversation, user])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeConversation) return

    try {
      // Send message to the specific conversation (which includes activity context)
      const supabaseAny = supabase as any
      
      // Extract receiver info from the active conversation
      const activeConv = conversations.find(c => c.id === activeConversation)
      if (!activeConv) {
        console.error('No active conversation found')
        alert('Please select a conversation first')
        return
      }
      
      // Ensure conversation exists in support_conversations table before sending message
      await ensureConversationExists(activeConversation, {
        sender_name: user.email || 'Provider',
        sender_email: user.email || 'provider@example.com',
        participant_type: 'activity_provider',
        activity_id: activeConv.activity_id
      })
      
      const messageData = {
        conversation_id: activeConversation,
        sender_id: user.id,
        receiver_id: activeConv.user_id,
        sender_name: user.email || 'Provider',
        message: newMessage.trim(),
        sender_type: 'provider',
        is_read: false
      }

      console.log('Sending message to conversation:', activeConversation, messageData)

      const { data: result, error } = await supabaseAny
        .from('support_messages')
        .insert([messageData])
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message')
        return
      }

      // Add to local state for immediate UI update
      const newMsg: Message = {
        id: result.id,
        conversation_id: result.conversation_id,
        sender_id: result.sender_id,
        receiver_id: result.receiver_id,
        sender_name: result.sender_name,
        message: result.message,
        sender_type: result.sender_type,
        is_read: result.is_read,
        created_at: result.created_at
      }

      setMessages([...messages, newMsg])
      setNewMessage("")
      
      console.log('Message sent successfully to activity conversation:', result)
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      alert('Failed to send message')
    }
  }

  // Helper function to ensure conversation exists in support_conversations table
  const ensureConversationExists = async (conversationId: string, metadata: any) => {
    const supabaseAny = supabase as any
    
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
        subject: `Activity Conversation`,
        participant_type: metadata.participant_type || 'activity_provider', // Use valid enum value
        participant_name: metadata.sender_name || 'Provider',
        participant_email: metadata.sender_email || user?.email || 'provider@example.com',
        status: 'open',
        priority: 'medium',
        activity_id: metadata.activity_id || null
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
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return t("dashboard.inbox.yesterday") || 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId)
    if (windowWidth < 768) {
      setShowConversationList(false)
    }
  }

  const handleBackToList = () => {
    setShowConversationList(true)
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>{t("dashboard.inbox.pleaseLogin") || "Please log in to view your inbox"}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Language Selector */}
      <div className="flex justify-end mb-4">
        <LanguageSelector />
      </div>

      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Conversation List - Conditionally shown on mobile */}
          {(showConversationList || windowWidth >= 768) && (
            <Card className="md:w-96 lg:w-80 xl:w-96 flex-shrink-0 border-r md:rounded-r-none h-full">
              <CardHeader>
                <CardTitle>{t("dashboard.inbox.title") || "Inbox"}</CardTitle>
                <CardDescription>{t("dashboard.inbox.description") || "Chat with activity providers"}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${activeConversation === conversation.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {conversation.user_avatar ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={conversation.user_avatar} 
                              alt={conversation.user_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <p className="font-medium truncate">{conversation.user_name}</p>
                            {conversation.activity_title && (
                              <p className="text-xs text-blue-600 truncate">{conversation.activity_title}</p>
                            )}
                          </div>
                          {conversation.last_message_time && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(conversation.last_message_time)}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message}
                          </p>
                        )}
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ededed] text-[10px] font-medium text-foreground flex-shrink-0">
                          {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                        </span>
                      )}
                    </div>
                  ))}
                  {conversations.length === 0 && !loading && (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t("dashboard.inbox.noConversations") || "No conversations yet"}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Message Area - Conditionally shown on mobile */}
          {(!showConversationList || windowWidth >= 768) && (
            <Card className="flex-1 flex flex-col h-full md:rounded-l-none">
              {activeConversation ? (
                <>
                  <CardHeader className="border-b py-3">
                    <div className="flex items-center">
                      {windowWidth < 768 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="mr-2" 
                          onClick={handleBackToList}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                      )}
                      <Avatar className="h-8 w-8 mr-2">
                        {conversations.find(c => c.id === activeConversation)?.user_avatar ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={conversations.find(c => c.id === activeConversation)?.user_avatar || ''} 
                              alt={conversations.find(c => c.id === activeConversation)?.user_name || ''}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </Avatar>
                      <CardTitle className="text-lg">
                        <div className="flex flex-col">
                          <span>{conversations.find(c => c.id === activeConversation)?.user_name}</span>
                          {conversations.find(c => c.id === activeConversation)?.activity_title && (
                            <span className="text-sm text-blue-600 font-normal">
                              {conversations.find(c => c.id === activeConversation)?.activity_title}
                            </span>
                          )}
                        </div>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_type === 'provider' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_type === 'provider'
                                ? 'bg-[#ededed] text-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{message.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <p>{t("dashboard.inbox.noMessages") || "No messages yet. Start the conversation!"}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("dashboard.inbox.typePlaceholder") || "Type your message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} className="flex-shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("dashboard.inbox.selectConversation") || "Select a conversation to start chatting"}</p>
                    {windowWidth < 768 && (
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={handleBackToList}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("dashboard.inbox.backToConversations") || "Back to conversations"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
