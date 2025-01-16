import React, { useEffect, useState, useRef } from 'react';
import { rdb, auth } from '../DB/firebase';
import { ref, onValue, set } from 'firebase/database';
import '../App.css';

const ChatRoomPopup = ({ coachId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const chatId = `${auth.currentUser.uid}_${coachId}`;
    const messagesRef = ref(rdb, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesArray);
        scrollToBottom();
      }
    }, (error) => {
      console.error("Error fetching messages: ", error);
    });

    return () => unsubscribe(); 
  }, [coachId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (messageText.trim() === '') return;

    const chatId = `${auth.currentUser.uid}_${coachId}`;
    const newMessageRef = ref(rdb, `chats/${chatId}/messages/${Date.now()}`);

    try {
      await set(newMessageRef, {
        senderId: auth.currentUser.uid,
        text: messageText,
        timestamp: Date.now(),
      });
      setMessageText(''); 
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="chat-popup">
      <button onClick={onClose}>Close Chat</button>
      <h3>Chat with Coach</h3>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.senderId === auth.currentUser.uid ? 'message-sent' : 'message-received'}>
            <p>{msg.text}</p>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoomPopup;
