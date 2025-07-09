import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, User } from "lucide-react"
import { SupabaseActivity } from "@/services/supabaseActivityService"
import { User as SupabaseUser } from "@supabase/supabase-js"
import chatService, { ChatMessage } from "@/services/chatService"
import { useToast } from "@/hooks/use-toast"

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  activity: SupabaseActivity
  currentUser: SupabaseUser | null
}

export default function ChatModal({ isOpen, onClose, activity, currentUser }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = useCallback(async () => {
    if (!currentUser || !activity.activity_owners?.id) return
    
    setLoading(true)
    try {
      const chatMessages = await chatService.getMessages(
        currentUser.id,
        activity.activity_owners.id,
        activity.id
      )
      setMessages(chatMessages)
    } catch (error) {
      console.error("Error loading messages:", error)
      toast({
        title: "Error",
        description: "Failed to load chat messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, activity, toast])

  useEffect(() => {
    if (isOpen && currentUser && activity.activity_owners?.id) {
      loadMessages()
    }
  }, [isOpen, currentUser, activity, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !activity.activity_owners?.id) return

    setSending(true)
    try {
      const message = await chatService.sendMessage({
        sender_id: currentUser.id,
        receiver_id: activity.activity_owners.id,
        activity_id: activity.id,
        message: newMessage.trim(),
        sender_type: "customer"
      })

      setMessages(prev => [...prev, message])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    }
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat about {activity.title}
          </DialogTitle>
          <DialogDescription>
            {activity.activity_owners?.business_name ? 
              `Chat with ${activity.activity_owners.business_name}` : 
              "Chat with activity owner"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Activity Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{activity.title}</h4>
                <p className="text-sm text-gray-600">฿{(activity.price || 0).toLocaleString()}</p>
              </div>
              <Badge variant="secondary">{activity.category}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px] p-4 bg-gray-50 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation about this activity</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isCurrentUser = message.sender_id === currentUser.id
                const showDate = index === 0 || 
                  formatDate(message.created_at) !== formatDate(messages[index - 1]?.created_at)

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-4">
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {isCurrentUser ? "You" : activity.activity_owners?.business_name || "Owner"}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
