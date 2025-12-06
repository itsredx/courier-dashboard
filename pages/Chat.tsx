import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Search, MoreVertical, Phone, Paperclip } from 'lucide-react';
import { mockApi } from '../services/mockService';
import { Conversation, ChatMessage } from '../types';

const Chat = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await mockApi.getConversations();
        setConversations(data || []);
        
        // Check if there is a state passed from navigation (e.g., from Riders page)
        const stateConvId = location.state?.conversationId;
        if (stateConvId) {
          setActiveConversationId(stateConvId);
        } else if (data && data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [location.state]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const loadMessages = async () => {
        try {
          const msgs = await mockApi.getMessages(activeConversationId);
          setMessages(msgs || []);
          
          // Reset unread count locally
          setConversations(prev => prev.map(c => 
            c.id === activeConversationId ? { ...c, unread_count: 0 } : c
          ));
        } catch (err) {
          console.error("Failed to load messages", err);
        }
      };
      loadMessages();
    }
  }, [activeConversationId]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    try {
      setSending(true);
      const sentMsg = await mockApi.sendMessage(activeConversationId, newMessage);
      setMessages(prev => [...prev, sentMsg]);
      setNewMessage('');
      
      // Update last message in conversation list
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId 
          ? { ...c, last_message: { content: sentMsg.content, timestamp: sentMsg.timestamp }, updated_at: sentMsg.timestamp }
          : c
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!conversation || !conversation.participants || conversation.participants.length === 0) return { username: 'Unknown', id: -1 };
    // Assuming admin ID is 999 as per mockService
    return conversation.participants.find(p => p.id !== 999) || conversation.participants[0];
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeParticipant = activeConversation ? getOtherParticipant(activeConversation) : null;

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search chat..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-4 text-center text-gray-500 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
             <div className="p-4 text-center text-gray-500 text-sm">No conversations yet.</div>
          ) : (
            conversations.map(conv => {
              const participant = getOtherParticipant(conv);
              const isActive = conv.id === activeConversationId;
              
              return (
                <button 
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isActive ? 'bg-indigo-50/60 border-indigo-100' : ''}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-50">
                      {participant.username.charAt(0)}
                    </div>
                    {conv.unread_count ? (
                       <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-semibold text-sm truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>{participant.username}</h4>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conv.unread_count ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                      {conv.last_message?.content || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveConversationId(null)} className="md:hidden text-gray-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                 </button>
                 {activeParticipant && (
                    <>
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {activeParticipant.username.charAt(0)}
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-900 text-sm">{activeParticipant.username}</h3>
                          <span className="text-xs text-green-600 flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                             Online
                          </span>
                       </div>
                    </>
                 )}
               </div>
               <div className="flex items-center gap-3 text-gray-400">
                  <button className="hover:text-indigo-600"><Phone size={20}/></button>
                  <button className="hover:text-gray-600"><MoreVertical size={20}/></button>
               </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
              {messages.map((msg, index) => {
                const isMe = msg.sender.id === 999; // Admin ID
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      <p>{msg.content}</p>
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
               <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip size={20} />
               </button>
               <input 
                 type="text"
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 placeholder="Type your message..."
                 className="flex-1 bg-gray-50 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
               />
               <button 
                 type="submit" 
                 disabled={sending || !newMessage.trim()}
                 className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                 <Send size={18} />
               </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
             <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                <Send size={32} />
             </div>
             <p className="font-medium text-gray-600">Select a conversation</p>
             <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
