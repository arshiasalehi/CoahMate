import React, { useState } from 'react';
import Signin from './signin';
import Signup from './signup';
import AboutUs from './aboutus';
import ForgotPassword from './ForgotPassword'; 
import '../App.css';

const LoginPopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState(''); 

  const renderContent = () => {
    switch (activeTab) {
      case 'login':
        return (
          <Signin
            onClose={onClose}
            onSwitchToForgot={(email) => {
              setEmail(email);
              setActiveTab('forgot'); 
            }}
          />
        );
      case 'signup':
        return <Signup onClose={onClose} />;
      case 'about':
        return <AboutUs />;
      case 'forgot':
        return <ForgotPassword email={email} onClose={onClose} />; 
      default:
        return <Signin onClose={onClose} />;
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content-large">
        <nav className="popup-nav">
          <button
            className={activeTab === 'login' ? 'active-tab' : ''}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={activeTab === 'signup' ? 'active-tab' : ''}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
          <button
            className={activeTab === 'about' ? 'active-tab' : ''}
            onClick={() => setActiveTab('about')}
          >
            Help Center
          </button>
          <button onClick={onClose}>Close</button>
        </nav>
        <div className="popup-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
