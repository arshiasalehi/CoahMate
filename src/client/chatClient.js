import React, { useEffect, useState } from 'react';
import { auth, rdb, db } from '../DB/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import ChatRoomPopup from './chatroompopup';
import '../App.css';

const ChatClient = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientWallet, setClientWallet] = useState(0);
  const [openChat, setOpenChat] = useState(false);
  const [currentCoachId, setCurrentCoachId] = useState(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coachesCollection = collection(db, 'users');
        const coachSnapshot = await getDocs(coachesCollection);
        
        const coachList = coachSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === 'coach');

        setCoaches(coachList);
      } catch (error) {
        console.error("Error fetching coaches: ", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchClientWallet = async () => {
      if (auth.currentUser) {
        const clientRef = ref(rdb, `users/${auth.currentUser.uid}`);
        const clientSnapshot = await get(clientRef);
        if (clientSnapshot.exists()) {
          const clientData = clientSnapshot.val();
          setClientWallet(clientData.wallet || 0);
        }
      }
    };

    fetchCoaches();
    fetchClientWallet();
  }, []);

  const handleChat = async (coachId) => {
    if (!auth.currentUser) return;

    const clientId = auth.currentUser.uid;
    const chatId = clientId < coachId ? `${clientId}_${coachId}` : `${coachId}_${clientId}`;

    const chatRef = ref(rdb, `chats/${chatId}`);
    const chatSnapshot = await get(chatRef);
    
    if (!chatSnapshot.exists()) {
      await set(chatRef, {
        participants: [clientId, coachId],
        messages: [],
      });
      console.log(`New chat created with chat ID: ${chatId}`);
    } else {
      console.log(`Chat already exists for chat ID: ${chatId}`);
    }

    setCurrentCoachId(coachId);
    setOpenChat(true);
  };

  const closeChat = () => {
    setOpenChat(false);
    setCurrentCoachId(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="connect-client">
      <h2>Choose Your Coach</h2>
      <div className="coaches-list">
        
        {coaches.length > 0 ? (
          coaches.map((coach) => (
            <div key={coach.id} className="coach-box">
              <img
                src={coach.fileURL || 'default-coach.png'} // Fallback image if no fileURL
                alt={`${coach.name}'s Profile`}
                style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '15px' }}
              />
              <h3>{coach.name}</h3>
              <button onClick={() => handleChat(coach.id)}>
                Chat with {coach.name}
              </button>
            </div>
            

          ))
        ) : (
          <p>No coaches available.</p>
        )}
      </div>

      {openChat && currentCoachId && (
        <ChatRoomPopup
          coachId={currentCoachId}
          onClose={closeChat}
        />
      )}
    </div>
  );
};

export default ChatClient;
