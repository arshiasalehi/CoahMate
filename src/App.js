import React, { useState, useEffect } from 'react';
import DashboardClient from './client/dashboardClient'; 
import DashboardCoach from './coach/dashboardCoach';
import ConnectCoach from './coach/connectCoach';
import DucCoach from './coach/ducCoach';
import LoginPopup from './login/LoginPopup'; 
import CoachChat from './coach/chatCoach';
import ClientChat from './client/chatClient';
import './App.css';
import { auth, db } from './DB/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProvider } from './DB/UserContext';
import DucClient from './client/ducClient';
import ConnectClient from './client/connectClient';

function App() {
  const [showLoginPopup, setShowLoginPopup] = useState(true); 
  const [selectedCategory, setSelectedCategory] = useState('Home');
  const [userRole, setUserRole] = useState(null); 
  const [isInitialized, setIsInitialized] = useState(false); 

  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (!showLoginPopup) {
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
          }
        }
        setIsInitialized(true); 
      }
    };

    initializeApp();
  }, [showLoginPopup]); 

  const renderContent = () => {
    switch (userRole) {
      case 'client': 
        switch (selectedCategory) {
          case 'dashboard':
            return <DashboardClient />;
          case 'Category 1':
            return <ClientChat />;
          case 'Category 2':
            return <DucClient />;
          case 'Category 3':
            return <ConnectClient />;
          default:
            return <div style={{ textAlign: 'center', padding: '20px' }}>
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/coachmate-cd46e.appspot.com/o/coachmatelogo.png?alt=media&token=192c0dbe-b5a5-4e05-a73d-5461170b961b" 
              alt="logo"
              style={{ maxWidth: '50%', height: 'auto' }}
            />
          </div>;
        }

      case 'coach':
        switch (selectedCategory) {
          case 'dashboard':
            return <DashboardCoach />;
          case 'Category 1':
            return <CoachChat />;
          case 'Category 2':
            return <DucCoach />;
          case 'Category 3':
            return <ConnectCoach />;
          default:
            return <div style={{ textAlign: 'center', padding: '20px' }}>
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/coachmate-cd46e.appspot.com/o/coachmatelogo.png?alt=media&token=192c0dbe-b5a5-4e05-a73d-5461170b961b" 
              alt="logo"
              style={{ maxWidth: '50%', height: 'auto' }}
            />
          </div>;
        }

      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <UserProvider>
      <div className="container">
        {/* Show the login popup when showLoginPopup is true */}
        {showLoginPopup && <LoginPopup onClose={handleClosePopup} />}

        {/* Show the main content only after initialization is complete */}
        {isInitialized && (
          <>
            <div className="sidebar">
              <h3>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/coachmate-cd46e.appspot.com/o/coachmatelogo.png?alt=media&token=192c0dbe-b5a5-4e05-a73d-5461170b961b" 
                    alt="logo"
                    style={{ maxWidth: '50%', height: 'auto' }}
                  />
                </div>
              </h3>
              <ul>
                <li onClick={() => setSelectedCategory('dashboard')}>Dashboard</li>
                <li onClick={() => setSelectedCategory('Category 1')}>Chat</li>
                <li onClick={() => setSelectedCategory('Category 2')}>Document</li>
                <li onClick={() => setSelectedCategory('Category 3')}>Network</li>
              </ul>
            </div>

            <div className="content">
              {renderContent()} 
            </div>
          </>
        )}
      </div>
    </UserProvider>
  );
}

export default App;
