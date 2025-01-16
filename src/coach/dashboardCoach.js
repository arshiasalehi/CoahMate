import React, { useEffect, useState } from 'react';
import { auth, db } from '../DB/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProfilePopupCoach from './ProfilePopupCoach';  
import '../App.css';

const DashboardCoach = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false); 
   const [walletAmount, setWalletAmount] = useState(0);
  const [schedule, setSchedule] = useState([]); 

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setWalletAmount(data.wallet || 0); 
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-coach">
     
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
      <div className="dashboard-box">
        <h3>Wallet</h3>
        <p>${walletAmount}</p>
        
        <button className="withdraw">withdraw</button>

      </div>
      <div className="dashboard-box">
        <h3>Schedule</h3>
        {schedule.length > 0 ? (
          <ul>
            {schedule.map((item, index) => (
              <li key={index}>{item.date} - {item.time}: {item.description}- ${Number(item.price)}</li>
            ))}
          </ul>
        ) : (
          <p>No scheduled appointments.</p>
        )}
      </div>
      {isProfilePopupOpen && <ProfilePopupCoach onClose={handleCloseProfilePopup} userData={userData} />}
    </div>
  );
};

export default DashboardCoach;