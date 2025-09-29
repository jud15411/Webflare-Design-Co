import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

interface Message {
  _id: string;
  sender: {
    user?: { _id: string; name: string };
    clientUser?: { _id: string; client: { clientName: string } };
  };
  text: string;
  timestamp: string;
}

interface ChatProps {
  projectId: string;
}

export const Chat: React.FC<ChatProps> = ({ projectId }) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Function to fetch historical messages
    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/api/v1/messages/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();

    // Establish WebSocket connection
    const wsUrl = `ws://${
      window.location.host.split(':')[0]
    }:5001?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to this project's chat channel
      ws.current?.send(JSON.stringify({ type: 'subscribe', projectId }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup on component unmount
    return () => {
      ws.current?.close();
    };
  }, [projectId, token]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ projectId, text: newMessage }));
      setNewMessage('');
    }
  };

  // Determine the sender's name for display
  const getSenderName = (message: Message) => {
    if (message.sender.user) return message.sender.user.name;
    if (message.sender.clientUser)
      return message.sender.clientUser.client.clientName + ' (Client)';
    return 'Unknown';
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-bubble ${
              msg.sender.user?._id === user?.id ? 'sent' : 'received'
            }`}>
            <div className="sender-name">{getSenderName(msg)}</div>
            <div className="message-text">{msg.text}</div>
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
