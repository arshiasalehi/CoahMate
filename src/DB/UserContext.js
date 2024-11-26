// UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Create the UserContext
const UserContext = createContext();

// Custom hook to use UserContext
export const useUser = () => useContext(UserContext);

// UserProvider component that wraps around the main App component
export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || null);
        }
      }
      setLoading(false);
    };

    fetchUserRole();

    // Listen for auth changes and fetch role if needed
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserRole();
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Provide userRole and loading state to components
  return (
    <UserContext.Provider value={{ userRole, loading }}>
      {children}
    </UserContext.Provider>
  );
};