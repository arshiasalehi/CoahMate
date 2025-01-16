import React, { useEffect, useState, useRef } from 'react';
import { rdb, db, auth } from '../DB/firebase';
import { ref, onValue, push } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import '../App.css';

const ChatRoomPopupCoach = ({ chatId, senderId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchSenderEmail = async () => {
    
      const userDoc = await getDoc(doc(db, 'users', senderId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSenderEmail(userData.email); 
      }
    };

    if (senderId) {
      fetchSenderEmail().catch(console.error);
    }
  }, [senderId]);

  useEffect(() => {
    if (chatId) {
      const messagesRef = ref(rdb, `chats/${chatId}/messages`);

      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        const loadedMessages = messagesData ? Object.values(messagesData).sort((a, b) => a.timestamp - b.timestamp) : [];
        setMessages(loadedMessages);
        scrollToBottom();
      });

      return () => unsubscribe(); 
    }
  }, [chatId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messagesRef = ref(rdb, `chats/${chatId}/messages`);
      const message = {
        sender: auth.currentUser.uid,
        recipient: senderId,
        text: newMessage,
        timestamp: Date.now(),
      };
      
      push(messagesRef, message);
      setNewMessage(''); 
    }
  };

  return (
    <div className="chat-room-popup">
      <button onClick={onClose}>Close Chat</button>
      <h3>Chat with {senderEmail || 'Loading...'}</h3> {/* Display sender email */}
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === auth.currentUser.uid ? 'sent' : 'received'}`}>
            <p>{message.text}</p>
            <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoomPopupCoach;
