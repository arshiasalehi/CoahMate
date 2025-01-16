import React, { useEffect, useState } from 'react';
import { rdb, db, auth } from '../DB/firebase';
import { ref, onValue } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import ChatRoomPopupCoach from './ChatRoomPopupCoach.js';

const sanitizeString = (str) => str.replace(/[^a-zA-Z0-9-_\.]/g, '');

const ChatCoach = () => {
  const [clientChats, setClientChats] = useState([]);
  const [openChat, setOpenChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentSenderId, setCurrentSenderId] = useState(null);
  const [clientsInfo, setClientsInfo] = useState({});

  useEffect(() => {
    const fetchChats = () => {
      const currentUserId = sanitizeString(auth.currentUser.uid);
      const chatsRef = ref(rdb, 'chats');

      onValue(chatsRef, (snapshot) => {
        const chatsData = snapshot.val();
        if (chatsData) {
          const filteredChats = Object.keys(chatsData)
            .filter(chatId => 
              chatsData[chatId].participants &&
              chatsData[chatId].participants.includes(currentUserId)
            )
            .map(chatId => {
              const participants = chatsData[chatId].participants;
              const senderId = sanitizeString(participants.find(id => id !== currentUserId));
              return { id: sanitizeString(chatId), senderId, ...chatsData[chatId] };
            });

          setClientChats(filteredChats);
          fetchClientProfiles(filteredChats.map(chat => chat.senderId));
        } else {
          setClientChats([]);
        }
      });
    };

    const fetchClientProfiles = async (clientIds) => {
      const newClientsInfo = {};

      await Promise.all(
        clientIds.map(async (clientId) => {
          if (!clientsInfo[clientId]) { 
            const clientDoc = await getDoc(doc(db, 'users', clientId));
            if (clientDoc.exists()) {
              const clientData = clientDoc.data();
              newClientsInfo[clientId] = {
                email: clientData.email, 
                profilePic: clientData.fileURL || 'default-client.png', 
              };
            }
          }
        })
      );

      setClientsInfo(prevInfo => ({ ...prevInfo, ...newClientsInfo }));
    };

    fetchChats();
  }, [clientsInfo]);

  const handleChat = (chatId, senderId) => {
    setCurrentChatId(sanitizeString(chatId));
    setCurrentSenderId(sanitizeString(senderId));
    setOpenChat(true);
  };

  const closeChat = () => {
    setOpenChat(false);
    setCurrentChatId(null);
    setCurrentSenderId(null);
  };

  if (!clientChats.length) {
    return <div>No active chats.</div>;
  }

  return (
    <div className="connect-coach">
      <h2>Your Chats</h2>
      <div className="chat-list">
        {clientChats.map(chat => {
          const clientInfo = clientsInfo[chat.senderId] || {};
          return (
            <div key={chat.id} className="chat-box">
              <img
                src={clientInfo.profilePic}
                alt={`${clientInfo.email}'s Profile`} 
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              />
              <h3>{clientInfo.email || 'Client Email'}</h3> {/* Display email */}
              <button onClick={() => handleChat(chat.id, chat.senderId)}>
                Open Chat
              </button>
            </div>
          );
        })}
      </div>

      {openChat && currentChatId && currentSenderId && (
        <ChatRoomPopupCoach
          chatId={currentChatId}
          senderId={currentSenderId}
          onClose={closeChat}
        />
      )}
    </div>
  );
};

export default ChatCoach;
