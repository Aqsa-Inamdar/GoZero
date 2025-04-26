import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Chat, Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatPreview from "@/components/ChatPreview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface EnrichedChat extends Chat {
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  otherUser: {
    id: number;
    name: string;
    profileImage?: string;
  };
  item?: {
    id: number;
    title: string;
    images?: string[];
  };
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<EnrichedChat | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats = [], isLoading: isLoadingChats } = useQuery<EnrichedChat[]>({
    queryKey: ["/api/users", user?.id, "chats"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/chats`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    },
    enabled: !!user,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedChat?.id, "messages"],
    queryFn: async () => {
      if (!selectedChat) return [];
      const res = await fetch(`/api/chats/${selectedChat.id}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedChat,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !selectedChat) throw new Error("User or chat not selected");
      return apiRequest("POST", "/api/messages", {
        chatId: selectedChat.id,
        senderId: user.id,
        content
      });
    },
    onSuccess: () => {
      // Clear the input
      setMessageText("");
      
      // Invalidate the messages query to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/chats", selectedChat?.id, "messages"] });
      
      // Invalidate the chats query to update last message
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "chats"] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom of messages when they change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessageMutation.mutate(messageText);
  };

  const handleChatSelect = (chat: EnrichedChat) => {
    setSelectedChat(chat);
  };

  return (
    <div id="chat-view" className="h-screen flex flex-col">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      
      <div className="p-4 flex-1 overflow-hidden">
        <div className="h-full md:flex md:space-x-4">
          {/* Chat List - Mobile: Full when no chat is selected, Hidden when chat is selected */}
          <div className={`${selectedChat ? 'hidden md:block' : ''} md:w-1/3 bg-white rounded-lg shadow-md overflow-hidden h-full`}>
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Active Conversations</h3>
            </div>
            
            <ScrollArea className="h-[calc(100%-56px)]">
              {isLoadingChats ? (
                // Loading skeletons
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="p-4 border-b border-neutral-100">
                    <div className="flex items-center">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="ml-3 flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </div>
                ))
              ) : chats.length === 0 ? (
                // No chats state
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                    <i className="fas fa-comments text-neutral-400 text-3xl"></i>
                  </div>
                  <h3 className="mt-4 font-medium text-neutral-800">No Messages Yet</h3>
                  <p className="mt-2 text-neutral-600">When you connect with other users, your conversations will appear here.</p>
                  <Button className="mt-6" asChild>
                    <a href="/">Discover Items</a>
                  </Button>
                </div>
              ) : (
                // Chat list
                chats.map((chat) => (
                  <ChatPreview
                    key={chat.id}
                    id={chat.id}
                    otherUser={chat.otherUser}
                    lastMessage={chat.lastMessage}
                    itemTitle={chat.item?.title}
                    onClick={() => handleChatSelect(chat)}
                    active={selectedChat?.id === chat.id}
                  />
                ))
              )}
            </ScrollArea>
          </div>
          
          {/* Chat Detail - Mobile: Full when chat is selected, Hidden when no chat is selected */}
          {selectedChat ? (
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-200 flex items-center">
                <button 
                  className="mr-2 md:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                  {selectedChat.otherUser.profileImage ? (
                    <img 
                      src={selectedChat.otherUser.profileImage} 
                      alt={selectedChat.otherUser.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-neutral-400"></i>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <h4 className="font-medium">{selectedChat.otherUser.name}</h4>
                  {selectedChat.item && (
                    <p className="text-sm text-neutral-500">
                      Re: {selectedChat.item.title}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                      <i className="fas fa-comment-dots text-neutral-400 text-2xl"></i>
                    </div>
                    <h3 className="mt-4 font-medium text-neutral-800">No messages yet</h3>
                    <p className="mt-2 text-neutral-600">Send the first message to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            message.senderId === user?.id
                              ? "bg-primary-500 text-white"
                              : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id
                              ? "text-primary-100"
                              : "text-neutral-500"
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-4 border-t border-neutral-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit"
                    disabled={sendMessageMutation.isPending || !messageText.trim()}
                  >
                    {sendMessageMutation.isPending ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="hidden md:block md:flex-1 bg-neutral-100 rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-comments text-neutral-400 text-3xl"></i>
                </div>
                <h3 className="mt-4 font-medium text-neutral-700">Select a conversation</h3>
                <p className="mt-2 text-neutral-500">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
