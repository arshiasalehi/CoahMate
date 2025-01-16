import React, { useEffect, useState } from 'react';
import { auth, db } from '../DB/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProfilePopupClient from './ProfilePopupClient';
import '../App.css';


const DashboardClient = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setWallet(data.wallet || 0);
          setSchedule(data.schedule || []);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleProfileClick = () => {
    setIsProfilePopupOpen(true);
  };

  const handleCloseProfilePopup = () => {
    setIsProfilePopupOpen(false);
  };

  const loadStripeScript = () => {
   
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    script.onload = () => console.log("Stripe script loaded successfully!");
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadStripeScript();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-client">
      
      {/* Profile Picture */}
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button onClick={handleProfileClick} className="profile-button">
          {userData?.fileURL ? (
            <img
              src={userData.fileURL}
              alt="profile"
              className="profile-image"
            />
          ) : (
            <p>No profile picture available</p>
          )}
        </button>
      </div>

      <div className="wallet">
        <h3>Wallet</h3>
        <h4>${userData?.wallet}</h4>

        {/* Stripe Buy Button */}
        <div id="stripe-buy-button-container" style={{ marginTop: '10px' }}>
          <stripe-buy-button
            buy-button-id="buy_btn_1QF2iCF9QtEYmFjuM1YzAefr"
            publishable-key="pk_test_51QF2SLF9QtEYmFjuhKpM35jLbKYEq56KSCLrvNVVkKfqrNUcmIe49OQaWf3oGe8SY2BaHVO9gAiEUmClIA8w2nXD00pCNpV5wM"
          ></stripe-buy-button>
        </div>
      </div>

      <div className="schedule">
        <h3>Schedule</h3>
        {schedule.length > 0 ? (
          <ul>
            {schedule.map((item, index) => (
              <li key={index}>
                {item.date} - {item.time}: {item.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No schedule.</p>
        )}
      </div>

      {isProfilePopupOpen && <ProfilePopupClient onClose={handleCloseProfilePopup} userData={userData} />}
    </div>
  );
};

export default DashboardClient;
