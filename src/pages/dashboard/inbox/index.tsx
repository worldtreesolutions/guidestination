
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

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
  sender_name?: string
  sender_avatar?: string
}

interface Conversation {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
}

export default function InboxPage() {
  const { user } = useAuth()
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
      
      // This is a mock implementation - in a real app, you would fetch from Supabase
      // Example of how it might look with real data:
      /*
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      */
      
      // Mock data for demonstration
      const mockConversations: Conversation[] = [
        {
          id: "1",
          user_id: "activity-owner-1",
          user_name: "Mountain Trek Tours",
          user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          last_message: "When does the tour start tomorrow?",
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 2
        },
        {
          id: "2",
          user_id: "activity-owner-2",
          user_name: "Cooking Class Thailand",
          last_message: "We've updated the menu for your class",
          last_message_time: new Date(Date.now() - 86400000).toISOString(),
          unread_count: 1
        },
        {
          id: "3",
          user_id: "activity-owner-3",
          user_name: "Elephant Sanctuary",
          last_message: "Your booking is confirmed for next Monday",
          last_message_time: new Date(Date.now() - 172800000).toISOString(),
          unread_count: 0
        }
      ]
      
      setConversations(mockConversations)
      if (mockConversations.length > 0 && !activeConversation) {
        setActiveConversation(mockConversations[0].id)
      }
      setLoading(false)
    }

    fetchConversations()
  }, [user, activeConversation])

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation || !user) return

    const fetchMessages = async () => {
      // This is a mock implementation - in a real app, you would fetch from Supabase
      // Example of how it might look with real data:
      /*
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`(sender_id.eq.${user.id}.and.receiver_id.eq.${activeUser}),(sender_id.eq.${activeUser}.and.receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      */
      
      // Mock data for demonstration
      const mockMessages: Message[] = []
      
      if (activeConversation === "1") {
        mockMessages.push(
          {
            id: "m1",
            sender_id: user.id,
            receiver_id: "activity-owner-1",
            content: "Hi, I've booked your mountain trek tour for tomorrow",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            read: true
          },
          {
            id: "m2",
            sender_id: "activity-owner-1",
            receiver_id: user.id,
            content: "Hello! Yes, we're looking forward to having you join us.",
            created_at: new Date(Date.now() - 5400000).toISOString(),
            read: true,
            sender_name: "Mountain Trek Tours"
          },
          {
            id: "m3",
            sender_id: "activity-owner-1",
            receiver_id: user.id,
            content: "Please make sure to bring appropriate footwear and a water bottle.",
            created_at: new Date(Date.now() - 5300000).toISOString(),
            read: true,
            sender_name: "Mountain Trek Tours"
          },
          {
            id: "m4",
            sender_id: user.id,
            receiver_id: "activity-owner-1",
            content: "Great, thanks for the reminder. What time should I arrive?",
            created_at: new Date(Date.now() - 3700000).toISOString(),
            read: true
          },
          {
            id: "m5",
            sender_id: "activity-owner-1",
            receiver_id: user.id,
            content: "When does the tour start tomorrow?",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            sender_name: "Mountain Trek Tours"
          }
        )
      } else if (activeConversation === "2") {
        mockMessages.push(
          {
            id: "m6",
            sender_id: user.id,
            receiver_id: "activity-owner-2",
            content: "I have a question about the cooking class I booked",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            read: true
          },
          {
            id: "m7",
            sender_id: "activity-owner-2",
            receiver_id: user.id,
            content: "Of course, how can I help?",
            created_at: new Date(Date.now() - 172700000).toISOString(),
            read: true,
            sender_name: "Cooking Class Thailand"
          },
          {
            id: "m8",
            sender_id: "activity-owner-2",
            receiver_id: user.id,
            content: "We've updated the menu for your class",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            read: false,
            sender_name: "Cooking Class Thailand"
          }
        )
      } else if (activeConversation === "3") {
        mockMessages.push(
          {
            id: "m9",
            sender_id: "activity-owner-3",
            receiver_id: user.id,
            content: "Your booking is confirmed for next Monday",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            read: true,
            sender_name: "Elephant Sanctuary"
          },
          {
            id: "m10",
            sender_id: user.id,
            receiver_id: "activity-owner-3",
            content: "Thank you! I'm looking forward to it.",
            created_at: new Date(Date.now() - 172700000).toISOString(),
            read: true
          }
        )
      }
      
      setMessages(mockMessages)
      
      // Mark messages as read in a real app
      // await supabase.from('messages').update({ read: true }).match({ receiver_id: user.id, conversation_id: activeConversation })
    }

    fetchMessages()
  }, [activeConversation, user])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return

    const activeConvo = conversations.find(c => c.id === activeConversation)
    if (!activeConvo) return

    // In a real app, you would save to Supabase
    // const { data, error } = await supabase.from('messages').insert({
    //   sender_id: user.id,
    //   receiver_id: activeConvo.user_id,
    //   content: newMessage,
    //   conversation_id: activeConversation,
    //   created_at: new Date().toISOString(),
    //   read: false
    // })

    // Mock implementation
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender_id: user.id,
      receiver_id: activeConvo.user_id,
      content: newMessage,
      created_at: new Date().toISOString(),
      read: false
    }

    setMessages([...messages, newMsg])
    setNewMessage("")

    // Update conversation last message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          last_message: newMessage,
          last_message_time: new Date().toISOString()
        }
      }
      return conv
    })
    setConversations(updatedConversations)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
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
          <p>Please log in to view your inbox</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Conversation List - Conditionally shown on mobile */}
          {(showConversationList || windowWidth >= 768) && (
            <Card className="md:w-80 flex-shrink-0 border-r md:rounded-r-none h-full">
              <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>Chat with activity providers</CardDescription>
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
                          <p className="font-medium truncate">{conversation.user_name}</p>
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
                      <p>No conversations yet</p>
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
                        {conversations.find(c => c.id === activeConversation)?.user_name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_id === user.id 
                                ? 'bg-[#ededed] text-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
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
                    <p>Select a conversation to start chatting</p>
                    {windowWidth < 768 && (
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={handleBackToList}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to conversations
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
